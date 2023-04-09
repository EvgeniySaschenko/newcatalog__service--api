let { M_Labels, name: tableName } = require('./models/labels');

let striptags = require('striptags');
let { Op } = require('sequelize');

module.exports = {
  tableName,
  // Create label
  async createLabel({ ratingId, name, color }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }
    let result = await M_Labels.create({
      ratingId,
      name,
      color: striptags(color).toLocaleLowerCase(),
    });
    return result.get({ plain: true });
  },

  // Edit label
  async editLabel({ labelId, name, color }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }
    let result = await M_Labels.update(
      { name, color: striptags(color).toLocaleLowerCase() },
      { where: { labelId } }
    );
    return result;
  },

  // Get labels rating
  async getLabelsRating({ ratingId }) {
    let result = await M_Labels.findAll({
      attributes: ['labelId', 'name', 'color'],
      where: {
        ratingId,
      },
      order: [['name', 'ASC']],
    });
    return result;
  },

  // Get label by LabelId
  async getLabelByLabelId({ labelId }) {
    let result = await M_Labels.findOne({
      where: {
        labelId,
      },
    });
    return result;
  },

  // Get rating label by name
  async getLabelRatingByName({ labelId = null, name, ratingId, lang }) {
    let result = await M_Labels.findOne({
      attributes: ['labelId', 'name', 'color'],
      where: {
        ratingId,
        [`name.${lang}`]: name,
        labelId: {
          [Op.ne]: labelId,
        },
      },
    });
    return result;
  },

  // Вelete label
  async deleteLabel({ labelId }) {
    return await M_Labels.destroy({ where: { labelId } });
  },

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {
    let all = await M_Labels.findAll();

    for await (let item of all) {
      let ua = item.name['ua'];
      item.name['uk'] = ua;
      delete item.name['ua'];
      await M_Labels.update({ name: item.name }, { where: { labelId: item.labelId } });
    }
  },
};
