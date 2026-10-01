import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

/** Supported visitor color-mode preferences. */
export type ThemePreference = "system" | "light" | "dark";

/** Apply a theme preference without persisting lookup-related browser data. */
function applyTheme(preference: ThemePreference): void {
  const root = document.documentElement;
  if (preference === "system") {
    root.removeAttribute("data-theme");
    root.style.colorScheme = "light dark";
    return;
  }
  root.dataset.theme = preference;
  root.style.colorScheme = preference;
}

/** Let visitors choose system, light, or dark presentation with a labelled control. */
export default function ThemeSwitcher() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    applyTheme("system");
  }, []);

  function handleChange(next: ThemePreference): void {
    setPreference(next);
    applyTheme(next);
  }

  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-base-content/75">
      <span className="sr-only">Color theme</span>
      {preference === "light" ? <Sun aria-hidden="true" size={16} /> : null}
      {preference === "dark" ? <Moon aria-hidden="true" size={16} /> : null}
      {preference === "system" ? <Monitor aria-hidden="true" size={16} /> : null}
      <select
        aria-label="Color theme"
        className="select select-sm select-bordered bg-base-100 text-base-content"
        value={preference}
        onChange={(event) => handleChange(event.target.value as ThemePreference)}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
