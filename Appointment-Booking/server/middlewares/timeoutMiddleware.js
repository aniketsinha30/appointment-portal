//middlewares/timeoutMiddleware
const Availability = require('../models/Availability');

// Release stale locks after 5 minutes
const releaseStaleLocks = async () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  await Availability.updateMany(
    { lockedAt: { $lt: fiveMinutesAgo } },
    { $set: { lockedAt: null } }
  );
};

const startStaleLockCleaner = () => {
  // Run immediately on start
  releaseStaleLocks();
  
  // Run every 5 minutes
  setInterval(releaseStaleLocks, 5 * 60 * 1000);
  console.log('Stale lock cleaner started');
};

module.exports = { startStaleLockCleaner };