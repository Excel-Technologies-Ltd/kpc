import planetFleronz from "@/assets/planets/planet_fleronz.jpg";
import planetXinox from "@/assets/planets/planet_xinox.jpg";
import planetZionq from "@/assets/planets/planet_zionq.jpg";
import React, { useState } from "react";
import { DailyUsageChart } from "./DailyUsageChart";
import { PlanetCard } from "./PlanetCard";
import { SelectFoundCard } from "./SelectFoundCard";
import { TimeFinishCard } from "./TimeFinishCard";
import { UniverseBanner } from "./UniverseBanner";

export const CosmicDashboard: React.FC = () => {
  const [chosenPlanet, setChosenPlanet] = useState<string>("xinoX");

  const planets = [
    {
      id: "xinoX",
      name: "xinoX",
      suffix: "300",
      price: 200,
      glowColor: "#4f46e5",
      footerGradient: "from-[#2433e5] to-[#401fe0]",
      imageSrc: planetXinox,
    },
    {
      id: "fleronZ",
      name: "fleronZ",
      suffix: "500",
      price: 380,
      glowColor: "#06b6d4",
      footerGradient: "from-[#00b0ad] to-[#019398]",
      imageSrc: planetFleronz,
    },
    {
      id: "zionQ",
      name: "zionQ",
      suffix: "100",
      price: 900,
      glowColor: "#f59e0b",
      footerGradient: "from-[#f59e0b] to-[#d97706]",
      imageSrc: planetZionq,
    },
  ];

//   return <CosmicDashboard /> 

  return (
    <div className="w-full space-y-7 my-4 text-white">
      {/* ── Top Header & Planet Cards Section ──────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Planet Selected
          </h2>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/10 text-white/70 tracking-widest uppercase">
            Plane
          </span>
        </div>

        {/* 3D Planet Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planets.map((planet) => (
            <PlanetCard
              key={planet.id}
              name={planet.name}
              suffix={planet.suffix}
              price={planet.price}
              chosen={chosenPlanet === planet.id}
              imageSrc={planet.imageSrc}
              glowColor={planet.glowColor}
              footerGradient={planet.footerGradient}
              onChoose={() => setChosenPlanet(planet.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom Operational Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Countdown & Atom Ring Planet Explorer */}
        <div className="lg:col-span-4 flex flex-col">
          <TimeFinishCard />
        </div>

        {/* Right Column: Daily Usage Waves & Exploration Controls */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* Daily Usage Waves Chart */}
          <DailyUsageChart />

          {/* Lower Grid: Select Found + Universe Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            <div className="md:col-span-5 flex flex-col">
              <SelectFoundCard />
            </div>
            <div className="md:col-span-7 flex flex-col">
              <UniverseBanner />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmicDashboard;