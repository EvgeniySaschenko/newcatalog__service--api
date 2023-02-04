let db = require(global.ROOT_PATH + '/db');
let { M_RatingsLabels } = require(global.ROOT_PATH + '/models/ratings-labels.js');
let { M_RatingsItems } = require(global.ROOT_PATH + '/models/ratings-items.js');
let fse = require('fs-extra');
let striptags = require('striptags');

class RatingsLabels {
  // Создать ярлык
  async createLabel({ ratingId, name, color }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }

    let checkUa = await this.getLabelRatingByName({ ratingId, name: name.ua, lang: 'ua' });
    let checkRu = await this.getLabelRatingByName({ ratingId, name: name.ru, lang: 'ru' });
    if (checkUa || checkRu)
      throw { errors: [{ path: 'name', message: 'Ярлык с таким именем уже существует' }] };

    let result = await M_RatingsLabels.create({
      ratingId,
      name,
      color: striptags(color).toLocaleLowerCase(),
    });
    return result.get({ plain: true });
  }

  // Удалить ярлык
  async deleteLabel({ id: labelId, ratingId }) {
    let result = await M_RatingsLabels.destroy({ where: { id: labelId } });
    let ratingItems = await this.getRatingItemsByLabelId({ labelId, ratingId }).catch(() => {
      console.error('getRatingItemsByLabelId');
    });
    await this.editRatingItemsLabel({ ratingItems, labelId }).catch(() => {
      console.error('editRatingItemsLabel');
    });
    if (result) return true;
    throw Error('Такого id нет');
  }

  // Получить все елементы рейтинга - нужны для проверки label при удалении
  async getRatingItemsByLabelId({ labelId, ratingId }) {
    let result = await M_RatingsItems.findAll({
      attributes: ['id', 'labels'],
      where: {
        ratingId,
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

  // Изменить ярлык
  async editLabel({ id, name, color, ratingId }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }

    let labelRatingById = await this.getLabelRatingById({ id });
    let checkUa = await this.getLabelRatingByName({ ratingId, name: name.ua, lang: 'ua' });
    let checkRu = await this.getLabelRatingByName({ ratingId, name: name.ru, lang: 'ru' });

    // Если пытаемся другому ярлыку присвоить имя существующего
    if (
      (labelRatingById.name.ua !== name.ua && checkUa?.name.ua === name.ua) ||
      (labelRatingById.name.ru !== name.ru && checkRu?.name.ru === name.ru)
    ) {
      throw { errors: [{ path: 'name', message: 'Ярлык с таким именем уже существует' }] };
    }

    let result = await M_RatingsLabels.update(
      { name, color: striptags(color).toLocaleLowerCase() },
      { where: { id } }
    );
    return result;
  }

  // Получить все ярлыки ярлыки
  async getLabels({ ratingId }) {
    let result = await M_RatingsLabels.findAll({
      attributes: ['id', 'name', 'color'],
      where: {
        ratingId,
      },
      order: [['name', 'ASC']],
    });
    return result;
  }

  // Получить ярлык по имени
  async getLabelRatingByName({ name, ratingId, lang }) {
    let result = await M_RatingsLabels.findOne({
      attributes: ['id', 'name', 'color'],
      where: {
        ratingId,
        [`name.${lang}`]: name,
      },
    });
    return result;
  }

  // Получить ярлык по id
  async getLabelRatingById({ id }) {
    let result = await M_RatingsLabels.findAll({
      attributes: ['id', 'name', 'color'],
      where: {
        id: id,
      },
    });
    return result[0];
  }

  // Создать кеш для прода
  async createCache() {
    let ratingsList = db.ratings.getRatingsNotHidden();
    // console.log(ratingsList);
    for (let item of ratingsList) {
      let labels = await this.getLabels({ ratingId: item.id });
      fse.writeJson(global.ROOT_PATH + `/cashe/labels/${item.id}.json`, labels);
    }
  }
}

module.exports = RatingsLabels;
