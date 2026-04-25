import Link from "next/link";

type Deal = {
  id: string;
  address: string;
  price: number;
  score: number | null;
  analysis: any;
  createdAt: Date | string;
};

function scoreColor(score: number | null) {
  if (!score) return "bg-slate-800 text-slate-400";
  if (score >= 8) return "bg-emerald-500/15 text-emerald-400";
  if (score >= 5) return "bg-amber-500/15 text-amber-400";
  return "bg-red-500/15 text-red-400";
}

function recoBadge(reco: string) {
  if (reco === "BUY") return "bg-emerald-500 text-white";
  if (reco === "HOLD") return "bg-amber-500 text-white";
  return "bg-red-500 text-white";
}

export default function DealCard({ deal }: { deal: Deal }) {
  const a = deal.analysis as any;
  const reco = a?.recommendation || "-";
  const score = a?.dealScore || deal.score;

  return (
    <Link
      href={`/dashboard/${deal.id}`}
      className="block bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-900/50 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
          {deal.address}
        </h3>
        <span
          className={`shrink-0 text-xs font-bold px-2 py-1 rounded-lg ${recoBadge(reco)}`}
        >
          {reco}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span
          className={`text-sm font-bold px-2.5 py-1 rounded-lg ${scoreColor(score)}`}
        >
          {score || 0}/10
        </span>
        <span className="text-slate-500 text-sm">
          ${Number(deal.price).toLocaleString()}
        </span>
      </div>

      {a?.summary && (
        <p className="text-slate-500 text-xs line-clamp-2 mb-3 leading-relaxed">
          {a.summary}
        </p>
      )}

      <p className="text-slate-600 text-xs">
        {new Date(deal.createdAt).toLocaleDateString()}
      </p>
    </Link>
  );
}
