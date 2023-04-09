let { $t, $translations } = require(global.ROOT_PATH + '/plugins/translations');

class ErrorsMessage {
  constructor(request) {
    try {
      this.lang = request.cookies[global.$config['translations'].cookieLang] || '';
    } catch (error) {
      console.error(request);
    }
  }

  lang = '';

  // Create a bug report
  createMessage(data) {
    let result = {};
    let isMessage = false;
    let status = 400;
    if (data.errors) {
      for (let item of data.errors) {
        // Condition for not showing an error that the front should not see
        if (item.origin !== 'CORE' && item.origin !== 'DB') {
          isMessage = true;
          result[item.path] = item.message;
        } else {
          console.error(item);
        }
      }
    } else {
      console.error(data);
    }

    // Default error message
    if (!isMessage) {
      status = 500;
      result = { server: $t('Server error') };
    }

    for (let key in result) {
      result[key] = $translations.t({ text: result[key], lang: this.lang });
    }

    return { status, errors: result };
  }
}

module.exports = ErrorsMessage;
