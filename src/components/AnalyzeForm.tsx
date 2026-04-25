"use client";
import { useState, useRef } from "react";
import DealReport from "./DealReport";

const COMMERCIAL_SUBTYPES = [
  "Shopping Plaza",
  "Warehouse",
  "Logistics Center",
  "Data Center",
  "Hotel",
  "Cold Storage",
  "Storage Unit Facility",
  "Semi Truck & Equipment Parking",
];

export default function AnalyzeForm() {
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Land building selections
  const [buildingTypes, setBuildingTypes] = useState<string[]>([]);
  const [commercialSubtypes, setCommercialSubtypes] = useState<string[]>([]);
  const [franchiseName, setFranchiseName] = useState("");

  const [form, setForm] = useState({
    address: "",
    price: "",
    sqft: "",
    bedrooms: "",
    bathrooms: "",
    notes: "",
    propertyType: "existing",
    rehabLevel: "cosmetic",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleBuildingType = (type: string) => {
    setBuildingTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    if (type === "Commercial" && buildingTypes.includes("Commercial")) {
      setCommercialSubtypes([]);
    }
  };

  const toggleCommercialSubtype = (subtype: string) => {
    setCommercialSubtypes((prev) =>
      prev.includes(subtype) ? prev.filter((s) => s !== subtype) : [...prev, subtype]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPhotos = photos.length + files.length;
    if (totalPhotos > 6) {
      setError("Maximum 6 photos allowed.");
      return;
    }
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    const newPreviews = [...photoPreviews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newPreviews.push(ev.target?.result as string);
        setPhotoPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const isLand = form.propertyType === "land";

    // Validate land selections
    if (isLand && buildingTypes.length === 0) {
      setError("Please select at least one building type for land analysis.");
      setLoading(false);
      return;
    }
    if (isLand && buildingTypes.includes("Commercial") && commercialSubtypes.length === 0) {
      setError("Please select at least one commercial sub-type.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Text analysis
      setLoadingStatus("Analyzing deal with AI...");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Analysis failed");
      }
      const data = await res.json();

      // Step 2: Generate visuals
      let visuals = null;

      if (isLand || photos.length > 0) {
        if (isLand) {
          const totalRenderings = buildingTypes.filter((t) => t !== "Commercial").length +
            commercialSubtypes.length +
            (buildingTypes.includes("Franchise") ? 3 : 0); // 3 franchise layouts
          setLoadingStatus(`Generating ${totalRenderings} construction renderings...`);
        } else {
          setLoadingStatus(
            `Generating ${form.rehabLevel} renovation visuals for ${photos.length} photos...`
          );
        }

        // Convert photos to base64
        const photoBase64: string[] = [];
        for (const photo of photos) {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(photo);
          });
          photoBase64.push(base64);
        }

        const visualRes = await fetch("/api/generate-visuals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: form.address,
            propertyType: isLand ? "Land" : data.analysis?.propertyDetails?.propertyType || "Single Family",
            sqft: form.sqft || data.analysis?.propertyDetails?.estimatedSqft || null,
            bedrooms: form.bedrooms || data.analysis?.propertyDetails?.estimatedBedrooms || null,
            bathrooms: form.bathrooms || data.analysis?.propertyDetails?.estimatedBathrooms || null,
            lotSize: data.analysis?.propertyDetails?.estimatedLotSize || null,
            neighborhood: data.analysis?.propertyDetails?.neighborhood || null,
            rehabLevel: form.rehabLevel,
            rehabAnalysis: data.analysis?.rehabAnalysis || null,
            developmentOptions: data.analysis?.developmentOptions || [],
            photos: photoBase64,
            notes: form.notes || null,
            // Land-specific
            buildingTypes,
            commercialSubtypes,
            franchiseName: franchiseName.trim() || null,
          }),
        });

        if (visualRes.ok) {
          visuals = await visualRes.json();
        }
      }

      setResult({
        id: data.dealId || "temp",
        address: form.address,
        price: parseFloat(form.price),
        analysis: data.analysis,
        visuals,
        rehabLevel: form.rehabLevel,
        propertyType: form.propertyType,
        uploadedPhotos: photoPreviews,
        franchiseName: franchiseName.trim() || null,
        createdAt: new Date(),
        user: { name: null, email: null },
      });
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    }
    setLoading(false);
    setLoadingStatus("");
  };

  if (result) {
    return (
      <div className="space-y-6">
        <DealReport deal={result} />
        <button
          onClick={() => {
            setResult(null);
            setPhotos([]);
            setPhotoPreviews([]);
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
        >
          ← Analyze Another Deal
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-slate-900 border border-slate-700 rounded-2xl p-6 md:p-8 space-y-5"
    >
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Property Address *
        </label>
        <input
          type="text"
          required
          placeholder="123 Main St, Austin TX 78701"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Asking Price ($) *
          </label>
          <input
            type="text"
            inputMode="numeric"
            required
            placeholder="250000"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Square Feet
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="1400"
            value={form.sqft}
            onChange={(e) => update("sqft", e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Bedrooms
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="3"
            value={form.bedrooms}
            onChange={(e) => update("bedrooms", e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Bathrooms
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="2"
            value={form.bathrooms}
            onChange={(e) => update("bathrooms", e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Property Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => update("propertyType", "existing")}
            className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${
              form.propertyType === "existing"
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500"
            }`}
          >
            Existing Property
          </button>
          <button
            type="button"
            onClick={() => update("propertyType", "land")}
            className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${
              form.propertyType === "land"
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500"
            }`}
          >
            Vacant Land
          </button>
        </div>
      </div>

      {/* === EXISTING PROPERTY OPTIONS === */}
      {form.propertyType === "existing" && (
        <>
          {/* Rehab Level */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Rehab Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "cosmetic", label: "Cosmetic", color: "emerald" },
                { key: "moderate", label: "Moderate", color: "amber" },
                { key: "fullGut", label: "Full Gut", color: "red" },
              ].map((level) => (
                <button
                  key={level.key}
                  type="button"
                  onClick={() => update("rehabLevel", level.key)}
                  className={`py-3 px-3 rounded-xl text-sm font-medium transition-colors border ${
                    form.rehabLevel === level.key
                      ? `bg-${level.color}-600 border-${level.color}-500 text-white`
                      : "bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                  style={
                    form.rehabLevel === level.key
                      ? {
                          backgroundColor:
                            level.color === "emerald" ? "#059669" :
                            level.color === "amber" ? "#d97706" : "#dc2626",
                          borderColor:
                            level.color === "emerald" ? "#10b981" :
                            level.color === "amber" ? "#f59e0b" : "#ef4444",
                          color: "white",
                        }
                      : {}
                  }
                >
                  {level.label}
                </button>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-1.5">
              {form.rehabLevel === "cosmetic" && "Paint, fixtures, landscaping, minor repairs"}
              {form.rehabLevel === "moderate" && "Kitchen/bath remodel, new flooring, updated systems"}
              {form.rehabLevel === "fullGut" && "Complete renovation — new layout, all systems, structural work"}
            </p>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Property Photos (up to 6)
            </label>
            <p className="text-slate-500 text-xs mb-3">
              Upload photos and KataDeals will show you what the property could look like after renovation.
            </p>

            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {photoPreviews.map((preview, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={preview}
                      alt={`Photo ${i + 1}`}
                      className="w-full aspect-video object-cover rounded-lg border border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1.5 right-1.5 bg-red-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {photos.length < 6 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-slate-800 border-2 border-dashed border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300 rounded-xl py-4 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {photos.length === 0 ? "Upload Property Photos" : `Add More Photos (${photos.length}/6)`}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </>
      )}

      {/* === VACANT LAND OPTIONS === */}
      {form.propertyType === "land" && (
        <>
          {/* Building Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              What do you want to build? (select all that apply) *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["Residential", "Multifamily", "Commercial", "Franchise"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleBuildingType(type)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors border ${
                    buildingTypes.includes(type)
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Commercial Sub-types */}
          {buildingTypes.includes("Commercial") && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Commercial Type (select all that apply) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COMMERCIAL_SUBTYPES.map((subtype) => (
                  <button
                    key={subtype}
                    type="button"
                    onClick={() => toggleCommercialSubtype(subtype)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-colors border ${
                      commercialSubtypes.includes(subtype)
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {subtype}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Franchise Input */}
          {buildingTypes.includes("Franchise") && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                What type of franchise?
              </label>
              <input
                type="text"
                placeholder="e.g. Fast food restaurant, Coffee shop, Gas station, Gym..."
                value={franchiseName}
                onChange={(e) => setFranchiseName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="text-slate-500 text-xs mt-1.5">
                We'll generate 3 floor plan layouts: Counter Service (1,200-2,500 sqft), Assembly Line (1,500-2,000 sqft), and Drive-Thru Hybrid (2,500-4,000 sqft)
              </p>
            </div>
          )}
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Additional Notes
        </label>
        <textarea
          rows={3}
          placeholder={
            form.propertyType === "land"
              ? "Lot size, zoning, utilities available, intended use..."
              : "Condition, neighborhood, renovation needed, rental comps..."
          }
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-950/50 border border-red-800 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {loadingStatus || "Analyzing deal with AI..."}
          </span>
        ) : (
          "Analyze This Deal →"
        )}
      </button>
    </form>
  );
}
