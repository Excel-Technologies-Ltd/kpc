import React from "react";

export const DecisionLedger: React.FC = () => {
  return (
    <section id="ledger">
      <div className="section-head">
        <div>
          <div className="section-title">Decision ledger</div>
          <div className="section-note">
            Append-only. Every AI-assisted decision and manual override,
            immutable the moment it's written.
          </div>
        </div>
      </div>
      <div className="panel ledger">
        <div className="ledger-row head">
          <div>TIMESTAMP</div>
          <div>JOURNEY</div>
          <div>DECISION</div>
          <div>DECIDED BY</div>
          <div>SOURCE</div>
        </div>
        <div className="ledger-row">
          <div className="lts">09:41:02</div>
          <div className="lref">JNY-00042</div>
          <div className="lactor">
            AI Recommendation approved — Maintenance Work Order raised for Pump
            Station KP2
          </div>
          <div className="lactor">D. Kiptoo (Maintenance Mgr)</div>
          <div>
            <span className="ledger-tag ai">AI-assisted</span>
          </div>
        </div>
        <div className="ledger-row">
          <div className="lts">09:12:47</div>
          <div className="lref">JNY-00038</div>
          <div className="lactor">
            Reconciliation variance 0.51% accepted with written justification
          </div>
          <div className="lactor">A. Njoroge (Finance Officer)</div>
          <div>
            <span className="ledger-tag override">Override</span>
          </div>
        </div>
        <div className="ledger-row">
          <div className="lts">08:57:19</div>
          <div className="lref">JNY-00040</div>
          <div className="lactor">
            Quality Result accepted — AGO parcel released for nomination
          </div>
          <div className="lactor">S. Wanjiru (Quality Manager)</div>
          <div>
            <span className="ledger-tag human">Human</span>
          </div>
        </div>
        <div className="ledger-row">
          <div className="lts">08:30:05</div>
          <div className="lref">JNY-00035</div>
          <div className="lactor">
            Variance classified as Evaporation and approved
          </div>
          <div className="lactor">P. Mutua (Ops Controller)</div>
          <div>
            <span className="ledger-tag human">Human</span>
          </div>
        </div>
        <div className="ledger-row">
          <div className="lts">07:58:33</div>
          <div className="lref">JNY-00042</div>
          <div className="lactor">
            AI Alert raised — overpressure breach on Movement MV-0091
          </div>
          <div className="lactor">System (OT ingest)</div>
          <div>
            <span className="ledger-tag ai">AI-assisted</span>
          </div>
        </div>
      </div>
    </section>
  );
};
