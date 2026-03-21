"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function AnalyzeForm() {
const router = useRouter();
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [form, setForm] = useState({
address: ""
,
price: ""
,
sqft: ""
,
bedrooms: ""
,
bathrooms: ""
,
notes: ""
,
});
const update = (field: string, value: string) =>
setForm((prev) => ({ ...prev, [field]: value }));
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setError("");
try {
const res = await fetch("/api/analyze"
, {
method: "POST"
,
headers: { "Content-Type": "application/json" },
body: JSON.stringify(form),
});if (!res.ok) {
const d = await res.json();
throw new Error(d.error ?? "Analysis failed");
}
const data = await res.json();
router.push(`/analyze/${data.dealId}`);
} catch (err: any) {
setError(err.message ?? "Something went wrong. Please try again.");
setLoading(false);
}
};
return (
<form onSubmit={handleSubmit}
noValidate
className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
{/* Address */}
<div>
<label className="block text-sm font-medium text-slate-700 mb-1">
Property Address *
</label>
<input
type="text"
required
placeholder="123 Main St, Austin TX 78701"
value={form.address}
onChange={(e) => update("address"
, e.target.value)}
className="w-full border border-slate-300 rounded-lg px-4 py-3
focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
/></div>
{/* Price and Sqft */}
<div className="grid grid-cols-2 gap-4">
<div>
<label className="block text-sm font-medium text-slate-700 mb-1">
Asking Price ($) *
</label>
<input
type="text" inputMode="numeric"
required
placeholder="250000"
value={form.price}
onChange={(e) => update("price"
, e.target.value)}
className="w-full border border-slate-300 rounded-lg px-4 py-3
focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
/>
</div>
<div>
<label className="block text-sm font-medium text-slate-700 mb-1">
Square Feet
</label>
<input
type="text" inputMode="numeric"
placeholder="1400"
value={form.sqft}
onChange={(e) => update("sqft"
, e.target.value)}
className="w-full border border-slate-300 rounded-lg px-4 py-3
focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
/></div>
</div>
{/* Bedrooms and Bathrooms */}
<div className="grid grid-cols-2 gap-4">
<div>
<label className="block text-sm font-medium text-slate-700 mb-1">
Bedrooms
</label>
<input
type="text" inputMode="numeric"
placeholder="3"
value={form.bedrooms}
onChange={(e) => update("bedrooms"
, e.target.value)}
className="w-full border border-slate-300 rounded-lg px-4 py-3
focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
/>
</div>
<div>
<label className="block text-sm font-medium text-slate-700 mb-1">
Bathrooms
</label>
<input
type="text" inputMode="numeric"
placeholder="2"
value={form.bathrooms}
onChange={(e) => update("bathrooms"
, e.target.value)}
className="w-full border border-slate-300 rounded-lg px-4 py-3
focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
/></div>
</div>
{/* Notes */}
<div>
<label className="block text-sm font-medium text-slate-700 mb-1">
Additional Notes
</label>
<textarea
rows={3}
placeholder="Condition, neighborhood, renovation needed, rental comps..."
value={form.notes}
onChange={(e) => update("notes"
, e.target.value)}
className="w-full border border-slate-300 rounded-lg px-4 py-3
focus:outline-none focus:ring-2 focus:ring-blue-500
text-sm resize-none"
/>
</div>
{/* Error */}
{error && (
<p className="text-red-600 text-sm bg-red-50 border border-red-200
rounded-lg px-4 py-3">
{error}
</p>
)}
{/* Submit */}
<button
type="submit"
disabled={loading}
className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60
text-white font-semibold py-3.5 rounded-xl transition-colors
text-base"
>
{loading ? "Analyzing deal with AI..." : "Analyze This Deal →"}
</button>
</form>
);
}
