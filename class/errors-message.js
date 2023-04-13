let { $t, $translations } = require(global.ROOT_PATH + '/plugins/translations');

class ErrorsMessage {
  constructor(request) {
    try {
      this.langDefault =
        request.cookies[global.$config['translations'].cookieNameLangDefault] || '';
    } catch (error) {
      console.error(request);
    }
  }

  langDefault = '';

  // Create a bug report
  createMessage(data) {
    try {
      // Validation errors
      let result = {};
      let isValidationErrors = false;
      if (data.errors) {
        for (let item of data.errors) {
          // Condition for not showing an error that the front should not see
          if (item.origin !== 'CORE' && item.origin !== 'DB') {
            isValidationErrors = true;
            let translation = $translations.t(item.message, this.langDefault);
            result[item.path] = translation;
          } else {
            console.error(item);
          }
        }
      } else {
        console.error(data);
      }
      if (isValidationErrors) {
        return { status: 400, errors: result };
      }

      // Server errors
      let message = data?.server || $t('Server error');
      return {
        status: 500,
        server: $translations.t(message, this.langDefault),
      };
    } catch (error) {
      console.error(error);
      return {
        status: 500,
        server: $translations.t($t('Server error'), this.langDefault),
      };
    }
  }
}

module.exports = ErrorsMessage;
