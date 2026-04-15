import { useState, useEffect } from "react";

/**
 * A countdown timer component that displays the time remaining until a target date.
 *
 * @param endTime - The target date and time string (ISO format).
 * @param label - A descriptive label for the countdown.
 * @returns A stylized countdown timer card.
 */
export default function CountdownTimer({
  endTime,
  label,
}: {
  endTime: string;
  label: string;
}) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const target = new Date(endTime).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (!timeLeft) return null;

  return (
    <div className="bg-onehalf-dark p-6 rounded-2xl border-4 border-neutral-800 shadow-xl text-center">
      <h3 className="text-xl font-bold text-onehalf-blue mb-4 uppercase tracking-wider">
        {label}
      </h3>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Minutes", value: timeLeft.minutes },
          { label: "Seconds", value: timeLeft.seconds },
        ].map((item) => (
          <div key={item.label} className="flex flex-col">
            <span className="text-3xl md:text-5xl font-black text-onehalf-green">
              {item.value}
            </span>
            <span className="text-xs md:text-sm text-neutral-400 uppercase">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
