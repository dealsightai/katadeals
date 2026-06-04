import RefinanceCalculator from "@/components/RefinanceCalculator";
export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Cash Out Refinance Calculator</h1>
        <p className="text-slate-500 mb-8">Calculate how much cash you can pull from your property.</p>
        <RefinanceCalculator />
      </div>
    </main>
  );
}