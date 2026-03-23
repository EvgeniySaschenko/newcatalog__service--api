// An array is used because the server can be blocked from different locations at the same time, as long as the array is not empty the service will be blocked
let serviceBlocked = [];
module.exports = {
  // Service blocking - the service will not accept or return data (Used during initialization or cache update)
  blockService() {
    serviceBlocked.push(1);
  },
  // Unblock service (if blockService)
  unblockService() {
    serviceBlocked.pop();
  },
  // Check is service blocked
  checkIsServiceBlocked() {
    return Boolean(serviceBlocked.length);
  },
};
