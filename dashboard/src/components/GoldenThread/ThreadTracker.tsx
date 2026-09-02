import React from "react";

export const ThreadTracker: React.FC = () => {
  return (
    <section id="thread">
      <div className="section-head">
        <div>
          <div className="section-title">Golden Thread tracker</div>
          <div className="section-note">
            One journey_ref, thirteen enforced steps — every arrow below is a
            system-checked gate, not a convention.
          </div>
        </div>
      </div>

      <div className="panel thread-panel">
        <div className="thread-top">
          <div>
            <div className="thread-id">
              JNY-2026-00042 &nbsp;·&nbsp; MT Buffalo Bay &nbsp;·&nbsp; AGO
            </div>
          </div>
          <div className="thread-meta">
            <div>
              ROUTE<b>Mombasa → Nairobi</b>
            </div>
            <div>
              QUANTITY<b>8,400 KL</b>
            </div>
            <div>
              CUSTOMER<b>Vivo Energy Kenya</b>
            </div>
            <div>
              CURRENT STEP<b style={{ color: "var(--amber)" }}>7 · Movement</b>
            </div>
          </div>
        </div>

        <div className="flow-track">
          <div className="flow-line" />
          <div className="flow-line-fill" />
          <div className="flow-steps">
            <div className="fstep done">
              <div className="fnode" />
              <span className="fnum">01</span>
              <span className="flabel">Shipment</span>
            </div>
            <div className="fstep done">
              <div className="fnode" />
              <span className="fnum">02</span>
              <span className="flabel">Receipt</span>
            </div>
            <div className="fstep done">
              <div className="fnode" />
              <span className="fnum">03</span>
              <span className="flabel">Quality Result</span>
            </div>
            <div className="fstep done">
              <div className="fnode" />
              <span className="fnum">04</span>
              <span className="flabel">Inventory Position</span>
            </div>
            <div className="fstep done">
              <div className="fnode" />
              <span className="fnum">05</span>
              <span className="flabel">Nomination</span>
            </div>
            <div className="fstep done">
              <div className="fnode" />
              <span className="fnum">06</span>
              <span className="flabel">Pipeline Batch</span>
            </div>
            <div className="fstep active">
              <div className="fnode" />
              <span className="fnum">07</span>
              <span className="flabel">Movement + AI</span>
            </div>
            <div className="fstep pending">
              <div className="fnode" />
              <span className="fnum">08</span>
              <span className="flabel">Terminal Receipt</span>
            </div>
            <div className="fstep pending">
              <div className="fnode" />
              <span className="fnum">09</span>
              <span className="flabel">Reconciliation</span>
            </div>
            <div className="fstep pending">
              <div className="fnode" />
              <span className="fnum">10</span>
              <span className="flabel">Allocation</span>
            </div>
            <div className="fstep pending">
              <div className="fnode" />
              <span className="fnum">11</span>
              <span className="flabel">Dispatch</span>
            </div>
            <div className="fstep pending">
              <div className="fnode" />
              <span className="fnum">12</span>
              <span className="flabel">Invoice</span>
            </div>
            <div className="fstep pending">
              <div className="fnode" />
              <span className="fnum">13</span>
              <span className="flabel">Financial Posting</span>
            </div>
          </div>
        </div>

        <div className="thread-foot">
          <div className="thread-foot-note">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 9v4M12 17h.01M10.3 3.9L2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
            Overpressure detected mid-pumping — AI Recommendation pending
            Maintenance Manager approval.
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-ghost btn">View journey_ref log</button>
            <button className="btn">Open Movement</button>
          </div>
        </div>
      </div>
    </section>
  );
};
