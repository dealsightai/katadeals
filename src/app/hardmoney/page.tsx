import HardMoneyCalculator from "@/components/HardMoneyCalculator";
export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Hard Money Loan Calculator</h1>
        <p className="text-slate-500 mb-8">Calculate hard money loan costs, profit, and ROI for fix and flips or BRRRR deals.</p>
        <HardMoneyCalculator />
      </div>
    </main>
  );
}