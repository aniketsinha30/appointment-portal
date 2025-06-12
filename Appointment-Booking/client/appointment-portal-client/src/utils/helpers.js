// utils/helpers.js
// Format date to local time
export const formatDate = (dateString, timeZone) => {
  return new Date(dateString).toLocaleString('en-US', {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Generate time slots
export const generateTimeSlots = (startTime, endTime, duration) => {
  const slots = [];
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  while (start < end) {
    const slotEnd = new Date(start.getTime() + duration * 60000);
    if (slotEnd <= end) {
      slots.push({
        start: new Date(start),
        end: new Date(slotEnd)
      });
    }
    start.setTime(start.getTime() + duration * 60000);
  }
  
  return slots;
};