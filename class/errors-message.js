class ErrorsMessage {
  // Создать сообщение об ошибке
  createMessage(data) {
    let result = {};
    let isMessage = false;
    if (data.errors) {
      for (let item of data.errors) {
        // Условие для того чтобы не показывать ошибку которую не должен видить фронт
        if (item.origin !== "CORE" && item.origin !== "DB") {
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
      result = { server: "Ошибка сервера" };
    }
    return { errors: result };
  }
}

module.exports = ErrorsMessage;
