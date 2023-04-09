let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let striptags = require('striptags');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');

class Labels {
  // Create label
  async createLabel({ ratingId, name, color }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }
    await this.checkLabelExist({ name, ratingId });
    let result = await $dbMain['labels'].createLabel({ ratingId, name, color });
    return result;
  }

  // Edit label
  async editLabel({ labelId, name, color, ratingId }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }
    await this.checkLabelExist({ labelId, name, ratingId });
    let result = await $dbMain['labels'].editLabel({ labelId, name, color });
    return result;
  }

  // Remove label + removed from items
  async deleteLabel({ labelId }) {
    let ratingItems = await $dbMain['ratings-items'].getItemsRatingByLabelId({
      labelId,
    });
    await this.editRatingItemsLabel({ ratingItems, labelId });
    let tableRecord = await $dbMain['labels'].getLabelByLabelId({ labelId });
    await $dbMain['records-deleted'].createRecords({
      tableName: $dbMain['labels'].tableName,
      tableId: labelId,
      tableRecord,
    });
    let result = await $dbMain['labels'].deleteLabel({ labelId });
    if (result) return true;
    throw Error($t('There is no such id'));
  }

  // Checking for a label in the rating with the same name
  async checkLabelExist({ labelId, name, ratingId }) {
    let isExist;
    for await (let lang of Object.keys(name)) {
      isExist = await $dbMain['labels'].getLabelRatingByName({
        labelId,
        name: name[lang],
        ratingId,
        lang,
      });
      if (isExist) break;
    }

    if (isExist)
      throw {
        errors: [{ path: 'name', message: $t('A label with the same name already exists') }],
      };
  }

  // Update labels for rating items (delete label)
  async editRatingItemsLabel({ ratingItems, labelId }) {
    for await (let item of ratingItems) {
      delete item.labelsIds[labelId];
      await $dbMain['ratings-items'].editItemsRatingLabel({
        ratingItemId: item.ratingItemId,
        labelsIds: item.labelsIds,
      });
    }
  }

  // Get all labels labels
  async getLabelsRating({ ratingId }) {
    let result = await $dbMain['labels'].getLabelsRating({ ratingId });
    return result;
  }
  s;
}

module.exports = Labels;
