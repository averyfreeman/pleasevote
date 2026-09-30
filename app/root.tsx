import type { ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";

import ThemeSwitcher from "~/components/ThemeSwitcher";
import "./app.css";

/** Shared document shell for the static SPA. */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-base-200 text-base-content antialiased">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <header className="border-b border-base-300 bg-base-100/95 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <a href="/" className="flex items-center gap-3 rounded-xl focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <span aria-hidden="true" className="grid size-10 place-items-center rounded-2xl bg-primary text-xl text-primary-content shadow-md">✓</span>
              <span>
                <span className="block text-lg font-black tracking-tight">PleaseVote</span>
                <span className="hidden text-xs font-medium text-base-content/60 sm:block">Election information, made easier</span>
              </span>
            </a>
            <ThemeSwitcher />
          </div>
        </header>
        {children}
        <footer className="border-t border-base-300 bg-base-100">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-base-content/65 sm:px-6 lg:px-8">
            <p className="font-semibold text-base-content">PleaseVote is an information service, not a voting service.</p>
            <p>Check with your election office for final eligibility, hours, and rules.</p>
          </div>
        </footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigation = useNavigation();
  return (
    <>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {navigation.state === "idle" ? "" : "Loading voter information"}
      </div>
      <Outlet />
    </>
  );
}
