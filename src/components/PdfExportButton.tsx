"use client";
import { useState } from "react";

export default function PdfExportButton({ deal }: { deal: any }) {
  const [loading, setLoading] = useState(false);

  const exportPdf = async () => {
    setLoading(true);
    try {
      const jsPDF = (await import("jspdf")).default;
      await import("jspdf-autotable");
      const doc: any = new jsPDF();
      const a = deal.analysis;

      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
       doc.text("KataDeals", 14, 18);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("AI Real Estate Deal Analysis", 14, 25);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(deal.address || "Property", 14, 45);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text("Asking: $" + Number(deal.price).toLocaleString(), 14, 52);
      doc.text("Generated: " + new Date().toLocaleDateString(), 14, 58);

      const recoColor: any = { BUY: [34, 197, 94], HOLD: [234, 179, 8], PASS: [239, 68, 68] };
      const c = recoColor[a.recommendation] || [100, 100, 100];
      doc.setFillColor(c[0], c[1], c[2]);
      doc.roundedRect(14, 65, 60, 18, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(a.recommendation, 20, 77);
      doc.setFontSize(10);
      doc.text("Score: " + a.dealScore + "/10", 80, 77);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 14, 95);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(a.summary || "", 180);
      doc.text(summaryLines, 14, 102);

      doc.autoTable({
        startY: 130,
        head: [["Metric", "Value"]],
        body: [
          ["Estimated ARV", "$" + (a.estimatedARV || 0).toLocaleString()],
          ["Monthly Rent", "$" + (a.estimatedMonthlyRent || 0).toLocaleString()],
          ["Monthly Cash Flow", "$" + (a.estimatedCashFlow || 0).toLocaleString()],
          ["Cap Rate", (a.capRate || 0) + "%"],
        ],
        theme: "grid",
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      });

      let y = doc.lastAutoTable.finalY + 15;

      if (a.positives && a.positives.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(34, 197, 94);
        doc.text("Positives", 14, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        a.positives.forEach((p: string) => {
          const lines = doc.splitTextToSize("- " + p, 180);
          doc.text(lines, 14, y);
          y += lines.length * 5;
        });
        y += 5;
      }

      if (a.redFlags && a.redFlags.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(239, 68, 68);
        doc.text("Red Flags", 14, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        a.redFlags.forEach((f: string) => {
          const lines = doc.splitTextToSize("- " + f, 180);
          doc.text(lines, 14, y);
          y += lines.length * 5;
        });
      }

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Powered by KataDeals.com - AI Real Estate Analysis", 14, 285);

      const name = (deal.address || "deal").replace(/[^a-z0-9]/gi, "-").toLowerCase();
      doc.save("katadeals-" + name + ".pdf");
    } catch (e) {
      console.error(e);
      alert("Could not generate PDF");
    }
    setLoading(false);
  };

  return (
    <button onClick={exportPdf} disabled={loading}
      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
      {loading ? "Generating..." : "Download PDF Report"}
    </button>
  );
}