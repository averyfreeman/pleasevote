import { useEffect, useState } from "react";

interface TimeLeft {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

/** Calculate non-negative time parts for a target timestamp. */
function calculateTimeLeft(endTime: string, now: number = Date.now()): TimeLeft {
  const distance = Math.max(0, new Date(endTime).getTime() - now);
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance % 86_400_000) / 3_600_000),
    minutes: Math.floor((distance % 3_600_000) / 60_000),
    seconds: Math.floor((distance % 60_000) / 1_000),
  };
}

/** Display a live, screen-reader-friendly countdown to an election date. */
export default function CountdownTimer({
  endTime,
  label,
}: {
  /** ISO timestamp for the election day. */
  readonly endTime: string;
  /** Accessible heading for the countdown. */
  readonly label: string;
}) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(endTime));

  useEffect(() => {
    const interval = window.setInterval(() => setTimeLeft(calculateTimeLeft(endTime)), 1_000);
    return () => window.clearInterval(interval);
  }, [endTime]);

  return (
    <section className="card border border-primary/20 bg-base-100 shadow-xl" aria-labelledby="countdown-heading">
      <div className="card-body">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-primary">Plan ahead</p>
        <h2 id="countdown-heading" className="card-title text-2xl">{label}</h2>
        <p className="text-sm text-base-content/65">Dates and hours can change, so check the official details before you go.</p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center" aria-live="polite" aria-atomic="true">
          {[
            ["Days", timeLeft.days],
            ["Hours", timeLeft.hours],
            ["Minutes", timeLeft.minutes],
            ["Seconds", timeLeft.seconds],
          ].map(([unit, value]) => (
            <div key={unit} className="rounded-xl bg-primary/10 px-2 py-3">
              <span className="block text-2xl font-black tabular-nums text-primary sm:text-3xl">{value}</span>
              <span className="text-xs font-bold uppercase tracking-wide text-base-content/65">{unit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
