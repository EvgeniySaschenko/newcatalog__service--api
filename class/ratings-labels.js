let db = require(global.ROOT_PATH + '/db');
let { M_RatingsItems } = require(global.ROOT_PATH + '/models/ratings-items.js');
let fse = require('fs-extra');
let striptags = require('striptags');

class RatingsLabels {
  // Создать ярлык
  async createLabel({ ratingId, name, color }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }
    await this.checkLabelExist({ name, ratingId });
    let result = await db['ratings-labels'].createLabel({ ratingId, name, color });
    return result;
  }

  // Изменить ярлык
  async editLabel({ id, name, color, ratingId }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }
    await this.checkLabelExist({ id, name, ratingId });
    let result = await db['ratings-labels'].editLabel({ id, name, color });
    return result;
  }

  // Удалить ярлык + удаляется у элементов
  async deleteLabel({ id: labelId }) {
    let ratingItems = await this.getRatingItemsByLabelId({ labelId });
    await this.editRatingItemsLabel({ ratingItems, labelId });
    let result = await db['ratings-labels'].deleteLabel({ id: labelId });
    if (result) return true;
    throw Error('Такого id нет');
  }

  // Проверяем наличие ярлыка в рейтинге с таким же названием
  async checkLabelExist({ id, name, ratingId }) {
    let isExist;
    for await (let lang of Object.keys(name)) {
      isExist = await db['ratings-labels'].getLabelRatingByName({
        id,
        name: name[lang],
        ratingId,
        lang,
      });
      if (isExist) break;
    }

    if (isExist)
      throw { errors: [{ path: 'name', message: 'Ярлык с таким именем уже существует' }] };
  }

  // Получить все елементы рейтинга - нужны для проверки label при удалении
  async getRatingItemsByLabelId({ labelId }) {
    let result = await M_RatingsItems.findAll({
      attributes: ['id', 'labelsIds'],
      where: {
        labelsIds: { [labelId]: labelId },
      },
    });
    return result;
  }

  // Обновляем ярлыки для элементов рейтнга (удаляем ярлык)
  async editRatingItemsLabel({ ratingItems, labelId }) {
    for (let item of ratingItems) {
      delete item.labelsIds[labelId];
      await M_RatingsItems.update(
        { labelsIds: item.labelsIds },
        {
          where: {
            id: item.id,
          },
        }
      );
    }
  }

  // Получить все ярлыки ярлыки
  async getLabels({ ratingId }) {
    let result = await db['ratings-labels'].getLabels({ ratingId });
    return result;
  }

  // Создать кеш для ярлыков рейтинга
  async createCache() {
    let ratingsList = db.ratings.getRatingsNotHidden();
    for (let item of ratingsList) {
      let labels = await this.getLabels({ ratingId: item.id });
      fse.writeJson(global.ROOT_PATH + `/cashe/labels/${item.id}.json`, labels);
    }
  }
}

module.exports = RatingsLabels;
