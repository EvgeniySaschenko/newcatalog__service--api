let { $t, $translations } = require(global.ROOT_PATH + '/plugins/translations');

module.exports = {
  // Server errors / Unexpected Errors
  serverMessage(message = '', isReturn = false) {
    let result = { server: message || $t('Server error') };
    if (isReturn) return result;
    throw result;
  },
  /*
    Used when creating messages when validating data (for example, validating form fields)

    Object - the object must contain such keys:
      path: - the key
      message: - the value
      !!! The same key names are used by "sequelize", so as not to do additional processing when creating a response from the server, the names left the same

    Object - The object is used to send one message. 
      Example: { path: "key", "message": "text message" }
    Array - An array is used to send multiple messages 
      Example: [{ path: "key", "message": "text message" }, { path: "key2", "message": "text message2" }]
  */
  validationMessage(data) {
    if (Array.isArray(data)) {
      throw { errors: data };
    }

    if (typeof data === 'object' && data !== null) {
      throw { errors: [data] };
    }

    throw { server: $t('Server error') };
  },

  // Create response
  createResponse({ request, error }) {
    try {
      let { serviceName } = global.$config['services'].api;
      let langDefaultCookie = request.cookies[global.$config['translations'].cookieNameLangDefault];
      let langDefaultService = $translations.getLangDefault({ serviceName });
      let langDefault = langDefaultCookie || langDefaultService;

      // Validation errors
      let result = {};
      let isValidationErrors = false;
      if (error.errors) {
        for (let item of error.errors) {
          // Condition for not showing an error that the front should not see
          if (item.origin !== 'CORE' && item.origin !== 'DB') {
            isValidationErrors = true;
            let translation = $translations.t(item.message, langDefault);
            result[item.path] = translation;
          } else {
            console.error(item);
          }
        }
      } else {
        console.error(error);
      }
      if (isValidationErrors) {
        return { status: 400, errors: result };
      }

      // Server errors
      let message = error?.server || $t('Server error');
      return {
        status: 500,
        server: $translations.t(message, langDefault),
      };
    } catch (error) {
      console.error(error);
      return {
        status: 500,
        server: $translations.t($t('Server error'), ''),
      };
    }
  },
};
