"use client";
import { useState } from "react";

type Deal = {
  id: string;
  address: string;
  price: number;
  analysis: any;
  visuals?: any;
  rehabLevel?: string;
  propertyType?: string;
  uploadedPhotos?: string[];
  franchiseName?: string | null;
  createdAt: Date | string;
  user: { name: string | null; email: string | null };
};

function formatCurrency(n: number | undefined | null): string {
  if (n === undefined || n === null) return "N/A";
  return "$" + n.toLocaleString();
}

function ScoreBadge({ score, recommendation }: { score: number; recommendation: string }) {
  const bg =
    recommendation === "BUY"
      ? "bg-emerald-500"
      : recommendation === "HOLD"
      ? "bg-amber-500"
      : "bg-red-500";
  return (
    <div className={`${bg} text-white px-5 py-2 rounded-xl inline-flex items-center gap-2`}>
      <span className="text-2xl font-bold">{score}/10</span>
      <span className="text-sm font-semibold uppercase tracking-wider">{recommendation}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-slate-100 mb-4 pb-2 border-b border-slate-700">{title}</h2>
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-lg font-bold">{value}</p>
    </div>
  );
}

function RehabCard({
  level, data, color,
}: {
  level: string;
  data: { description: string; estimatedCost: number; costPerSqft?: number; timelineWeeks: number; arvAfterRehab: number };
  color: string;
}) {
  return (
    <div className={`bg-slate-800 border rounded-xl p-5 ${color}`}>
      <h3 className="text-white font-bold text-base mb-1">{level}</h3>
      <p className="text-slate-400 text-sm mb-4">{data.description}</p>
      <div className="grid grid-cols-2 gap-3">
        <div><p className="text-slate-500 text-xs">Cost</p><p className="text-white font-semibold">{formatCurrency(data.estimatedCost)}</p></div>
        <div><p className="text-slate-500 text-xs">Cost/sqft</p><p className="text-white font-semibold">{data.costPerSqft ? `$${data.costPerSqft}` : "N/A"}</p></div>
        <div><p className="text-slate-500 text-xs">Timeline</p><p className="text-white font-semibold">{data.timelineWeeks} weeks</p></div>
        <div><p className="text-slate-500 text-xs">ARV After</p><p className="text-emerald-400 font-semibold">{formatCurrency(data.arvAfterRehab)}</p></div>
      </div>
    </div>
  );
}

export default function DealReport({ deal }: { deal: Deal }) {
  const a = deal.analysis;
  const v = deal.visuals;
  const [expandedImage, setExpandedImage] = useState<{ url: string; label: string } | null>(null);

  if (!a) return null;

  const hasNewFinancingFormat = a.financingOptions && !Array.isArray(a.financingOptions);
  const traditionalFinancing = hasNewFinancingFormat ? a.financingOptions.traditional : a.financingOptions;
  const creativeFinancing = hasNewFinancingFormat ? a.financingOptions.creative : null;

  const rehabLevelLabel: Record<string, string> = {
    cosmetic: "Cosmetic Rehab",
    moderate: "Moderate Rehab",
    fullGut: "Full Gut Rehab",
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 md:p-8 border-b border-slate-700">
        <p className="text-emerald-400 text-sm font-medium mb-1">AI Deal Analysis</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{deal.address}</h1>
        <div className="flex flex-wrap items-center gap-4 mt-3">
          <p className="text-slate-300">Asking: <span className="text-white font-semibold">{formatCurrency(deal.price)}</span></p>
          <ScoreBadge score={a.dealScore} recommendation={a.recommendation} />
        </div>
        {a.summary && <p className="text-slate-400 mt-4 leading-relaxed text-sm">{a.summary}</p>}
      </div>

      <div className="p-6 md:p-8">
        {/* Property Details */}
        {a.propertyDetails && (
          <Section title="Property Details">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Bedrooms" value={a.propertyDetails.estimatedBedrooms ?? "N/A"} />
              <StatCard label="Bathrooms" value={a.propertyDetails.estimatedBathrooms ?? "N/A"} />
              <StatCard label="Sq Ft" value={a.propertyDetails.estimatedSqft?.toLocaleString() ?? "N/A"} />
              <StatCard label="Lot Size" value={a.propertyDetails.estimatedLotSize ?? "N/A"} />
              <StatCard label="Type" value={a.propertyDetails.propertyType ?? "N/A"} />
              <StatCard label="Year Built" value={a.propertyDetails.yearBuiltEstimate ?? "N/A"} />
            </div>
            {a.propertyDetails.neighborhood && (
              <div className="mt-3 bg-slate-800 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-400 text-sm"><span className="text-slate-300 font-medium">Neighborhood:</span> {a.propertyDetails.neighborhood}</p>
              </div>
            )}
          </Section>
        )}

        {/* Valuation */}
        {a.valuationAnalysis && (
          <Section title="Valuation & Returns">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Est. ARV" value={formatCurrency(a.valuationAnalysis.estimatedARV)} />
              <StatCard label="As-Is Value" value={formatCurrency(a.valuationAnalysis.estimatedAsIsValue)} />
              <StatCard label="Monthly Rent" value={formatCurrency(a.valuationAnalysis.estimatedMonthlyRent)} />
              <StatCard label="Cash Flow" value={formatCurrency(a.valuationAnalysis.estimatedCashFlow) + "/mo"} />
              <StatCard label="Cap Rate" value={(a.valuationAnalysis.capRate ?? "N/A") + "%"} />
              <StatCard label="Cash on Cash" value={(a.valuationAnalysis.cashOnCashReturn ?? "N/A") + "%"} />
              <StatCard label="Rent to Price" value={(a.valuationAnalysis.rentToPrice ?? "N/A") + "%"} />
              <StatCard label="Price/Sq Ft" value={a.valuationAnalysis.pricePerSqft ? `$${a.valuationAnalysis.pricePerSqft}` : "N/A"} />
            </div>
            {a.valuationAnalysis.marketComparison && (
              <div className="mt-3 bg-slate-800 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-400 text-sm"><span className="text-slate-300 font-medium">Market Comparison:</span> {a.valuationAnalysis.marketComparison}</p>
              </div>
            )}
          </Section>
        )}

        {/* Rehab Analysis */}
        {a.rehabAnalysis && (
          <Section title="Rehab Scenarios">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {a.rehabAnalysis.cosmetic && <RehabCard level="Cosmetic Rehab" data={a.rehabAnalysis.cosmetic} color="border-emerald-600" />}
              {a.rehabAnalysis.moderate && <RehabCard level="Moderate Rehab" data={a.rehabAnalysis.moderate} color="border-amber-600" />}
              {a.rehabAnalysis.fullGut && <RehabCard level="Full Gut Rehab" data={a.rehabAnalysis.fullGut} color="border-red-600" />}
            </div>
          </Section>
        )}

        {/* === RENOVATION VISUALS (Before & After) === */}
        {v?.renovationVisuals && v.renovationVisuals.length > 0 && (
          <Section title={`AI Renovation Visuals — ${rehabLevelLabel[deal.rehabLevel || "cosmetic"] || "Cosmetic Rehab"}`}>
            <div className="space-y-6">
              {v.renovationVisuals.map((visual: any, i: number) => (
                <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="p-3 border-b border-slate-700">
                    <h3 className="text-slate-300 font-medium text-sm">{visual.label}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {visual.originalPhoto && (
                      <div className="relative">
                        <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">Before</div>
                        <img src={visual.originalPhoto} alt={`Original — Photo ${i + 1}`} className="w-full aspect-video object-cover" />
                      </div>
                    )}
                    <div className="relative cursor-pointer" onClick={() => setExpandedImage({ url: visual.url, label: visual.label })}>
                      <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-xs px-2 py-1 rounded z-10">
                        After — {rehabLevelLabel[deal.rehabLevel || "cosmetic"] || "Cosmetic"}
                      </div>
                      <img src={visual.url} alt={visual.label} className="w-full aspect-video object-cover hover:brightness-110 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* === GROUND-UP CONSTRUCTION RENDERINGS === */}
        {v?.groundUpVisuals && v.groundUpVisuals.length > 0 && (
          <Section title="Construction Renderings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {v.groundUpVisuals.map((visual: any, i: number) => (
                <div
                  key={i}
                  className="bg-slate-800 border border-blue-800/50 rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => setExpandedImage({ url: visual.url, label: visual.label })}
                >
                  <div className="aspect-video relative">
                    <img src={visual.url} alt={visual.label} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-blue-400 font-bold text-sm">{visual.label}</h3>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* === FRANCHISE FLOOR PLAN LAYOUTS === */}
        {v?.franchiseLayouts && v.franchiseLayouts.length > 0 && (
          <Section title={`Franchise Floor Plans${deal.franchiseName ? ` — ${deal.franchiseName}` : ""}`}>
            <div className="space-y-6">
              {v.franchiseLayouts.map((layout: any, i: number) => (
                <div key={i} className="bg-slate-800 border border-amber-800/50 rounded-xl overflow-hidden">
                  <div className="p-3 border-b border-slate-700">
                    <h3 className="text-amber-400 font-bold text-sm">{layout.label}</h3>
                  </div>
                  <div className="p-4" dangerouslySetInnerHTML={{ __html: layout.svg }} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Traditional Financing */}
        {traditionalFinancing && traditionalFinancing.length > 0 && (
          <Section title="Traditional Financing Options">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {traditionalFinancing.map((f: any, i: number) => (
                <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <h3 className="text-emerald-400 font-bold text-sm mb-2">{f.type}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div><span className="text-slate-500">Down: </span><span className="text-white">{f.downPaymentPercent != null ? `${f.downPaymentPercent}%` : f.downPayment || "N/A"}{f.downPaymentAmount ? ` (${formatCurrency(f.downPaymentAmount)})` : ""}</span></div>
                    <div><span className="text-slate-500">Rate: </span><span className="text-white">{f.interestRate != null ? `${f.interestRate}%` : "N/A"}</span></div>
                    <div><span className="text-slate-500">Term: </span><span className="text-white">{f.term || "N/A"}</span></div>
                    <div><span className="text-slate-500">PITI: </span><span className="text-white">{formatCurrency(f.monthlyPITI || f.monthlyPayment)}/mo</span></div>
                  </div>
                  {f.dscr && <p className="text-blue-400 text-xs mb-1">DSCR Ratio: {f.dscr}</p>}
                  {f.totalLoanAmount && <p className="text-blue-400 text-xs mb-1">Total Loan (incl rehab): {formatCurrency(f.totalLoanAmount)}</p>}
                  <p className="text-slate-400 text-xs mt-1">{f.bestFor}</p>
                  {f.requirements && <p className="text-slate-500 text-xs mt-1 italic">{f.requirements}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Creative Financing */}
        {creativeFinancing && creativeFinancing.length > 0 && (
          <Section title="Creative Financing Strategies">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {creativeFinancing.map((f: any, i: number) => (
                <div key={i} className="bg-slate-800 border border-blue-800/50 rounded-xl p-4">
                  <h3 className="text-blue-400 font-bold text-sm mb-2">{f.type}</h3>
                  <p className="text-slate-300 text-sm mb-3">{f.structure}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    {f.estimatedDownPayment != null && <div><span className="text-slate-500">Cash Needed: </span><span className="text-white">{formatCurrency(f.estimatedDownPayment)}</span></div>}
                    {f.estimatedCapitalNeeded != null && <div><span className="text-slate-500">Total Capital: </span><span className="text-white">{formatCurrency(f.estimatedCapitalNeeded)}</span></div>}
                    {f.estimatedMonthlyPayment != null && <div><span className="text-slate-500">Payment: </span><span className="text-white">{formatCurrency(f.estimatedMonthlyPayment)}/mo</span></div>}
                    {f.loanAmount != null && <div><span className="text-slate-500">Loan: </span><span className="text-white">{formatCurrency(f.loanAmount)}</span></div>}
                    {f.minimumRaise != null && <div><span className="text-slate-500">Min Raise: </span><span className="text-white">{formatCurrency(f.minimumRaise)}</span></div>}
                    {f.interestRate && <div><span className="text-slate-500">Rate: </span><span className="text-white">{f.interestRate}</span></div>}
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{f.bestFor}</p>
                  {f.risks && <p className="text-amber-400/70 text-xs mt-2">⚠ {f.risks}</p>}
                  {f.negotiationTips && <p className="text-emerald-400/70 text-xs mt-1">💡 {f.negotiationTips}</p>}
                  {f.requirements && <p className="text-slate-500 text-xs mt-1 italic">{f.requirements}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Development Options */}
        {a.developmentOptions && a.developmentOptions.length > 0 && (
          <Section title="Development Opportunities">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {a.developmentOptions.map((d: any, i: number) => (
                <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-blue-400 font-bold text-sm">{d.option}</h3>
                    {d.permitDifficulty && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        d.permitDifficulty === "Easy" ? "bg-emerald-900 text-emerald-400" :
                        d.permitDifficulty === "Moderate" ? "bg-amber-900 text-amber-400" :
                        "bg-red-900 text-red-400"
                      }`}>{d.permitDifficulty} permits</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mb-3">{d.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><p className="text-slate-500 text-xs">Cost</p><p className="text-white font-semibold text-sm">{formatCurrency(d.estimatedCost)}</p></div>
                    <div><p className="text-slate-500 text-xs">Revenue/mo</p><p className="text-emerald-400 font-semibold text-sm">{formatCurrency(d.estimatedMonthlyRevenue || (d.estimatedAnnualRevenue ? Math.round(d.estimatedAnnualRevenue / 12) : d.estimatedRevenue ? Math.round(d.estimatedRevenue / 12) : null))}</p></div>
                    <div><p className="text-slate-500 text-xs">Timeline</p><p className="text-white font-semibold text-sm">{d.timelineMonths} mo</p></div>
                  </div>
                  {d.zoningNotes && <p className="text-amber-400/70 text-xs mt-2">{d.zoningChangeNeeded ? "⚠ Zoning change needed: " : "✓ Zoning: "}{d.zoningNotes}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Construction Estimate */}
        {a.constructionEstimate && (
          <Section title="Construction & Operating Estimates">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <StatCard label="Total Rehab Cost" value={formatCurrency(a.constructionEstimate.totalRehabCost)} />
              <StatCard label="Cost/Sq Ft" value={a.constructionEstimate.costPerSqft ? `$${a.constructionEstimate.costPerSqft}` : "N/A"} />
              <StatCard label="Timeline" value={a.constructionEstimate.timelineWeeks + " weeks"} />
              <StatCard label="Stabilized Income" value={formatCurrency(a.constructionEstimate.stabilizedMonthlyIncome) + "/mo"} />
              <StatCard label="Annual NOI" value={formatCurrency(a.constructionEstimate.annualOperatingIncome)} />
              <StatCard label="Annual Expenses" value={formatCurrency(a.constructionEstimate.operatingExpenses)} />
            </div>
            {a.constructionEstimate.majorCostItems && a.constructionEstimate.majorCostItems.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-3">
                <h4 className="text-slate-300 text-sm font-medium mb-2">Major Cost Items</h4>
                <div className="space-y-1">
                  {a.constructionEstimate.majorCostItems.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm"><span className="text-slate-400">{item.item}</span><span className="text-white font-medium">{formatCurrency(item.cost)}</span></div>
                  ))}
                </div>
              </div>
            )}
            {a.constructionEstimate.expenseBreakdown && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <h4 className="text-slate-300 text-sm font-medium mb-2">Annual Expense Breakdown</h4>
                <div className="space-y-1">
                  {a.constructionEstimate.expenseBreakdown.propertyTax != null && <div className="flex justify-between text-sm"><span className="text-slate-400">Property Tax</span><span className="text-white">{formatCurrency(a.constructionEstimate.expenseBreakdown.propertyTax)}</span></div>}
                  {a.constructionEstimate.expenseBreakdown.insurance != null && <div className="flex justify-between text-sm"><span className="text-slate-400">Insurance</span><span className="text-white">{formatCurrency(a.constructionEstimate.expenseBreakdown.insurance)}</span></div>}
                  {a.constructionEstimate.expenseBreakdown.maintenance != null && <div className="flex justify-between text-sm"><span className="text-slate-400">Maintenance</span><span className="text-white">{formatCurrency(a.constructionEstimate.expenseBreakdown.maintenance)}</span></div>}
                  {a.constructionEstimate.expenseBreakdown.vacancy != null && <div className="flex justify-between text-sm"><span className="text-slate-400">Vacancy Reserve</span><span className="text-white">{formatCurrency(a.constructionEstimate.expenseBreakdown.vacancy)}</span></div>}
                  {a.constructionEstimate.expenseBreakdown.management != null && <div className="flex justify-between text-sm"><span className="text-slate-400">Property Management</span><span className="text-white">{formatCurrency(a.constructionEstimate.expenseBreakdown.management)}</span></div>}
                  {a.constructionEstimate.expenseBreakdown.capex != null && <div className="flex justify-between text-sm"><span className="text-slate-400">CapEx Reserve</span><span className="text-white">{formatCurrency(a.constructionEstimate.expenseBreakdown.capex)}</span></div>}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Data Center Analysis */}
        {a.dataCenterAnalysis && a.dataCenterAnalysis !== null && (
          <>
            {/* Facility Overview */}
            {a.dataCenterAnalysis.facilityOverview && (
              <Section title="Data Center — Facility Overview">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Total Sq Ft" value={a.dataCenterAnalysis.facilityOverview.totalSqft?.toLocaleString() || "N/A"} />
                  <StatCard label="White Space" value={a.dataCenterAnalysis.facilityOverview.raisedFloorSqft?.toLocaleString() + " sqft" || "N/A"} />
                  <StatCard label="Rack Capacity" value={a.dataCenterAnalysis.facilityOverview.totalRacks?.toString() + " racks" || "N/A"} />
                  <StatCard label="Power Capacity" value={a.dataCenterAnalysis.facilityOverview.powerCapacityMW + " MW" || "N/A"} />
                  <StatCard label="Redundancy" value={a.dataCenterAnalysis.facilityOverview.redundancyTier || "N/A"} />
                  <StatCard label="Cooling" value={a.dataCenterAnalysis.facilityOverview.coolingType || "N/A"} />
                  <StatCard label="PUE Target" value={a.dataCenterAnalysis.facilityOverview.pueTarget?.toString() || "N/A"} />
                </div>
              </Section>
            )}

            {/* Build Costs */}
            {a.dataCenterAnalysis.buildCosts && (
              <Section title="Data Center — Build Costs">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <StatCard label="Total Build Cost" value={formatCurrency(a.dataCenterAnalysis.buildCosts.totalBuildCost)} />
                  <StatCard label="Build Timeline" value={a.dataCenterAnalysis.buildCosts.buildTimelineMonths + " months"} />
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <h4 className="text-slate-300 text-sm font-medium mb-2">Build Cost Breakdown</h4>
                  <div className="space-y-1">
                    {a.dataCenterAnalysis.buildCosts.shellConstruction != null && <div className="flex justify-between text-sm"><span className="text-slate-400">Shell Construction</span><span className="text-white font-medium">{formatCurrency(a.dataCenterAnalysis.buildCosts.shellConstruction)}</span></div>}
                    {a.dataCenterAnalysis.buildCosts.electricalInfrastructure != null && <div className="flex justify-between text-sm"><span className="text-slate-400">Electrical Infrastructure</span><span className="text-white font-medium">{formatCurrency(a.dataCenterAnalysis.buildCosts.electricalInfrastructure)}</span></div>}
                    {a.dataCenterAnalysis.buildCosts.coolingInfrastructure != null && <div className="flex justify-between text-sm"><span className="text-slate-400">Cooling Infrastructure</span><span className="text-white font-medium">{formatCurrency(a.dataCenterAnalysis.buildCosts.coolingInfrastructure)}</span></div>}
                    {a.dataCenterAnalysis.buildCosts.backupPower != null && <div className="flex justify-between text-sm"><span className="text-slate-400">Backup Power (Generators/UPS)</span><span className="text-white font-medium">{formatCurrency(a.dataCenterAnalysis.buildCosts.backupPower)}</span></div>}
                    {a.dataCenterAnalysis.buildCosts.fireSupression != null && <div className="flex justify-between text-sm"><span className="text-slate-400">Fire Suppression</span><span className="text-white font-medium">{formatCurrency(a.dataCenterAnalysis.buildCosts.fireSupression)}</span></div>}
                    {a.dataCenterAnalysis.buildCosts.networkInfrastructure != null && <div className="flex justify-between text-sm"><span className="text-slate-400">Network Infrastructure</span><span className="text-white font-medium">{formatCurrency(a.dataCenterAnalysis.buildCosts.networkInfrastructure)}</span></div>}
                    {a.dataCenterAnalysis.buildCosts.security != null && <div className="flex justify-between text-sm"><span className="text-slate-400">Security & NOC</span><span className="text-white font-medium">{formatCurrency(a.dataCenterAnalysis.buildCosts.security)}</span></div>}
                  </div>
                </div>
              </Section>
            )}

            {/* Equipment — GPU Servers */}
            {a.dataCenterAnalysis.equipmentOptions && (
              <Section title="Data Center — Equipment & Specs">
                {a.dataCenterAnalysis.equipmentOptions.gpuServers && a.dataCenterAnalysis.equipmentOptions.gpuServers.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-purple-400 text-sm font-bold mb-3 uppercase tracking-wider">GPU Servers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {a.dataCenterAnalysis.equipmentOptions.gpuServers.map((gpu: any, i: number) => (
                        <div key={i} className="bg-slate-800 border border-purple-800/50 rounded-xl p-4">
                          <h5 className="text-purple-400 font-bold text-sm mb-1">{gpu.name}</h5>
                          <p className="text-slate-400 text-xs mb-3 font-mono">{gpu.specs}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-slate-500">Per Unit: </span><span className="text-white">{formatCurrency(gpu.costPerUnit)}</span></div>
                            <div><span className="text-slate-500">Power: </span><span className="text-white">{gpu.powerPerUnit}W</span></div>
                            <div><span className="text-slate-500">Qty: </span><span className="text-white">{gpu.quantity}</span></div>
                            <div><span className="text-slate-500">Total: </span><span className="text-emerald-400 font-semibold">{formatCurrency(gpu.totalCost)}</span></div>
                          </div>
                          <p className="text-slate-500 text-xs mt-2">{gpu.bestFor}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {a.dataCenterAnalysis.equipmentOptions.cpuServers && a.dataCenterAnalysis.equipmentOptions.cpuServers.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-blue-400 text-sm font-bold mb-3 uppercase tracking-wider">CPU Servers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {a.dataCenterAnalysis.equipmentOptions.cpuServers.map((cpu: any, i: number) => (
                        <div key={i} className="bg-slate-800 border border-blue-800/50 rounded-xl p-4">
                          <h5 className="text-blue-400 font-bold text-sm mb-1">{cpu.name}</h5>
                          <p className="text-slate-400 text-xs mb-3 font-mono">{cpu.specs}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-slate-500">Per Unit: </span><span className="text-white">{formatCurrency(cpu.costPerUnit)}</span></div>
                            <div><span className="text-slate-500">Power: </span><span className="text-white">{cpu.powerPerUnit}W</span></div>
                            <div><span className="text-slate-500">Qty: </span><span className="text-white">{cpu.quantity}</span></div>
                            <div><span className="text-slate-500">Total: </span><span className="text-emerald-400 font-semibold">{formatCurrency(cpu.totalCost)}</span></div>
                          </div>
                          <p className="text-slate-500 text-xs mt-2">{cpu.bestFor}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {a.dataCenterAnalysis.equipmentOptions.tpuAccelerators && a.dataCenterAnalysis.equipmentOptions.tpuAccelerators.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-amber-400 text-sm font-bold mb-3 uppercase tracking-wider">TPU / AI Accelerators</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {a.dataCenterAnalysis.equipmentOptions.tpuAccelerators.map((tpu: any, i: number) => (
                        <div key={i} className="bg-slate-800 border border-amber-800/50 rounded-xl p-4">
                          <h5 className="text-amber-400 font-bold text-sm mb-1">{tpu.name}</h5>
                          <p className="text-slate-400 text-xs mb-3 font-mono">{tpu.specs}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-slate-500">Per Unit: </span><span className="text-white">{formatCurrency(tpu.costPerUnit)}</span></div>
                            <div><span className="text-slate-500">Power: </span><span className="text-white">{tpu.powerPerUnit}W</span></div>
                            <div><span className="text-slate-500">Qty: </span><span className="text-white">{tpu.quantity}</span></div>
                            <div><span className="text-slate-500">Total: </span><span className="text-emerald-400 font-semibold">{formatCurrency(tpu.totalCost)}</span></div>
                          </div>
                          <p className="text-slate-500 text-xs mt-2">{tpu.bestFor}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Network & Storage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {a.dataCenterAnalysis.equipmentOptions.networkEquipment && (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                      <h4 className="text-slate-300 text-sm font-medium mb-2">Network Equipment</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-slate-500">ToR Switches: </span><span className="text-slate-300">{a.dataCenterAnalysis.equipmentOptions.networkEquipment.topOfRackSwitches}</span></div>
                        <div><span className="text-slate-500">Spine: </span><span className="text-slate-300">{a.dataCenterAnalysis.equipmentOptions.networkEquipment.spineSwitches}</span></div>
                        <div><span className="text-slate-500">Firewalls: </span><span className="text-slate-300">{a.dataCenterAnalysis.equipmentOptions.networkEquipment.firewalls}</span></div>
                        <div className="pt-1 border-t border-slate-700"><span className="text-slate-500">Total: </span><span className="text-emerald-400 font-semibold">{formatCurrency(a.dataCenterAnalysis.equipmentOptions.networkEquipment.totalNetworkCost)}</span></div>
                      </div>
                    </div>
                  )}
                  {a.dataCenterAnalysis.equipmentOptions.storageEquipment && (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                      <h4 className="text-slate-300 text-sm font-medium mb-2">Storage Equipment</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-slate-500">Primary: </span><span className="text-slate-300">{a.dataCenterAnalysis.equipmentOptions.storageEquipment.primaryStorage}</span></div>
                        <div><span className="text-slate-500">Backup: </span><span className="text-slate-300">{a.dataCenterAnalysis.equipmentOptions.storageEquipment.backupStorage}</span></div>
                        <div className="pt-1 border-t border-slate-700"><span className="text-slate-500">Total: </span><span className="text-emerald-400 font-semibold">{formatCurrency(a.dataCenterAnalysis.equipmentOptions.storageEquipment.totalStorageCost)}</span></div>
                      </div>
                    </div>
                  )}
                </div>

                {a.dataCenterAnalysis.equipmentOptions.totalEquipmentCost && (
                  <div className="bg-purple-950/30 border border-purple-800/50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-400 font-bold text-sm">Total Equipment Cost</span>
                      <span className="text-white text-xl font-bold">{formatCurrency(a.dataCenterAnalysis.equipmentOptions.totalEquipmentCost)}</span>
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Revenue Streams */}
            {a.dataCenterAnalysis.operatingIncome && (
              <Section title="Data Center — Revenue Streams">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {a.dataCenterAnalysis.operatingIncome.coloRackRental && (
                    <div className="bg-slate-800 border border-emerald-800/50 rounded-xl p-4">
                      <h5 className="text-emerald-400 font-bold text-sm mb-2">Colocation / Rack Rental</h5>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-slate-500">Per Rack: </span><span className="text-white">{formatCurrency(a.dataCenterAnalysis.operatingIncome.coloRackRental.pricePerRack)}/mo</span></div>
                        <div><span className="text-slate-500">Occupancy: </span><span className="text-white">{a.dataCenterAnalysis.operatingIncome.coloRackRental.occupancyRate}%</span></div>
                        <div><span className="text-slate-500">Monthly: </span><span className="text-emerald-400 font-semibold">{formatCurrency(a.dataCenterAnalysis.operatingIncome.coloRackRental.monthlyRevenue)}</span></div>
                        <div><span className="text-slate-500">Annual: </span><span className="text-emerald-400 font-semibold">{formatCurrency(a.dataCenterAnalysis.operatingIncome.coloRackRental.annualRevenue)}</span></div>
                      </div>
                    </div>
                  )}
                  {a.dataCenterAnalysis.operatingIncome.managedHosting && (
                    <div className="bg-slate-800 border border-emerald-800/50 rounded-xl p-4">
                      <h5 className="text-emerald-400 font-bold text-sm mb-2">Managed Hosting</h5>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-slate-500">Per Server: </span><span className="text-white">{formatCurrency(a.dataCenterAnalysis.operatingIncome.managedHosting.pricePerServer)}/mo</span></div>
                        <div><span className="text-slate-500">Clients: </span><span className="text-white">{a.dataCenterAnalysis.operatingIncome.managedHosting.estimatedClients}</span></div>
                        <div><span className="text-slate-500">Monthly: </span><span className="text-emerald-400 font-semibold">{formatCurrency(a.dataCenterAnalysis.operatingIncome.managedHosting.monthlyRevenue)}</span></div>
                        <div><span className="text-slate-500">Annual: </span><span className="text-emerald-400 font-semibold">{formatCurrency(a.dataCenterAnalysis.operatingIncome.managedHosting.annualRevenue)}</span></div>
                      </div>
                    </div>
                  )}
                  {a.dataCenterAnalysis.operatingIncome.gpuAsAService && (
                    <div className="bg-slate-800 border border-purple-800/50 rounded-xl p-4">
                      <h5 className="text-purple-400 font-bold text-sm mb-2">GPU-as-a-Service</h5>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-slate-500">Per GPU/hr: </span><span className="text-white">${a.dataCenterAnalysis.operatingIncome.gpuAsAService.pricePerGPUHour}</span></div>
                        <div><span className="text-slate-500">Utilization: </span><span className="text-white">{a.dataCenterAnalysis.operatingIncome.gpuAsAService.utilizationRate}%</span></div>
                        <div><span className="text-slate-500">Monthly: </span><span className="text-purple-400 font-semibold">{formatCurrency(a.dataCenterAnalysis.operatingIncome.gpuAsAService.monthlyRevenue)}</span></div>
                        <div><span className="text-slate-500">Annual: </span><span className="text-purple-400 font-semibold">{formatCurrency(a.dataCenterAnalysis.operatingIncome.gpuAsAService.annualRevenue)}</span></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-400 font-bold text-sm">Total Annual Revenue</span>
                    <span className="text-white text-xl font-bold">{formatCurrency(a.dataCenterAnalysis.operatingIncome.totalAnnualRevenue)}</span>
                  </div>
                </div>
              </Section>
            )}

            {/* Operating Expenses */}
            {a.dataCenterAnalysis.operatingExpenses && (
              <Section title="Data Center — Operating Expenses">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4">
                  <div className="space-y-2">
                    {a.dataCenterAnalysis.operatingExpenses.electricity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Electricity ({a.dataCenterAnalysis.operatingExpenses.electricity.costPerKWh ? `$${a.dataCenterAnalysis.operatingExpenses.electricity.costPerKWh}/kWh` : ""})</span>
                        <span className="text-red-400 font-medium">{formatCurrency(a.dataCenterAnalysis.operatingExpenses.electricity.annualCost)}/yr</span>
                      </div>
                    )}
                    {a.dataCenterAnalysis.operatingExpenses.cooling && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Cooling (additional)</span>
                        <span className="text-white">{formatCurrency(a.dataCenterAnalysis.operatingExpenses.cooling.annualCost)}/yr</span>
                      </div>
                    )}
                    {a.dataCenterAnalysis.operatingExpenses.internetBandwidth && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Bandwidth ({a.dataCenterAnalysis.operatingExpenses.internetBandwidth.description})</span>
                        <span className="text-white">{formatCurrency(a.dataCenterAnalysis.operatingExpenses.internetBandwidth.annualCost)}/yr</span>
                      </div>
                    )}
                    {a.dataCenterAnalysis.operatingExpenses.staffing && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Staffing ({a.dataCenterAnalysis.operatingExpenses.staffing.roles})</span>
                        <span className="text-white">{formatCurrency(a.dataCenterAnalysis.operatingExpenses.staffing.annualCost)}/yr</span>
                      </div>
                    )}
                    {a.dataCenterAnalysis.operatingExpenses.maintenance && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Maintenance</span>
                        <span className="text-white">{formatCurrency(a.dataCenterAnalysis.operatingExpenses.maintenance.annualCost)}/yr</span>
                      </div>
                    )}
                    {a.dataCenterAnalysis.operatingExpenses.insurance != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Insurance</span>
                        <span className="text-white">{formatCurrency(a.dataCenterAnalysis.operatingExpenses.insurance)}/yr</span>
                      </div>
                    )}
                    {a.dataCenterAnalysis.operatingExpenses.propertyTax != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Property Tax</span>
                        <span className="text-white">{formatCurrency(a.dataCenterAnalysis.operatingExpenses.propertyTax)}/yr</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-700 flex justify-between text-sm">
                      <span className="text-red-400 font-bold">Total Annual Expenses</span>
                      <span className="text-red-400 font-bold">{formatCurrency(a.dataCenterAnalysis.operatingExpenses.totalAnnualExpenses)}/yr</span>
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* Financial Summary */}
            {a.dataCenterAnalysis.financialSummary && (
              <Section title="Data Center — Financial Summary">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <StatCard label="Total Project Cost" value={formatCurrency(a.dataCenterAnalysis.financialSummary.totalProjectCost)} />
                  <StatCard label="Annual NOI" value={formatCurrency(a.dataCenterAnalysis.financialSummary.annualNOI)} />
                  <StatCard label="Cap Rate" value={a.dataCenterAnalysis.financialSummary.capRate + "%"} />
                  <StatCard label="Cash on Cash" value={a.dataCenterAnalysis.financialSummary.cashOnCashReturn + "%"} />
                  <StatCard label="Payback Period" value={a.dataCenterAnalysis.financialSummary.paybackPeriodYears + " years"} />
                  <StatCard label="Stabilization" value={a.dataCenterAnalysis.financialSummary.stabilizationTimeMonths + " months"} />
                </div>
              </Section>
            )}
          </>
        )}

        {/* Exit Strategies */}
        {a.exitStrategies && a.exitStrategies.length > 0 && (
          <Section title="Exit Strategies">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {a.exitStrategies.map((e: any, i: number) => {
                const riskColor = e.riskLevel === "Low" ? "text-emerald-400" : e.riskLevel === "Medium" ? "text-amber-400" : "text-red-400";
                return (
                  <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold text-sm">{e.strategy}</h3>
                      <span className={`text-xs font-medium ${riskColor}`}>{e.riskLevel} Risk</span>
                    </div>
                    <p className="text-slate-400 text-xs mb-3">{e.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-slate-500">Profit: </span><span className="text-emerald-400 font-semibold">{formatCurrency(e.projectedProfit)}</span></div>
                      <div><span className="text-slate-500">Timeline: </span><span className="text-white">{e.timelineMonths} months</span></div>
                      {e.roi != null && <div><span className="text-slate-500">ROI: </span><span className="text-emerald-400 font-semibold">{e.roi}%</span></div>}
                      {e.totalInvestment != null && <div><span className="text-slate-500">All-In: </span><span className="text-white">{formatCurrency(e.totalInvestment)}</span></div>}
                      {e.monthlyIncome != null && <div><span className="text-slate-500">Income: </span><span className="text-emerald-400">{formatCurrency(e.monthlyIncome)}/mo</span></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Positives & Red Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {a.positives && a.positives.length > 0 && (
            <div className="bg-emerald-950/50 border border-emerald-800 rounded-xl p-5">
              <h3 className="text-emerald-400 font-bold mb-3">Positives</h3>
              <ul className="space-y-2">{a.positives.map((p: string, i: number) => (<li key={i} className="text-emerald-200/80 text-sm flex gap-2"><span className="text-emerald-500 shrink-0">✓</span> {p}</li>))}</ul>
            </div>
          )}
          {a.redFlags && a.redFlags.length > 0 && (
            <div className="bg-red-950/50 border border-red-800 rounded-xl p-5">
              <h3 className="text-red-400 font-bold mb-3">Red Flags</h3>
              <ul className="space-y-2">{a.redFlags.map((f: string, i: number) => (<li key={i} className="text-red-200/80 text-sm flex gap-2"><span className="text-red-500 shrink-0">✕</span> {f}</li>))}</ul>
            </div>
          )}
        </div>

        {/* Market Insights */}
        {a.marketInsights && (
          <Section title="Market Insights">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <StatCard label="Growth Trend" value={a.marketInsights.areaGrowthTrend ?? "N/A"} />
              <StatCard label="Demand" value={a.marketInsights.demandLevel ?? "N/A"} />
              <StatCard label="Median Home Price" value={formatCurrency(a.marketInsights.medianHomePrice)} />
              <StatCard label="Median Rent" value={formatCurrency(a.marketInsights.medianRent)} />
              <StatCard label="Rent Growth" value={a.marketInsights.rentGrowthProjection ?? "N/A"} />
              <StatCard label="Appreciation" value={a.marketInsights.appreciationProjection ?? "N/A"} />
            </div>
            {a.marketInsights.keyFactors && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-300 text-sm font-medium mb-1">Key Market Factors</p>
                <p className="text-slate-400 text-sm">{a.marketInsights.keyFactors.join(" • ")}</p>
              </div>
            )}
          </Section>
        )}
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setExpandedImage(null)}>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-lg">{expandedImage.label}</h3>
              <button onClick={() => setExpandedImage(null)} className="text-slate-400 hover:text-white text-2xl leading-none">✕</button>
            </div>
            <img src={expandedImage.url} alt={expandedImage.label} className="w-full rounded-xl" />
            <div className="flex justify-end mt-3">
              <a href={expandedImage.url} target="_blank" rel="noopener noreferrer" className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">Open Full Size ↗</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
