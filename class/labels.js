let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let fse = require('fs-extra');
let striptags = require('striptags');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');

class Labels {
  // Создать ярлык
  async createLabel({ ratingId, name, color }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }
    await this.checkLabelExist({ name, ratingId });
    let result = await $dbMain.labels.createLabel({ ratingId, name, color });
    return result;
  }

  // Изменить ярлык
  async editLabel({ labelId, name, color, ratingId }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }
    await this.checkLabelExist({ labelId, name, ratingId });
    let result = await $dbMain.labels.editLabel({ labelId, name, color });
    return result;
  }

  // Удалить ярлык + удаляется у элементов
  async deleteLabel({ labelId }) {
    let ratingItems = await $dbMain['ratings-items'].getItemsRatingByLabelId({
      labelId,
    });
    await this.editRatingItemsLabel({ ratingItems, labelId });
    let result = await $dbMain.labels.deleteLabel({ labelId });
    if (result) return true;
    throw Error($errors['There is no such id']);
  }

  // Проверяем наличие ярлыка в рейтинге с таким же названием
  async checkLabelExist({ labelId, name, ratingId }) {
    let isExist;
    for await (let lang of Object.keys(name)) {
      isExist = await $dbMain.labels.getLabelRatingByName({
        labelId,
        name: name[lang],
        ratingId,
        lang,
      });
      if (isExist) break;
    }

    if (isExist)
      throw {
        errors: [{ path: 'name', message: $errors['A label with the same name already exists'] }],
      };
  }

  // Обновляем ярлыки для элементов рейтнга (удаляем ярлык)
  async editRatingItemsLabel({ ratingItems, labelId }) {
    for await (let item of ratingItems) {
      delete item.labelsIds[labelId];
      await $dbMain['ratings-items'].editItemsRatingLabel({
        ratingItemId: item.ratingItemId,
        labelsIds: item.labelsIds,
      });
    }
  }

  // Получить все ярлыки ярлыки
  async getLabels({ ratingId }) {
    let result = await $dbMain.labels.getLabels({ ratingId });
    return result;
  }

  // Создать кеш для ярлыков рейтинга
  async createCache() {
    let ratingsList = $dbMain.ratings.getRatingsNotHidden();
    for (let { ratingId } of ratingsList) {
      let labels = await this.getLabels({ ratingId });
      fse.writeJson(global.ROOT_PATH + `/cashe/labels/${ratingId}.json`, labels);
    }
  }
}

module.exports = Labels;
