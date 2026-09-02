import React from "react";

export const TankFarmSection: React.FC = () => {
  return (
    <section id="tanks">
      <div className="section-head">
        <div>
          <div className="section-title">Tank farm</div>
          <div className="section-note">
            Live fill levels across Mombasa and Nairobi. A tank under
            Maintenance or Quarantine blocks any new measurement.
          </div>
        </div>
      </div>
      <div className="grid-4">
        {/* Tank 1 */}
        <div className="panel tank-card">
          <div className="tank-svg-wrap">
            <svg viewBox="0 0 56 96" width="56" height="96">
              <rect
                x="4"
                y="4"
                width="48"
                height="88"
                rx="6"
                fill="none"
                stroke="#233252"
                strokeWidth="2"
              />
              <clipPath id="clip1">
                <rect x="4" y="4" width="48" height="88" rx="6" />
              </clipPath>
              <rect
                x="4"
                y="30"
                width="48"
                height="62"
                fill="#33C9B7"
                opacity="0.85"
                clipPath="url(#clip1)"
              />
            </svg>
          </div>
          <div className="tank-info">
            <div className="tank-name">Tank MB-01</div>
            <div className="tank-terminal">Mombasa · AGO</div>
            <div className="tank-stats">
              <div>
                LEVEL<b>68%</b>
              </div>
              <div>
                TEMP<b>28.4°C</b>
              </div>
            </div>
            <span className="badge active">
              <span className="bdot" />
              Active
            </span>
          </div>
        </div>

        {/* Tank 2 */}
        <div className="panel tank-card">
          <div className="tank-svg-wrap">
            <svg viewBox="0 0 56 96" width="56" height="96">
              <rect
                x="4"
                y="4"
                width="48"
                height="88"
                rx="6"
                fill="none"
                stroke="#233252"
                strokeWidth="2"
              />
              <clipPath id="clip2">
                <rect x="4" y="4" width="48" height="88" rx="6" />
              </clipPath>
              <rect
                x="4"
                y="12"
                width="48"
                height="80"
                fill="#F0A83C"
                opacity="0.85"
                clipPath="url(#clip2)"
              />
            </svg>
          </div>
          <div className="tank-info">
            <div className="tank-name">Tank MB-03</div>
            <div className="tank-terminal">Mombasa · PMS</div>
            <div className="tank-stats">
              <div>
                LEVEL<b>91%</b>
              </div>
              <div>
                TEMP<b>27.1°C</b>
              </div>
            </div>
            <span className="badge maint">
              <span className="bdot" />
              Maintenance
            </span>
          </div>
        </div>

        {/* Tank 3 */}
        <div className="panel tank-card">
          <div className="tank-svg-wrap">
            <svg viewBox="0 0 56 96" width="56" height="96">
              <rect
                x="4"
                y="4"
                width="48"
                height="88"
                rx="6"
                fill="none"
                stroke="#233252"
                strokeWidth="2"
              />
              <clipPath id="clip3">
                <rect x="4" y="4" width="48" height="88" rx="6" />
              </clipPath>
              <rect
                x="4"
                y="50"
                width="48"
                height="42"
                fill="#33C9B7"
                opacity="0.85"
                clipPath="url(#clip3)"
              />
            </svg>
          </div>
          <div className="tank-info">
            <div className="tank-name">Tank NB-02</div>
            <div className="tank-terminal">Nairobi · Jet A-1</div>
            <div className="tank-stats">
              <div>
                LEVEL<b>46%</b>
              </div>
              <div>
                TEMP<b>24.8°C</b>
              </div>
            </div>
            <span className="badge active">
              <span className="bdot" />
              Active
            </span>
          </div>
        </div>

        {/* Tank 4 */}
        <div className="panel tank-card">
          <div className="tank-svg-wrap">
            <svg viewBox="0 0 56 96" width="56" height="96">
              <rect
                x="4"
                y="4"
                width="48"
                height="88"
                rx="6"
                fill="none"
                stroke="#233252"
                strokeWidth="2"
              />
              <clipPath id="clip4">
                <rect x="4" y="4" width="48" height="88" rx="6" />
              </clipPath>
              <rect
                x="4"
                y="60"
                width="48"
                height="32"
                fill="#E5555C"
                opacity="0.85"
                clipPath="url(#clip4)"
              />
            </svg>
          </div>
          <div className="tank-info">
            <div className="tank-name">Tank NB-04</div>
            <div className="tank-terminal">Nairobi · IK</div>
            <div className="tank-stats">
              <div>
                LEVEL<b>34%</b>
              </div>
              <div>
                TEMP<b>25.9°C</b>
              </div>
            </div>
            <span className="badge quarantine">
              <span className="bdot" />
              Quarantined
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
