"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

// The blocking script in the root layout sets the initial `.dark` class on
// <html> before paint. We read that class as the source of truth via
// useSyncExternalStore — no effect, no hydration mismatch — and flip it on
// click, persisting the choice and notifying subscribers.

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  window.addEventListener("storage", callback); // sync across tabs
  window.addEventListener("themechange", callback); // our own toggle
  return () => {
    mq.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener("themechange", callback);
  };
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

export function ThemeToggle() {
  // Server snapshot is `false`; the script corrects the DOM before paint and
  // the client snapshot reflects the real class after hydration.
  const isDark = useSyncExternalStore(subscribe, getSnapshot, () => false);

  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    // Keep native UI (inputs, pickers, scrollbars) in step with the app theme.
    root.style.colorScheme = next ? "dark" : "light";
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage may be unavailable (private mode); the class still applies.
    }
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
