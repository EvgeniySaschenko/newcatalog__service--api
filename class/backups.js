let { $api } = require(global.ROOT_PATH + '/plugins/api');
let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
// Indicates that a backup / restore is in progress
let processName = null; // backup | restore
// The variable is needed to avoid accidentally unblocking other blockService()
let isBlockService = false;

class Backups {
  recordId = null;

  // Create backup
  async createBackup() {
    if (processName) {
      $utils['errors'].serverMessage($t('Backup is in progress'));
    }

    try {
      this.blockService();
      processName = 'backup';
      let { backupId, dateCreate } = await $dbMain['backups'].createRecord();
      this.recordId = backupId;
      this.watchBackupService();
      await $api['backup'].createBackup({ backupId, dateCreate });
      return true;
    } catch (error) {
      let report = {
        message: error.message,
        name: error.name,
      };
      this.finalize({ report, isError: true });
      throw error;
    }
  }

  // Restore backup
  async restoreBackup({ remoteDirPath }) {
    if (processName) {
      $utils['errors'].serverMessage($t('Restoring from backup in progress'));
    }
    remoteDirPath = (remoteDirPath || '').trim();

    if (!remoteDirPath) {
      $utils['errors'].validationMessage({
        path: 'remoteDirPath',
        message: $t('The field cannot be empty'),
      });
    }
    try {
      processName = 'restore';
      let { backupRestoreId } = await $dbMain['backups-restore'].createRecord();
      await $api['backup'].restoreBackup({ remoteDirPath });
      this.recordId = backupRestoreId;
      this.watchBackupService();
      return true;
    } catch (error) {
      let report = {
        message: error.message,
        name: error.name,
      };
      this.finalize({ report, isError: true });
      throw error;
    }
  }

  // Watch the backup process
  watchBackupService() {
    let isСompleted = true;
    let watch = new Promise((resolve, reject) => {
      let idInterval = setInterval(async () => {
        if (!isСompleted) return;
        isСompleted = false;
        let { data } = await $api['backup'].checkStatus();

        switch (data.processStatus) {
          case 'restore': {
            this.blockService();
            break;
          }
          case 'send': {
            this.unblockService();
            break;
          }
          case 'completed': {
            clearInterval(idInterval);
            resolve({ isError: false });
            break;
          }
          case 'error': {
            clearInterval(idInterval);
            resolve({ isError: true });
            break;
          }
        }
        isСompleted = true;
      }, 1000);
    });

    watch
      .then(async ({ isError }) => {
        let report = await $api['backup'].getReport();
        await this.finalize({ report: report.data, isError });
      })
      .catch(() => {
        processName = null;
        this.unblockService();
      });
  }

  // Create report + unlock
  async finalize({ report, isError }) {
    switch (processName) {
      case 'backup': {
        await $dbMain['backups'].editRecord({
          backupId: this.recordId,
          report,
          isError,
        });
        break;
      }
      case 'restore': {
        await $dbMain['backups-restore'].editRecord({
          backupRestoreId: this.recordId,
          report,
          isError,
        });
        break;
      }
    }

    this.recordId = null;
    processName = null;
    this.unblockService();
  }

  // Get backups list
  async getBackupsList({ page = 1 }) {
    let { maxRecordsPerPage } = global.$config['common'];
    let offset = (page - 1) * maxRecordsPerPage;
    let count = await $dbMain['backups'].getCount();
    let items = await $dbMain['backups'].getBackupsList({
      offset,
      limit: maxRecordsPerPage,
    });

    let pagesCount = Math.ceil(count / maxRecordsPerPage);
    return {
      page,
      pagesCount,
      maxRecordsPerPage,
      itemsCount: count,
      items,
    };
  }

  // Get backups restore list
  async getRestoresList({ page = 1 }) {
    let { maxRecordsPerPage } = global.$config['common'];
    let offset = (page - 1) * maxRecordsPerPage;
    let count = await $dbMain['backups-restore'].getCount();
    let items = await $dbMain['backups-restore'].getRestoresList({
      offset,
      limit: maxRecordsPerPage,
    });

    let pagesCount = Math.ceil(count / maxRecordsPerPage);
    return {
      page,
      pagesCount,
      maxRecordsPerPage,
      itemsCount: count,
      items,
    };
  }

  unblockService() {
    if (isBlockService) {
      $utils['service'].unblockService();
      isBlockService = false;
    }
  }

  blockService() {
    if (!isBlockService) {
      $utils['service'].blockService();
      isBlockService = true;
    }
  }
}

module.exports = Backups;
