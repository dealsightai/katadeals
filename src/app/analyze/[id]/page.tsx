import { notFound } from "next/navigation";
import { getDealById } from "@/lib/deals";
import DealReport from "@/components/DealReport";
import PdfExportButton from "@/components/PdfExportButton";
import Link from "next/link";

export default async function DealResultPage(props: any) {
  const deal = await getDealById(props.params.id);
  if (!deal) { notFound(); }
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/analyze" className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 text-sm mb-8 transition-colors">
          Back to Analyze
        </Link>
        <DealReport deal={deal} />
        <div className="mt-6 text-center"><PdfExportButton deal={deal} /></div>
        <div className="mt-8 text-center">
          <Link href="/dashboard" className="inline-block border border-slate-300 hover:border-blue-400 text-slate-600 hover:text-blue-600 px-6 py-3 rounded-xl text-sm font-medium transition-all">
            View All Saved Deals
          </Link>
        </div>
      </div>
    </main>
  );
}