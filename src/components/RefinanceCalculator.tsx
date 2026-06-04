"use client";
import { useState } from "react";

export default function RefinanceCalculator() {
  const [form, setForm] = useState({ value: "", balance: "", rate: "7.5", term: "30", ltv: "75" });
  const [result, setResult] = useState(null);

  const calculate = () => {
    const value = parseFloat(form.value) || 0;
    const balance = parseFloat(form.balance) || 0;
    const rate = parseFloat(form.rate) / 100 / 12;
    const term = parseFloat(form.term) * 12;
    const ltv = parseFloat(form.ltv) / 100;
    const maxLoan = value * ltv;
    const cashOut = maxLoan - balance;
    const closingCosts = maxLoan * 0.03;
    const cashInPocket = cashOut - closingCosts;
    const payment = (maxLoan * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    setResult({ maxLoan, cashOut, closingCosts, cashInPocket, payment });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <input type="number" placeholder="Property Value ($)" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-3" />
        <input type="number" placeholder="Mortgage Balance ($)" value={form.balance} onChange={e => setForm({...form, balance: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-3" />
        <div className="grid grid-cols-3 gap-3">
          <input type="number" placeholder="Rate %" step="0.1" value={form.rate} onChange={e => setForm({...form, rate: e.target.value})} className="border border-slate-300 rounded-lg px-4 py-3" />
          <input type="number" placeholder="Years" value={form.term} onChange={e => setForm({...form, term: e.target.value})} className="border border-slate-300 rounded-lg px-4 py-3" />
          <input type="number" placeholder="LTV %" value={form.ltv} onChange={e => setForm({...form, ltv: e.target.value})} className="border border-slate-300 rounded-lg px-4 py-3" />
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl">Calculate</button>
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border rounded-xl p-4"><p className="text-xs text-slate-500">New Loan</p><p className="text-xl font-bold">${Math.round(result.maxLoan).toLocaleString()}</p></div>
          <div className="bg-white border rounded-xl p-4"><p className="text-xs text-slate-500">Cash Out</p><p className="text-xl font-bold text-blue-600">${Math.round(result.cashOut).toLocaleString()}</p></div>
          <div className="bg-white border rounded-xl p-4"><p className="text-xs text-slate-500">Closing Costs</p><p className="text-xl font-bold text-red-600">${Math.round(result.closingCosts).toLocaleString()}</p></div>
          <div className="bg-white border rounded-xl p-4"><p className="text-xs text-slate-500">In Pocket</p><p className="text-xl font-bold text-green-600">${Math.round(result.cashInPocket).toLocaleString()}</p></div>
          <div className="bg-white border rounded-xl p-4 col-span-2"><p className="text-xs text-slate-500">Monthly Payment</p><p className="text-xl font-bold">${Math.round(result.payment).toLocaleString()}/mo</p></div>
        </div>
      )}
    </div>
  );
}