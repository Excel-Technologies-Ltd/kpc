import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

interface TopbarProps {
  currentUser?: string | null;
}

export const Topbar: React.FC<TopbarProps> = ({ currentUser }) => {
  const [timeStr, setTimeStr] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kpc-theme");
      if (saved === "light" || saved === "dark") return saved;
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    }
    localStorage.setItem("kpc-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleString("en-KE", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }) + " EAT",
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name || name === "Guest") return "MO";
    return name
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("");
  };

  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-name">KPC · Operations</div>
        <div className="brand-sub">Kenya Pipeline Company</div>
      </div>

      <div className="top-right">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--panel-2)] hover:bg-[var(--panel-3)] text-[var(--text-dim)] hover:text-[var(--text)] transition-all cursor-pointer text-xs font-mono shadow-sm"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#f0a83c]" />
              <span className="hidden sm:inline text-xs font-medium">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#6366f1]" />
              <span className="hidden sm:inline text-xs font-medium">Dark</span>
            </>
          )}
        </button>

        <div className="status-pill">
          <span className="dot pulse" /> All systems nominal
        </div>
        <div className="clock">{timeStr}</div>
        <div className="avatar">{getInitials(currentUser)}</div>
      </div>
    </div>
  );
};

export default Topbar;
