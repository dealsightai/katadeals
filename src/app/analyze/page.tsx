import AnalyzeForm from "@/components/AnalyzeForm";

export default function AnalyzePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Analyze a Deal</h1>
      <p className="text-gray-500 mb-8">
        Enter property details and let AI evaluate the investment potential.
      </p>
      <AnalyzeForm />
    </main>
  );
}
