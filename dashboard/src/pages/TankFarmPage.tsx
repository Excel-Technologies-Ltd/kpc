import React from "react";
import { TankFarm3DSection } from "../components/TankFarm/TankFarm3DSection";
import { TankFarmSection } from "../components/TankFarm/TankFarmSection";

export const TankFarmPage: React.FC = () => {
  return (
    <div className="space-y-10">
      <TankFarm3DSection />
      <TankFarmSection />
    </div>
  );
};

export default TankFarmPage;
