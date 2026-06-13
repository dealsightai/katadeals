import DscrCalculator from "@/components/DscrCalculator";
export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">DSCR Loan Calculator</h1>
        <p className="text-slate-500 mb-8">Qualify rental properties using DSCR loans. No personal income required - the property pays for itself.</p>
        <DscrCalculator />
      </div>
    </main>
  );
}