import React, { useState } from "react";

export const SelectFoundCard: React.FC = () => {
  const [product, setProduct] = useState("NFT Explorations");
  const [amount, setAmount] = useState(25000);

  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#121422]/90 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden">
      {/* Background glow */}
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#8c52ff]/15 rounded-full blur-3xl pointer-events-none" />

      <div>
        <h3 className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-white tracking-tight">
          Select Found
        </h3>
        <p className="text-xs text-[#8aa0c0] mt-1 font-normal">
          Choose the product to invest
        </p>

        {/* Product Select Dropdown */}
        <div className="mt-4">
          <div className="relative">
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full appearance-none bg-[#181b2e] border border-white/10 text-sm font-medium text-white rounded-2xl px-4 py-3 pr-10 focus:outline-none focus:border-[#8c52ff] cursor-pointer"
            >
              <option value="NFT Explorations">NFT Explorations</option>
              <option value="Cosmic Liquidity Pool">Cosmic Liquidity Pool</option>
              <option value="Starlight Yield Farm">Starlight Yield Farm</option>
              <option value="Dyson Sphere Futures">Dyson Sphere Futures</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-xs">
              ▾
            </div>
          </div>
        </div>
      </div>

      {/* Amount to Invest Slider */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-[#8aa0c0] mb-2 font-mono">
          <span>Amount to invest:</span>
          <span className="font-bold text-white">${amount.toLocaleString()}</span>
        </div>

        <div className="relative flex items-center py-2">
          <input
            type="range"
            min={1000}
            max={50000}
            step={500}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-1.5 bg-[#1e2238] rounded-lg appearance-none cursor-pointer accent-[#8c52ff]"
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono text-[#5a6d8c] mt-1">
          <span>$1,000</span>
          <span>$50,000</span>
        </div>
      </div>
    </div>
  );
};

export default SelectFoundCard;
