let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let { v4: uuidv4 } = require('uuid');

class UserLogin {
  async auth({ email, password, userAgent = '', ip, response }) {
    if (!email) {
      throw {
        errors: [
          {
            path: 'email',
            message: $errors['This field cannot be empty'],
          },
        ],
      };
    }

    password = $utils['user'].encryptPassword(password);

    let user = await $dbMain['users'].getUserByEmail({ email });

    // Trying to log in from multiple devices
    if (this.сheckSessionExpiration({ dateEntry: user?.dateEntry })) {
      await $dbMain['users-auth'].createAuth({
        sessionId: user.sessionId,
        userId: user.userId,
        email,
        ip,
        password,
        userAgent,
        type: 'another-device',
      });

      throw {
        errors: [
          {
            path: 'auth',
            message: $errors['Server error'],
          },
        ],
      };
    }

    // Brute force protection
    if (user) {
      await $dbMain['users-auth'].createAuth({
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

    // Incorrect auth data
    if (!user || !password || password !== user.password) {
      await $dbMain['users-auth'].createAuth({
        sessionId: user.sessionId || null,
        userId: user.userId || 0,
        email,
        ip,
        userAgent,
        type: 'incorrect',
      });

      throw {
        errors: [
          {
            path: 'auth',
            message: $errors['Incorrect login or password'],
          },
        ],
      };
    }

    let sessionId = await this.setAuthData({ userId: user.userId, userAgent, response });

    await $dbMain['users-auth'].createAuth({
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
  async checkAuth({ token, userAgent, ip }) {
    let tokenData = await $utils['user'].getTokenData({ token });

    // Empty
    if (!tokenData) {
      await $dbMain['users-auth'].createAuth({
        sessionId: null,
        userId: 0,
        email: null,
        ip,
        userAgent,
        type: 'check-auth-error',
      });

      throw {
        errors: [
          {
            path: 'auth',
            message: $errors['Auth error'],
          },
        ],
      };
    }

    let dbData = await $dbMain['users'].getUserByUserId({ userId: tokenData.userId });
    let isValidSessionExpiration = this.сheckSessionExpiration({ dateEntry: dbData?.dateEntry });

    // Wrong data
    if (
      !isValidSessionExpiration ||
      tokenData.sessionId !== dbData.sessionId ||
      userAgent !== dbData.userAgent
    ) {
      await $dbMain['users-auth'].createAuth({
        sessionId: tokenData.sessionId || null,
        userId: tokenData.userId || 0,
        email: null,
        ip,
        userAgent,
        type: 'check-auth-error',
      });

      throw {
        errors: [
          {
            path: 'auth',
            message: $errors['Auth error'],
          },
        ],
      };
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

    await this.setAuthCookies({ sessionId, userId, response });

    return sessionId;
  }

  // Refresh auth
  async refreshAuth({ token, userAgent, response, ip }) {
    let tokenData = await $utils['user'].getTokenData({ token });
    // Empty
    if (!tokenData) {
      await $dbMain['users-auth'].createAuth({
        sessionId: null,
        userId: 0,
        email: null,
        ip,
        userAgent,
        type: 'refresh-incorrect',
      });

      throw {
        errors: [
          {
            path: 'auth',
            message: $errors['Server error'],
          },
        ],
      };
    }

    let { userId, sessionId } = tokenData;

    let user = await $dbMain['users'].getUserByUserId({ userId });

    if (!sessionId || sessionId !== user.sessionId || userAgent !== user.userAgent) {
      await $dbMain['users-auth'].createAuth({
        sessionId: sessionId || null,
        userId: userId || 0,
        email: null,
        ip,
        userAgent,
        type: 'refresh-incorrect',
      });

      this.clearAuthCookies({ response });
      throw {
        errors: [
          {
            path: 'auth',
            message: $errors['Server error'],
          },
        ],
      };
    }

    // Refres session id
    if (this.сheckSessionExpiration({ dateEntry: user?.dateEntry })) {
      let sessionId = await this.setAuthData({ userId: user.userId, userAgent, response });

      await $dbMain['users-auth'].createAuth({
        sessionId,
        userId: user.userId,
        email: null,
        ip,
        userAgent,
        type: 'refresh',
      });
    } else {
      await this.logOut({ token, userAgent, ip, response });

      await $dbMain['users-auth'].createAuth({
        sessionId,
        userId,
        email: null,
        ip,
        userAgent,
        type: 'refresh-log-out',
      });

      return false;
    }
    return true;
  }

  // Session Expiration Check
  сheckSessionExpiration({ dateEntry }) {
    if (!dateEntry) {
      return false;
    }

    let dateEntryMs = new Date(dateEntry).getTime();
    let dateCurrent = new Date().getTime();

    if (dateCurrent - dateEntryMs < $config.users.sessionMaxAge * 1000) {
      return true;
    }
    return false;
  }

  // Log out user
  async logOut({ token, userAgent, ip, response }) {
    let tokenData = await $utils['user'].getTokenData({ token });

    this.clearAuthCookies({ response });

    if (!tokenData) return true;

    let { sessionId, userId } = tokenData;

    if (!sessionId || !userId || !userAgent) return true;

    await $dbMain['users'].editUserLogOut({
      sessionId,
      userId,
      userAgent,
    });

    await $dbMain['users-auth'].createAuth({
      sessionId,
      userId,
      email: null,
      ip,
      userAgent,
      type: 'log-out',
    });

    return true;
  }

  // Update count login attempt
  async editUserLoginAttempt({ userId, countLoginAttempt, dateLoginAttempt }) {
    const loginAttempTimaut = $config.users.loginAttempTimaut * 1000;
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
  async setAuthCookies({ sessionId, userId, response }) {
    let token = await $utils['user'].createToken({
      data: { sessionId, userId },
      expiresIn: $config.users.sessionMaxAge,
    });
    response.cookie($config.users.cookieToken, token, {
      maxAge: 3600 * 48 * 1000,
      httpOnly: true,
      secure: true,
    });
  }

  // Clear cookies
  clearAuthCookies({ response }) {
    response.cookie($config.users.cookieToken, '', {
      maxAge: 0,
    });
  }
}

module.exports = UserLogin;
