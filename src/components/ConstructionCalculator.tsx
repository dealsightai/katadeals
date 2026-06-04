"use client";
import { useState } from "react";

export default function ConstructionCalculator() {
  const [form, setForm] = useState({
    type: "renovation",
    propertyType: "single-family",
    sqft: "",
    scope: "medium",
    location: "suburban",
  });
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const sqft = parseFloat(form.sqft) || 0;

    const costPerSqft: any = {
      "renovation-light": 25,
      "renovation-medium": 75,
      "renovation-heavy": 150,
      "construction-single-family": 200,
      "construction-townhouse": 175,
      "construction-apartment": 225,
      "construction-commercial": 275,
    };

    const timelineMonths: any = {
      "renovation-light": 2,
      "renovation-medium": 4,
      "renovation-heavy": 8,
      "construction-single-family": 9,
      "construction-townhouse": 12,
      "construction-apartment": 18,
      "construction-commercial": 24,
    };

    const key = form.type === "renovation"
      ? `renovation-${form.scope}`
      : `construction-${form.propertyType}`;

    const baseSqftCost = costPerSqft[key] || 100;
    const baseMonths = timelineMonths[key] || 6;

    const locationMultiplier = form.location === "urban" ? 1.3 : form.location === "rural" ? 0.85 : 1.0;

    const totalCost = sqft * baseSqftCost * locationMultiplier;
    const months = Math.ceil(baseMonths * (form.location === "urban" ? 1.15 : 1));
    const monthlyCost = totalCost / months;

    const phases = form.type === "renovation"
      ? [
          { name: "Demolition & Prep", pct: 15, weeks: Math.ceil(months * 4 * 0.15) },
          { name: "Framing & Structural", pct: 20, weeks: Math.ceil(months * 4 * 0.20) },
          { name: "Plumbing & Electrical", pct: 25, weeks: Math.ceil(months * 4 * 0.25) },
          { name: "Drywall & Finishes", pct: 25, weeks: Math.ceil(months * 4 * 0.25) },
          { name: "Final Touches", pct: 15, weeks: Math.ceil(months * 4 * 0.15) },
        ]
      : [
          { name: "Site Prep & Foundation", pct: 12, weeks: Math.ceil(months * 4 * 0.12) },
          { name: "Framing & Roof", pct: 18, weeks: Math.ceil(months * 4 * 0.18) },
          { name: "Mechanical Systems", pct: 22, weeks: Math.ceil(months * 4 * 0.22) },
          { name: "Interior Finishes", pct: 28, weeks: Math.ceil(months * 4 * 0.28) },
          { name: "Landscaping & Final", pct: 20, weeks: Math.ceil(months * 4 * 0.20) },
        ];

    setResult({ totalCost, months, monthlyCost, phases, baseSqftCost, locationMultiplier });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Project Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setForm({...form, type: "renovation"})}
              className={`py-3 rounded-lg border-2 font-medium ${form.type === "renovation" ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200 text-slate-600"}`}>
              Renovation
            </button>
            <button onClick={() => setForm({...form, type: "construction"})}
              className={`py-3 rounded-lg border-2 font-medium ${form.type === "construction" ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200 text-slate-600"}`}>
              New Construction
            </button>
          </div>
        </div>

        {form.type === "renovation" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Renovation Scope</label>
            <select value={form.scope} onChange={e => setForm({...form, scope: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm">
              <option value="light">Light (cosmetic, paint, flooring) ~$25/sqft</option>
              <option value="medium">Medium (kitchen, bath, systems) ~$75/sqft</option>
              <option value="heavy">Heavy (full gut) ~$150/sqft</option>
            </select>
          </div>
        )}

        {form.type === "construction" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
            <select value={form.propertyType} onChange={e => setForm({...form, propertyType: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm">
              <option value="single-family">Single Family Home ~$200/sqft</option>
              <option value="townhouse">Townhouse ~$175/sqft</option>
              <option value="apartment">Apartment Complex ~$225/sqft</option>
              <option value="commercial">Commercial ~$275/sqft</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Total Square Feet</label>
          <input type="number" placeholder="2000" value={form.sqft}
            onChange={e => setForm({...form, sqft: e.target.value})}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => setForm({...form, location: "rural"})}
              className={`py-2 rounded-lg border-2 text-sm font-medium ${form.location === "rural" ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200 text-slate-600"}`}>Rural</button>
            <button onClick={() => setForm({...form, location: "suburban"})}
              className={`py-2 rounded-lg border-2 text-sm font-medium ${form.location === "suburban" ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200 text-slate-600"}`}>Suburban</button>
            <button onClick={() => setForm({...form, location: "urban"})}
              className={`py-2 rounded-lg border-2 text-sm font-medium ${form.location === "urban" ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-200 text-slate-600"}`}>Urban</button>
          </div>
        </div>

        <button onClick={calculate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl">
          Calculate Timeline & Cost
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Total Cost</p>
              <p className="text-xl font-bold text-slate-900">${Math.round(result.totalCost).toLocaleString()}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Timeline</p>
              <p className="text-xl font-bold text-blue-600">{result.months} months</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Monthly Spend</p>
              <p className="text-xl font-bold text-slate-900">${Math.round(result.monthlyCost).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 mb-4">Project Phases</h3>
            <div className="space-y-3">
              {result.phases.map((phase: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700">{phase.name}</span>
                    <span className="text-xs text-slate-500">{phase.weeks} weeks · ${Math.round(result.totalCost * phase.pct / 100).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${phase.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800"><b>Tip:</b> Add 15-20% buffer for unexpected costs and delays. Most projects run over budget by this amount.</p>
          </div>
        </div>
      )}
    </div>
  );
}