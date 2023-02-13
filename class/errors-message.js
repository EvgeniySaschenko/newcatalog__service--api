let { $errors } = require(global.ROOT_PATH + '/plugins/errors');

class ErrorsMessage {
  // Создать сообщение об ошибке
  createMessage(data) {
    let result = {};
    let isMessage = false;
    let status = 400;
    if (data.errors) {
      for (let item of data.errors) {
        // Условие для того чтобы не показывать ошибку которую не должен видить фронт
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

    // Дефолтное сообщение об ошибке
    if (!isMessage) {
      status = 500;
      result = { server: $errors['Server error'] };
    }
    return { status, errors: result };
  }
}

module.exports = ErrorsMessage;
