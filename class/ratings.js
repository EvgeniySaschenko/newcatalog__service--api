let { M_Ratings } = require(ROOT_PATH + "/models/ratings.js");
let striptags = require("striptags");
let fse = require("fs-extra");

class Ratings {
  // Создать рейтинг
  async createRating({
    userId,
    name,
    descr,
    typeRating,
    typeSort,
    typeDisplay,
    sectionsIds,
    isHiden,
  }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
      descr[key] = striptags(descr[key]);
    }

    let result = await M_Ratings.create({
      userId,
      name,
      descr,
      typeRating,
      typeSort,
      typeDisplay,
      sectionsIds,
      isHiden,
    });
    return result.get({ plain: true });
  }

  // Редактировать рейтинг
  async editRating({
    id,
    name,
    descr,
    isHiden,
    typeRating,
    typeSort,
    typeDisplay,
    sectionsIds,
    visitorId,
  }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
      descr[key] = striptags(descr[key]);
    }

    let result = await M_Ratings.update(
      {
        name,
        descr,
        isHiden,
        typeRating,
        typeSort,
        typeDisplay,
        sectionsIds,
        visitorId,
      },
      {
        where: { id },
      }
    );
    return result;
  }

  // Получить рейтинг
  async getRating({ id }) {
    let result = await M_Ratings.findOne({
      attributes: [
        "id",
        "name",
        "descr",
        "isHiden",
        "typeRating",
        "typeSort",
        "typeDisplay",
        "sectionsIds",
        "dateCreate",
      ],
      where: {
        id,
      },
    });
    return result;
  }

  // Получить сайт по url и ratingId (для проверки на уникальность)
  async getRatingCountBySectionId({ sectionId }) {
    let result = await M_Ratings.count({
      where: {
        sectionsIds: {
          [sectionId]: sectionId,
        },
      },
    });
    return result;
  }

  // Получить все рейтинги пользователя
  async getRatingsUser({ userId }) {
    let result = await M_Ratings.findAll({
      attributes: [
        "id",
        "name",
        "descr",
        "isHiden",
        "typeRating",
        "typeSort",
        "typeDisplay",
        "sectionsIds",
        "dateCreate",
      ],
      where: {
        userId,
      },
      order: [
        ["isHiden", "ASC"],
        ["name.ua", "ASC"],
      ],
    });
    return result;
  }

  // Получить все видимые рейтинги
  async getRatingsNotHidden() {
    let result = await M_Ratings.findAll({
      attributes: [
        "id",
        "name",
        "descr",
        "typeRating",
        "typeSort",
        "typeDisplay",
        "sectionsIds",
        "dateCreate",
      ],
      where: {
        isHiden: false,
      },
      order: [
        ["dateCreate", "DESC"],
        ["name.ua", "ASC"],
      ],
    });
    return result;
  }

  // Создать кеш для прода
  async createCache() {
    let ratings = await this.getRatingsNotHidden();
    fse.writeJson(ROOT_PATH + "/cashe/ratings.json", ratings);
  }
}

module.exports = Ratings;
