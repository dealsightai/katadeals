"use client";
import { useState } from "react";

export default function CommunityCalculator() {
  const [form, setForm] = useState({
    houses: { units: "0", sqftEach: "2000", sellPrice: "350000" },
    townhouses: { units: "0", sqftEach: "1500", sellPrice: "275000" },
    apartments: { units: "0", sqftEach: "900", sellPrice: "180000" },
    landCost: "",
    location: "suburban",
  });
  const [result, setResult] = useState<any>(null);

  const updateProperty = (type: string, field: string, value: string) => {
    setForm({ ...form, [type]: { ...(form as any)[type], [field]: value } });
  };

  const calculate = () => {
    const houses = form.houses;
    const townhouses = form.townhouses;
    const apartments = form.apartments;

    const houseUnits = parseInt(houses.units) || 0;
    const townhouseUnits = parseInt(townhouses.units) || 0;
    const apartmentUnits = parseInt(apartments.units) || 0;
    const totalUnits = houseUnits + townhouseUnits + apartmentUnits;

    const locMult = form.location === "urban" ? 1.3 : form.location === "rural" ? 0.85 : 1.0;

    const houseCostPerSqft = 200 * locMult;
    const townhouseCostPerSqft = 175 * locMult;
    const apartmentCostPerSqft = 225 * locMult;

    const houseCost = houseUnits * parseInt(houses.sqftEach) * houseCostPerSqft;
    const townhouseCost = townhouseUnits * parseInt(townhouses.sqftEach) * townhouseCostPerSqft;
    const apartmentCost = apartmentUnits * parseInt(apartments.sqftEach) * apartmentCostPerSqft;

    const houseRevenue = houseUnits * parseInt(houses.sellPrice);
    const townhouseRevenue = townhouseUnits * parseInt(townhouses.sellPrice);
    const apartmentRevenue = apartmentUnits * parseInt(apartments.sellPrice);

    const landCost = parseInt(form.landCost) || 0;
    const totalCost = houseCost + townhouseCost + apartmentCost + landCost;
    const totalRevenue = houseRevenue + townhouseRevenue + apartmentRevenue;
    const profit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    const timelineMonths = Math.max(
      houseUnits > 0 ? 9 + Math.ceil(houseUnits / 4) : 0,
      townhouseUnits > 0 ? 12 + Math.ceil(townhouseUnits / 6) : 0,
      apartmentUnits > 0 ? 18 + Math.ceil(apartmentUnits / 20) : 0
    );

    setResult({
      totalUnits, houseUnits, townhouseUnits, apartmentUnits,
      houseCost, townhouseCost, apartmentCost, landCost, totalCost,
      houseRevenue, townhouseRevenue, apartmentRevenue, totalRevenue,
      profit, margin, timelineMonths
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-900 mb-4">Houses</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Number of Units</label>
            <input type="number" value={form.houses.units} onChange={e => updateProperty("houses", "units", e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Sq Ft Each</label>
            <input type="number" value={form.houses.sqftEach} onChange={e => updateProperty("houses", "sqftEach", e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Sell Price Each ($)</label>
            <input type="number" value={form.houses.sellPrice} onChange={e => updateProperty("houses", "sellPrice", e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-900 mb-4">Townhouses</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Number of Units</label>
            <input type="number" value={form.townhouses.units} onChange={e => updateProperty("townhouses", "units", e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Sq Ft Each</label>
            <input type="number" value={form.townhouses.sqftEach} onChange={e => updateProperty("townhouses", "sqftEach", e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Sell Price Each ($)</label>
            <input type="number" value={form.townhouses.sellPrice} onChange={e => updateProperty("townhouses", "sellPrice", e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-900 mb-4">Apartments</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Number of Units</label>
            <input type="number" value={form.apartments.units} onChange={e => updateProperty("apartments", "units", e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Sq Ft Each</label>
            <input type="number" value={form.apartments.sqftEach} onChange={e => updateProperty("apartments", "sqftEach", e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Sell Price Each ($)</label>
            <input type="number" value={form.apartments.sellPrice} onChange={e => updateProperty("apartments", "sellPrice", e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Land Cost ($)</label>
          <input type="number" placeholder="500000" value={form.landCost} onChange={e => setForm({...form, landCost: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => setForm({...form, location: "rural"})} className={`py-2 rounded-lg border-2 text-sm font-medium ${form.location === "rural" ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200 text-slate-600"}`}>Rural</button>
            <button onClick={() => setForm({...form, location: "suburban"})} className={`py-2 rounded-lg border-2 text-sm font-medium ${form.location === "suburban" ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200 text-slate-600"}`}>Suburban</button>
            <button onClick={() => setForm({...form, location: "urban"})} className={`py-2 rounded-lg border-2 text-sm font-medium ${form.location === "urban" ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200 text-slate-600"}`}>Urban</button>
          </div>
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl">Calculate Community Project</button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className={`border rounded-2xl p-6 ${result.profit > 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-xs text-slate-600">Total Units</p><p className="text-2xl font-bold">{result.totalUnits}</p></div>
              <div><p className="text-xs text-slate-600">Profit</p><p className={`text-2xl font-bold ${result.profit > 0 ? "text-green-600" : "text-red-600"}`}>${Math.round(result.profit).toLocaleString()}</p></div>
              <div><p className="text-xs text-slate-600">Margin</p><p className="text-2xl font-bold">{result.margin.toFixed(1)}%</p></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-4"><p className="text-xs text-slate-500">Total Cost</p><p className="text-xl font-bold">${Math.round(result.totalCost).toLocaleString()}</p></div>
            <div className="bg-white border rounded-xl p-4"><p className="text-xs text-slate-500">Total Revenue</p><p className="text-xl font-bold">${Math.round(result.totalRevenue).toLocaleString()}</p></div>
            <div className="bg-white border rounded-xl p-4"><p className="text-xs text-slate-500">Land Cost</p><p className="text-xl font-bold">${Math.round(result.landCost).toLocaleString()}</p></div>
            <div className="bg-white border rounded-xl p-4"><p className="text-xs text-slate-500">Timeline</p><p className="text-xl font-bold">{result.timelineMonths} months</p></div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="font-bold mb-3">Breakdown by Property Type</h3>
            <div className="space-y-2 text-sm">
              {result.houseUnits > 0 && <div className="flex justify-between"><span>{result.houseUnits} Houses</span><span>Cost: ${Math.round(result.houseCost).toLocaleString()} · Revenue: ${Math.round(result.houseRevenue).toLocaleString()}</span></div>}
              {result.townhouseUnits > 0 && <div className="flex justify-between"><span>{result.townhouseUnits} Townhouses</span><span>Cost: ${Math.round(result.townhouseCost).toLocaleString()} · Revenue: ${Math.round(result.townhouseRevenue).toLocaleString()}</span></div>}
              {result.apartmentUnits > 0 && <div className="flex justify-between"><span>{result.apartmentUnits} Apartments</span><span>Cost: ${Math.round(result.apartmentCost).toLocaleString()} · Revenue: ${Math.round(result.apartmentRevenue).toLocaleString()}</span></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}