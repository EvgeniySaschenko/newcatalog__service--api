let fse = require('fs-extra');
let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let {
  DB_MAIN__BACKUP_REPORT_PATH,
  DB_MAIN__BACKUP_MESSAGING_FILE,
  DB_MAIN__SERVICE,
  API__SERVICE,
} = process.env;
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let { $dbTemporary } = require(global.ROOT_PATH + '/plugins/db-temporary');
let Ssh2SftpClient = require('ssh2-sftp-client');

// When the service is blocked but sending to a remote server is in progress
let isBlockedRunProcessBackup = false;

class Backups {
  constructor() {
    let { serviceRootPath } = global.$config['services'].dbMain;
    this.dbMessagingFilePath = `${serviceRootPath}/${DB_MAIN__BACKUP_MESSAGING_FILE}`;
    this.dbReportPath = `${serviceRootPath}/${DB_MAIN__BACKUP_REPORT_PATH}`;
    this.tmpDirectory = $utils['paths'].dirPathTmpDir();
    this.tmpDirectoryDb = `${this.tmpDirectory}/db`;
    this.tmpDirectoryImages = `${this.tmpDirectory}/images`;
    this.tmpDirectoryWhois = `${this.tmpDirectory}/whois`;
  }
  dbMessagingFilePath = '';
  dbReportPath = '';
  isDbBlockWatch = false;
  tmpDirectory = '';

  // Run process backup
  async runProcessBackup() {
    let backupId;
    let totalDateStart = new Date().toISOString();
    if (isBlockedRunProcessBackup) {
      $utils['errors'].serverMessage($t('Sending files to a remote server'));
    }
    isBlockedRunProcessBackup = true;
    try {
      $utils['service'].blockService();
      let recordBackup = await $dbMain['backups'].createRecord();
      backupId = recordBackup.backupId;

      await fse.writeFile(this.dbMessagingFilePath, API__SERVICE, 'utf8'); // Starts a database backup
      await this.checkResponseBackupServer();

      // eslint-disable-next-line no-undef
      return new Promise((resolve, reject) => {
        fse.watchFile(this.dbReportPath, { interval: 500 }, async (event, file) => {
          if (this.isDbBlockWatch) return;
          this.isDbBlockWatch = true;

          let report = await fse.readFile(this.dbReportPath, 'utf8');
          if (!report) {
            $utils['errors'].serverMessage();
          }

          report = JSON.parse(report);

          if (report.error) {
            $utils['errors'].serverMessage();
          }

          await this.copuFilesToTmp();
          // At this stage, the service can be unlocked because the files will not change
          $utils['service'].unblockService();

          // setTimeout - So that the user does not have to wait for the completion of copying to a remote server
          setTimeout(async () => {
            try {
              await this.sendFilesSsh(`${totalDateStart}_${backupId}`);
              await this.finalize();
              report.totalDateStart = totalDateStart;
              report.totalDateEnd = new Date().toISOString();
              await $dbMain['backups'].editRecord({ backupId, report, isError: false });
            } catch (error) {
              await this.finalize();
              await $dbMain['backups'].editRecord({ backupId, report: error, isError: true });
              console.error(error);
            }
          }, 0);

          return resolve(true);
        });
      });
    } catch (error) {
      await this.finalize();
      await $dbMain['backups'].editRecord({ backupId, report: error, isError: true });
      console.error(error);
      throw error;
    }
  }

  // Copu files to tmp
  async copuFilesToTmp() {
    await fse.copy($utils['paths'].dirPathDbMainBackup(), this.tmpDirectoryDb);
    await fse.copy($utils['paths'].dirPathImages(), this.tmpDirectoryImages);
    await fse.copy($utils['paths'].dirPathWhois(), this.tmpDirectoryWhois);
  }

  // finalize
  async finalize() {
    fse.unwatchFile(this.dbReportPath);
    this.isDbBlockWatch = false;
    await fse.remove(this.tmpDirectory);
    isBlockedRunProcessBackup = false;
    $utils['service'].unblockService();
  }

  // If the server that makes the backups does not respond within 10 seconds, the request will be rejected
  async checkResponseBackupServer() {
    // eslint-disable-next-line no-undef
    return new Promise((resolve, reject) => {
      let idTimeout = setTimeout(() => {
        fse.unwatchFile(this.dbMessagingFilePath);
        let message = $t('Backup server not responding');
        reject($utils['errors'].serverMessage(message, true));
      }, 10000);

      fse.watchFile(this.dbMessagingFilePath, { interval: 100 }, async (event, file) => {
        let message = await fse.readFile(this.dbMessagingFilePath, 'utf8');
        if (message === DB_MAIN__SERVICE) {
          clearTimeout(idTimeout);
          fse.unwatchFile(this.dbMessagingFilePath);
          resolve();
        }
      });
    });
  }

  // Send files ssh
  async sendFilesSsh(dirBackup) {
    let settingsNames = global.$config['settings-names'];
    let services = global.$config['services'];
    let sftp = new Ssh2SftpClient();
    let { privateKey } = await $dbTemporary['api'].getSshKeysPair();
    let { settingValue } = await $dbMain['settings'].getSettingBySettingNameAndServiceType({
      settingName: settingsNames.backup,
      serviceType: services.api.serviceType,
    });

    let { host, username, port, remoteDir } = settingValue;
    // send files to remote server
    let pathsBackup = [
      {
        local: this.tmpDirectoryDb,
        remote: `${remoteDir}/${dirBackup}/db`,
      },
      {
        local: this.tmpDirectoryImages,
        remote: `${remoteDir}/${dirBackup}/images`,
      },
      {
        local: this.tmpDirectoryWhois,
        remote: `${remoteDir}/${dirBackup}/whois`,
      },
    ];

    await sftp.connect({
      host,
      username,
      privateKey,
      port,
    });

    for await (let item of pathsBackup) {
      await sftp.uploadDir(item.local, item.remote);
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
