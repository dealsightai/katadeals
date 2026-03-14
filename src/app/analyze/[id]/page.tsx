import { getDealById } from "@/lib/deals";
import DealReport from "@/components/DealReport";

export default async function DealResultPage({
  params,
}: {
  params: { id: string };
}) {
  const deal = await getDealById(params.id);
  if (!deal) return <div>Deal not found.</div>;
  return <DealReport deal={deal} />;
}
