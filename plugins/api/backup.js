let axios = require('axios');
let { BACKUP__SERVICE, BACKUP__SERVER_PORT, APP_SECRET_KEY } = process.env;

let backup = {
  serverAddress: `http://${BACKUP__SERVICE}:${BACKUP__SERVER_PORT}`,
  paramSekretKey: `secretKey=${APP_SECRET_KEY}`,

  // Create backup
  async createBackup({ backupId, dateCreate }) {
    let url = `backup?${this.paramSekretKey}`;
    let response = await axios.post(`${this.serverAddress}/${url}`, { backupId, dateCreate });
    return response;
  },

  // Set settings backup SSH
  async setSettings({ host, port, username, remoteDir, publicKey, keyAlgorithm }) {
    let url = `settings-backup-ssh?${this.paramSekretKey}`;
    let response = await axios.post(`${this.serverAddress}/${url}`, {
      host,
      port,
      username,
      remoteDir,
      publicKey,
      keyAlgorithm,
    });
    return response;
  },

  // To report what exactly the server is doing now
  async checkStatus() {
    let url = `check-status?${this.paramSekretKey}`;
    let response = await axios.get(`${this.serverAddress}/${url}`);
    return response;
  },

  // Get report
  async getReport() {
    let url = `report?${this.paramSekretKey}`;
    let response = await axios.get(`${this.serverAddress}/${url}`);
    return response;
  },
};

module.exports = backup;
