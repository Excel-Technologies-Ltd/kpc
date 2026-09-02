import React, { useEffect, useState } from "react";

interface TopbarProps {
  currentUser?: string | null;
}

export const Topbar: React.FC<TopbarProps> = ({ currentUser }) => {
  const [timeStr, setTimeStr] = useState("");

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
      {/* <div className="thread-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <span className="ph">Trace a Golden Thread — journey_ref, vessel, or customer</span>
        <span className="kbd">⌘K</span>
      </div> */}
      <div className="top-right">
        <div className="status-pill">
          <span className="dot pulse" /> All systems nominal
        </div>
        <div className="clock">{timeStr}</div>
        <div className="avatar">{getInitials(currentUser)}</div>
      </div>
    </div>
  );
};
