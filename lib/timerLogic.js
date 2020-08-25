export const timeRemaining = (end) => {
  const total = Date.parse(end) - Date.parse(new Date());
  let remaining = {};

  if (total > 0) {
    remaining = {
      days: Math.floor(total / (1000 * 60 * 60 * 24)),
      hours: Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / 1000 / 60) % 60),
      seconds: Math.floor((total / 1000) % 60),
      error: null,
    };
    if (total <= 0) {
      return (remaining = { error: 'No time remaining!' });
    }
  }
  return {
    total,
    remaining,
  };
};

export const ticker = (deadline) => {
  let timeInterval = setInterval(() => {
    let t = timeRemaining(deadline);
    let d = t.remaining.days;
    let h = t.remaining.hours;
    let m = t.remaining.minutes;
    let s = t.remaining.seconds;

    if (t.total <= 0) {
      clearInterval(ticker);
    }
  }, 1000);
};
