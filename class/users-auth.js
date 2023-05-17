let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $dbTemporary } = require(global.ROOT_PATH + '/plugins/db-temporary');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let { v4: uuidv4 } = require('uuid');
let jwt = require('jsonwebtoken');
let { IS_DEMO_MODE } = process.env;

class UsersAuth {
  async login({ email, password, userAgent = '', ip, response }) {
    // Empty email
    if (!email) {
      $utils['errors'].validationMessage({
        path: 'email',
        message: $t('This field cannot be empty'),
      });
    }

    // Incorrect login
    let user = await $dbMain['users'].getUserByEmail({ email });
    if (!user) {
      $utils['errors'].validationMessage({
        path: 'auth',
        message: $t('Incorrect login or password'),
      });
    }

    // Trying to log in from multiple devices (if there is an exit date and it has not expired, then the user tries to log in from 2 devices)
    if (this.сheckSessionExpiration({ dateEntry: user?.dateEntry })) {
      await $dbMain['users-auth'].createRecord({
        sessionId: user.sessionId,
        userId: user.userId,
        email,
        ip,
        password,
        userAgent,
        type: 'another-device',
      });

      $utils['errors'].validationMessage({
        path: 'auth',
        message: $t('Auth error'),
      });
    }

    // Brute force protection
    if (user) {
      await $dbMain['users-auth'].createRecord({
        sessionId: user.sessionId,
        userId: user.userId,
        email,
        ip,
        userAgent,
        type: 'incorrect',
      });

      await this.editUserLoginAttempt({
        userId: user.userId,
        countLoginAttempt: user.countLoginAttempt,
        dateLoginAttempt: user.dateLoginAttempt,
      });
    }

    // Incorrect password
    if (password !== user.password) {
      await $dbMain['users-auth'].createRecord({
        sessionId: null,
        userId: user.userId,
        email,
        ip,
        userAgent,
        type: 'incorrect',
      });

      $utils['errors'].validationMessage({
        path: 'auth',
        message: $t('Incorrect login or password'),
      });
    }

    let sessionId = await this.setAuthData({ userId: user.userId, userAgent, response });

    await $dbMain['users-auth'].createRecord({
      sessionId,
      userId: user.userId,
      email,
      ip,
      userAgent,
      type: 'login',
    });

    return true;
  }

  // Check auth user
  async checkAuth({ sessionId, userId, userAgent, ip }) {
    // Empty
    if (!sessionId) {
      await $dbMain['users-auth'].createRecord({
        sessionId,
        userId,
        email: null,
        ip,
        userAgent,
        type: 'check-auth-error',
      });

      $utils['errors'].validationMessage({
        path: 'auth',
        message: $t('Auth error'),
      });
    }

    let dbData = await $dbMain['users'].getUserByUserId({ userId });
    let isValidSessionExpiration = this.сheckSessionExpiration({ dateEntry: dbData?.dateEntry });

    // Wrong data
    if (
      !isValidSessionExpiration ||
      sessionId !== dbData.sessionId ||
      userAgent !== dbData.userAgent
    ) {
      await $dbMain['users-auth'].createRecord({
        sessionId,
        userId,
        email: null,
        ip,
        userAgent,
        type: 'check-auth-error',
      });

      $utils['errors'].validationMessage({
        path: 'auth',
        message: $t('Auth error'),
      });
    }

    return true;
  }

  // Set auth data
  async setAuthData({ userId, userAgent, response }) {
    let sessionId = this.createSessionId();

    await $dbMain['users'].editUserAuth({
      userId,
      userAgent,
      sessionId,
    });

    let token = await this.createUserToken({
      data: { sessionId, userId },
      expiresIn: global.$config['users'].sessionMaxAge,
    });

    await this.setAuthCookies({ token, response });

    return sessionId;
  }

  // Set auth data - Mode demo
  async setAuthDataModeDemo({ response }) {
    let { emailDemo, userAgentDemo, sessionIdDemo } = global.$config['users'];
    let { userId } = await $dbMain['users'].getUserByEmail({ email: emailDemo });
    await $dbMain['users'].editUserAuth({
      userId,
      userAgent: userAgentDemo,
      sessionId: sessionIdDemo,
    });

    let token = await this.createUserToken({
      data: { sessionId: sessionIdDemo, userId },
      expiresIn: null,
    });

    await this.setAuthCookies({ token, response });
  }

  // Auth refresh
  async authRefresh({ sessionId, userId, userAgent, response, ip }) {
    // Create cookie Demo mode only
    if (IS_DEMO_MODE) {
      await this.setAuthDataModeDemo({ response });
      return true;
    }

    // Empty
    if (!sessionId) {
      await $dbMain['users-auth'].createRecord({
        sessionId,
        userId,
        email: null,
        ip,
        userAgent,
        type: 'refresh-incorrect',
      });

      $utils['errors'].validationMessage({
        path: 'auth',
        message: $t('Auth error'),
      });
    }

    let user = await $dbMain['users'].getUserByUserId({ userId });

    // Incorrect
    if (sessionId !== user.sessionId || userAgent !== user.userAgent) {
      await $dbMain['users-auth'].createRecord({
        sessionId,
        userId,
        email: null,
        ip,
        userAgent,
        type: 'refresh-incorrect',
      });

      this.clearAuthCookies({ response });
      $utils['errors'].validationMessage({
        path: 'auth',
        message: $t('Auth error'),
      });
    }

    // Token expired
    if (!this.сheckSessionExpiration({ dateEntry: user?.dateEntry })) {
      await this.logOut({ sessionId, userId, userAgent, ip, response });

      await $dbMain['users-auth'].createRecord({
        sessionId,
        userId,
        email: null,
        ip,
        userAgent,
        type: 'refresh-log-out',
      });
      return false;
    }

    // Success - Refres session id
    sessionId = await this.setAuthData({ userId: user.userId, userAgent, response });
    // We do not create records for successful refreshes
    // await $dbMain['users-auth'].createRecord({
    //   sessionId,
    //   userId: user.userId,
    //   email: null,
    //   ip,
    //   userAgent,
    //   type: 'refresh',
    // });

    return true;
  }

  // Session Expiration Check
  сheckSessionExpiration({ dateEntry }) {
    if (!dateEntry) {
      return false;
    }

    let dateEntryMs = new Date(dateEntry).getTime();
    let dateCurrent = new Date().getTime();

    if (dateCurrent - dateEntryMs < global.$config['users'].sessionMaxAge * 1000) {
      return true;
    }
    return false;
  }

  // Log out user
  async logOut({ sessionId, userId, userAgent, ip, response }) {
    this.clearAuthCookies({ response });
    await $dbMain['users'].editUserLogOut({
      sessionId,
      userId,
      userAgent,
    });

    await $dbMain['users-auth'].createRecord({
      sessionId,
      userId,
      email: null,
      ip,
      userAgent,
      type: 'log-out',
    });

    return true;
  }

  // Log out all users
  async logOutAllUsers() {
    await $dbMain['users'].editUsersAllLogOut();
    return true;
  }

  // Update count login attempt
  async editUserLoginAttempt({ userId, countLoginAttempt, dateLoginAttempt }) {
    const loginAttempTimaut = global.$config['users'].loginAttempTimaut * 1000;
    let dateCurrent = new Date().getTime();
    let dateLoginAttemptMs = dateLoginAttempt ? new Date(dateLoginAttempt).getTime() : 0;

    if (dateCurrent - dateLoginAttemptMs > loginAttempTimaut) {
      countLoginAttempt = 1;
    } else {
      countLoginAttempt = countLoginAttempt + 1;
    }

    let result = await $dbMain['users'].editUserLoginAttempt({
      userId,
      countLoginAttempt,
      dateLoginAttempt: new Date(),
    });

    return result;
  }

  // Create session Id
  createSessionId() {
    return (
      uuidv4() + `-${(((Math.random() * Math.random()) / Math.random()) * Date.now()) / 1000000}`
    );
  }

  // Set cookies (The frontend will send a session refresh request every 5 minutes. In order not to take into account the time zone, set the lifetime to 2 days)
  async setAuthCookies({ token, response }) {
    response.cookie(global.$config['users'].cookieToken, token, {
      maxAge: 3600 * 48 * 1000,
      httpOnly: true,
      secure: true,
    });
  }

  // Create token
  async createUserToken({ data, expiresIn }) {
    let tokenSecretKey = await $dbTemporary['api'].getTokenUserSecretKey();
    expiresIn = expiresIn ? { expiresIn } : {};
    let token = jwt.sign(
      {
        data,
      },
      tokenSecretKey,
      expiresIn
    );

    return token;
  }

  // Clear cookies
  clearAuthCookies({ response }) {
    response.cookie(global.$config['users'].cookieToken, '', {
      maxAge: 0,
    });
  }
}

module.exports = UsersAuth;
