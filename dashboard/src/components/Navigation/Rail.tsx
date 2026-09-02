import React from "react";

interface RailProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const Rail: React.FC<RailProps> = ({
  activeSection,
  setActiveSection,
}) => {
  const items = [
    {
      id: "overview",
      title: "Overview",
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: "thread",
      title: "Golden Thread",
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="5" cy="12" r="2.2" />
          <circle cx="19" cy="6" r="2.2" />
          <circle cx="19" cy="18" r="2.2" />
          <path d="M7 12h5M12 12l5-5M12 12l5 5" />
        </svg>
      ),
    },
    {
      id: "tanks",
      title: "Tank Farm",
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M6 3h12l2 7c0 5.5-4.5 11-8 11S4 15.5 4 10z" />
          <path d="M4.5 12h15" />
        </svg>
      ),
    },
    {
      id: "ai",
      title: "AI & Reconciliation",
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
          <circle cx="12" cy="12" r="3.2" />
        </svg>
      ),
    },
    {
      id: "commercial",
      title: "Commercial & Finance",
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M3 17l5-6 4 3 6-8" />
          <path d="M14 6h4v4" />
        </svg>
      ),
    },
    {
      id: "hseq",
      title: "HSEQ",
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M12 3l7 3v6c0 5-3 8.5-7 9-4-.5-7-4-7-9V6z" />
        </svg>
      ),
    },
    {
      id: "ledger",
      title: "Decision Ledger",
      svg: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="rail">
      <div className="rail-mark">KP</div>
      {items.map((item) => (
        <a
          key={item.id}
          className={`rail-item ${activeSection === item.id ? "active" : ""}`}
          href={`#${item.id}`}
          onClick={() => setActiveSection(item.id)}
          title={item.title}
        >
          {item.svg}
        </a>
      ))}
      <div className="rail-spacer" />
      <div className="rail-foot">PETROLEUM OPERATIONS</div>
    </nav>
  );
};
