let { $api } = require(global.ROOT_PATH + '/plugins/api');
let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
// Indicates that a backup is in progress
let isBackupProcess = false;
// The variable is needed to avoid accidentally unblocking other blockService()
let isBlockService = false;
class Backups {
  backupId = null;
  // Create backup
  async createBackup() {
    if (isBackupProcess) {
      $utils['errors'].serverMessage($t('Backup is in progress'));
    }

    $utils['service'].blockService();
    isBlockService = true;
    try {
      let { backupId, dateCreate } = await $dbMain['backups'].createRecord();
      this.backupId = backupId;
      isBackupProcess = true;
      await $api['backup'].createBackup({ backupId, dateCreate });
      // Unblock access to the API service server, since the backup has already been copied locally to a separate directory. All that remains is to upload the files.
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
    let idInterval = setInterval(async () => {
      let { data } = await $api['backup'].checkStatus();
      switch (data.processStatus) {
        case 'send': {
          $utils['service'].unblockService();
          isBlockService = false;
          break;
        }
        case 'completed': {
          let report = await $api['backup'].getReport();
          this.finalize({ report: report.data, isError: false });
          clearInterval(idInterval);
          break;
        }
        case 'error': {
          let report = await $api['backup'].getReport();
          this.finalize({ report: report.data, isError: true });
          clearInterval(idInterval);
          break;
        }
      }
    }, 2000);
  }

  // Create report + unlock
  async finalize({ report, isError }) {
    await $dbMain['backups'].editRecord({
      backupId: this.backupId,
      report,
      isError,
    });
    isBackupProcess = false;
    if (isBlockService) {
      $utils['service'].unblockService();
      isBlockService = false;
    }
  }

  // Get backups
  async getBackups({ page = 1 }) {
    let maxRecordsPerPage = global.$config['common'].maxRecordsPerPage;
    let offset = (page - 1) * maxRecordsPerPage;
    let count = await $dbMain['backups'].getBackupsCount();
    let items = await $dbMain['backups'].getBackups({
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
}

module.exports = Backups;
