let isServiceBlocked = false;
let idTimeoutBlockService = null;
module.exports = {
  // If the service has not been unblocked for a certain time
  runFuse() {
    idTimeoutBlockService = setTimeout(() => {
      this.unblockService();
    }, global.$config['services'].api.blockingTimeMax * 1000);
  },
  // Service blocking - the service will not accept or return data (Used during initialization or cache update)
  blockService(isFuse = true) {
    if (isFuse) {
      this.runFuse();
    }
    isServiceBlocked = true;
  },
  // Unblock service (if blockService)
  unblockService() {
    clearTimeout(idTimeoutBlockService);
    idTimeoutBlockService = null;
    isServiceBlocked = false;
  },
  // Check is service blocked
  checkIsServiceBlocked() {
    return isServiceBlocked;
  },
};
