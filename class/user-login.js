let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let crypto = require('crypto');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { v4: uuidv4 } = require('uuid');
const sessionIdMaxAge = $config.users.sessionIdMaxAge * 1000;

class UserLogin {
  async auth({ mail, password, userAgent = '', ip, response }) {
    password = this.encryptPassword(password);

    let user = await $dbMain['users'].getUserByMail({ mail });

    // Trying to log in from multiple devices
    if (this.сheckSessionExpiration({ dateEntry: user?.dateEntry })) {
      await $dbMain['users-auth'].createAuth({
        mail,
        ip,
        password,
        userAgent,
        sessionId: null,
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
        mail,
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
        mail,
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

    await this.setAuthData({ userId: user.userId, userAgent, response });

    await $dbMain['users-auth'].createAuth({
      mail,
      ip,
      userAgent,
      type: 'login',
    });

    return true;
  }

  // Check auth user
  async checkAuth({ userId, sessionId, userAgent, ip }) {
    let user = await $dbMain['users'].getUserByUserId({ userId });

    let isValidSessionExpiration = this.сheckSessionExpiration({ dateEntry: user?.dateEntry });

    if (!isValidSessionExpiration || sessionId !== user.sessionId || userAgent !== user.userAgent) {
      await $dbMain['users-auth'].createAuth({
        mail: null,
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

    this.setAuthCookies({ sessionId, userId, response });
  }

  // Create user
  async createUser({ mail, password }) {
    password = this.encryptPassword(password);
    let result = await $dbMain['users'].createUser({ mail, password });
    return result;
  }

  // Refresh auth
  async refreshAuth({ userId = 0, sessionId, userAgent, response, ip }) {
    let user = await $dbMain['users'].getUserByUserId({ userId });

    if (!sessionId || sessionId !== user.sessionId || userAgent !== user.userAgent) {
      await $dbMain['users-auth'].createAuth({
        mail: null,
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
      await this.setAuthData({ userId: user.userId, userAgent, response });

      await $dbMain['users-auth'].createAuth({
        mail: null,
        ip,
        userAgent,
        type: 'refresh',
      });
    } else {
      await this.logOut({ sessionId, userId, userAgent, response });

      await $dbMain['users-auth'].createAuth({
        mail: null,
        ip,
        userAgent,
        type: 'refresh-log-out',
      });
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
    if (dateCurrent - dateEntryMs < sessionIdMaxAge) {
      return true;
    }
    return false;
  }

  // Log out user
  async logOut({ sessionId, userId, userAgent, ip, response }) {
    if (!sessionId || !userId || !userAgent) return true;

    let result = await $dbMain['users'].editUserLogOut({
      sessionId,
      userId,
      userAgent,
    });

    if (result) {
      this.clearAuthCookies({ response });
    }

    await $dbMain['users-auth'].createAuth({
      mail: null,
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

  // Encrypt password
  encryptPassword(password) {
    let { passwordLengthMin, passwordLengthMax, salt } = $config.users;
    if (password.length < passwordLengthMin || password.length > passwordLengthMax) {
      throw {
        errors: [
          {
            path: 'password',
            message: $errors['String length range'](passwordLengthMin, passwordLengthMax),
          },
        ],
      };
    }

    password = crypto
      .createHash('md5')
      .update(password + salt)
      .digest('hex');

    password = crypto
      .createHash('md5')
      .update(password + salt)
      .digest('hex');

    return password;
  }

  // Create session Id
  createSessionId() {
    return (
      uuidv4() + `-${(((Math.random() * Math.random()) / Math.random()) * Date.now()) / 1000000}`
    );
  }

  // Set cookies
  setAuthCookies({ sessionId, userId, response }) {
    response.cookie($config.users.cookieSessionId, sessionId, {
      maxAge: 3600 * 24 * 1000,
      httpOnly: true,
      secure: true,
    });

    response.cookie($config.users.cookieUserId, userId, {
      maxAge: 3600 * 24 * 1000,
      httpOnly: true,
      secure: true,
    });
  }

  // Clear cookies
  clearAuthCookies({ response }) {
    response.cookie($config.users.cookieSessionId, '', {
      maxAge: 0,
    });

    response.cookie($config.users.cookieUserId, '', {
      maxAge: 0,
    });
  }
}

module.exports = UserLogin;
