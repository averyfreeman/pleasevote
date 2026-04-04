/**
 * Calculates the time remaining between now and a given end date.
 *
 * @param {string} end - The ISO string or date format representing the deadline.
 * @returns {object} An object containing total milliseconds remaining and individual units.
 */
export const timeRemaining = (end) => {
  const total = Date.parse(end) - Date.parse(new Date());

  if (total <= 0) {
    return {
      total: 0,
      remaining: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
      error: 'No time remaining!',
    };
  }

  return {
    total,
    remaining: {
      days: Math.floor(total / (1000 * 60 * 60 * 24)),
      hours: Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / 1000 / 60) % 60),
      seconds: Math.floor((total / 1000) % 60),
    },
    error: null,
  };
};

/**
 * DEPRECATED: Ticker was previously used with setInterval but is now
 * handled by useEffect in the CountdownTimer component for better React compatibility.
 */
export const ticker = (deadline) => {
  console.warn('ticker() is deprecated. Use the CountdownTimer component instead.');
};
