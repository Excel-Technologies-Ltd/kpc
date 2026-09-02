import React from "react";

export const HSEQSection: React.FC = () => {
  return (
    <section id="hseq">
      <div className="section-head">
        <div>
          <div className="section-title">HSEQ &amp; certification gate</div>
          <div className="section-note">
            Freshness is recomputed against today's date on every check — a
            lapsed certification is never trusted from a cached status field.
          </div>
        </div>
      </div>
      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Employee certifications</div>
            <span className="panel-tag">2 flagged</span>
          </div>
          <div>
            <div className="emp-card">
              <div className="emp-avatar">JM</div>
              <div style={{ flex: 1 }}>
                <div className="emp-name">James Mwangi</div>
                <div className="emp-role">
                  Field Technician · Pump Station KP2
                </div>
                <div className="cert-chips">
                  <span className="cert-chip valid">Pipeline Operations</span>
                  <span className="cert-chip valid">Confined Space Entry</span>
                  <span className="cert-chip valid">General HSEQ</span>
                </div>
              </div>
            </div>
            <div className="emp-card">
              <div className="emp-avatar">PO</div>
              <div style={{ flex: 1 }}>
                <div className="emp-name">Peter Otieno</div>
                <div className="emp-role">
                  Field Technician · Mombasa Terminal
                </div>
                <div className="cert-chips">
                  <span className="cert-chip expired">
                    Confined Space Entry — expired
                  </span>
                  <span className="cert-chip valid">General HSEQ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Permit to Work</div>
            <span className="panel-tag">Live</span>
          </div>
          <div>
            <div className="permit-row">
              <div>
                <div className="permit-id">PTW-2026-0117</div>
                <div className="permit-type">Hot Work — Pump Station KP2</div>
              </div>
              <span className="status-tag issued">Issued</span>
            </div>
            <div className="permit-row">
              <div>
                <div className="permit-id">PTW-2026-0116</div>
                <div className="permit-type">
                  Confined Space Entry — Tank MB-03
                </div>
              </div>
              <span className="status-tag closed">Closed</span>
            </div>
            <div className="permit-row">
              <div>
                <div className="permit-id">PTW-2026-0115</div>
                <div className="permit-type">
                  Electrical Isolation — Nairobi Terminal
                </div>
              </div>
              <span className="status-tag closed">Closed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
