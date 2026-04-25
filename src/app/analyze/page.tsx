import AnalyzeForm from "@/components/AnalyzeForm";

export default function AnalyzePage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-5">
        <div className="mb-10">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Deal Analysis
          </p>
          <h1 className="text-3xl font-bold text-white mb-2">
            Analyze a Deal
          </h1>
          <p className="text-slate-500 text-base">
            Enter the property details and get an instant AI investment analysis.
          </p>
        </div>
        <AnalyzeForm />
      </div>
    </main>
  );
}
