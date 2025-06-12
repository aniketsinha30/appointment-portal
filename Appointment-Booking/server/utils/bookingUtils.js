const moment = require('moment-timezone');

// Generate time slots with timezone awareness
const generateSlots = (start, end, duration, timeZone) => {
  const slots = [];
  let current = moment(start).tz(timeZone);
  const endTime = moment(end).tz(timeZone);

  while (current < endTime) {
    const slotEnd = moment(current).add(duration, 'minutes');
    if (slotEnd > endTime) break;
    
    slots.push({
      startTime: current.utc().toDate(),
      endTime: slotEnd.utc().toDate(),
      isBooked: false
    });
    
    current = slotEnd;
  }
  
  return slots;
};

// Convert date to specific timezone
const toTimeZone = (date, timeZone) => {
  return moment(date).tz(timeZone).format();
};

module.exports = {
  generateSlots,
  toTimeZone
};