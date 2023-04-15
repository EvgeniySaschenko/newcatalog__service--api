let isServiceBlocked = false;
module.exports = {
  // Service blocking - the service will not accept or return data (Used during initialization or cache update)
  blockService() {
    isServiceBlocked = true;
  },
  // Unblock service (if blockService)
  unblockService() {
    isServiceBlocked = false;
  },
  // Check is service blocked
  checkIsServiceBlocked() {
    return isServiceBlocked;
  },
};
