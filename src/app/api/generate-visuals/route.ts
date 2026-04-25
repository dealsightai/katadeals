import { NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

type VisualRequest = {
  address: string;
  propertyType: string;
  sqft: string | number | null;
  bedrooms: string | number | null;
  bathrooms: string | number | null;
  lotSize: string | null;
  neighborhood: string | null;
  rehabLevel: string;
  rehabAnalysis: any;
  developmentOptions: any[];
  photos: string[];
  notes: string | null;
  buildingTypes: string[];
  commercialSubtypes: string[];
  franchiseName: string | null;
};

async function describeFranchiseStyle(openai: OpenAI, franchiseName: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: `You are an architectural consultant. Describe the typical building design and exterior appearance of a "${franchiseName}" franchise location in precise architectural terms for an AI image generator. DO NOT use the brand name, logos, or any trademarked elements in your description.

Instead, describe:
- Building shape, height, and approximate size
- Facade materials (brick, stone, stucco, metal panels, glass, wood accents)
- Color palette (describe the actual colors, not brand colors by name)
- Roof style (flat, peaked, mansard, etc.)
- Window style and placement
- Entrance design (single door, double glass, vestibule)
- Drive-through presence and style (if applicable)
- Outdoor seating/patio (if typical)
- Parking lot layout
- Landscaping style
- Any distinctive architectural features that make it recognizable WITHOUT branding

Respond with ONLY the architectural description, no introduction or explanation. 2-3 sentences max.`,
      },
    ],
  });
  return response.choices[0]?.message?.content || "Modern single-story commercial restaurant building with drive-through lane";
}

async function describePhoto(openai: OpenAI, photoBase64: string, index: number): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: photoBase64 } },
          {
            type: "text",
            text: "Describe this real estate photo in detail for an AI image generator. Include: what room or area it shows (kitchen, bathroom, living room, exterior, etc.), the current condition, materials visible (flooring type, cabinet style, countertops, fixtures), the angle/perspective of the photo, lighting, and any distinctive features. Be specific and concise — 2-3 sentences max.",
          },
        ],
      },
    ],
  });
  return response.choices[0]?.message?.content || `Room photo ${index + 1}`;
}

function buildRenovationPrompt(description: string, level: string, property: VisualRequest): string {
  const rehabDescriptions: Record<string, string> = {
    cosmetic: `COSMETIC RENOVATION of this exact space: Same layout and angle as described. Apply fresh paint in modern neutral colors (warm white walls, white trim). Install new modern brushed nickel or matte black light fixtures. Update cabinet hardware to modern pulls. Add new window treatments. Clean and polish all surfaces. Stage with modern furniture and decor. The space should look clean, fresh, and move-in ready but the bones and layout remain the same. Professional real estate photography, bright and well-lit.`,
    moderate: `MODERATE RENOVATION of this exact space: Same angle and perspective but significantly updated. New shaker-style cabinets (if kitchen/bath), quartz countertops, subway tile backsplash. New luxury vinyl plank flooring. All new modern fixtures and hardware. Fresh paint throughout. Updated bathroom with new tile, modern vanity, frameless mirror. Recessed LED lighting. New baseboards and trim. The space is completely refreshed with mid-range modern finishes. Professional real estate photography, bright and airy.`,
    fullGut: `FULL GUT LUXURY RENOVATION of this exact space: Same general room/angle but completely transformed. If kitchen: custom cabinets, waterfall quartz island, high-end stainless appliances, designer pendant lighting, hardwood floors. If bathroom: freestanding soaking tub, walk-in rain shower with frameless glass, double vanity with stone counters, heated floors. If living area: open concept, coffered ceilings, built-in shelving, hardwood floors, designer lighting, floor-to-ceiling windows. Everything is brand new, high-end, and magazine-quality. Professional architectural photography.`,
  };

  return `Based on this original photo description: "${description}"

Property: ${property.address}, ${property.sqft ? property.sqft + " sqft" : ""} ${property.bedrooms ? property.bedrooms + " bed" : ""} ${property.bathrooms ? property.bathrooms + " bath" : ""}.

Generate a photorealistic image showing the ${rehabDescriptions[level] || rehabDescriptions.cosmetic}

CRITICAL: Make the image look like a REAL photograph, not a 3D render. Natural lighting, realistic textures, slight imperfections that make it look authentic. Professional real estate photography style.`;
}

function buildGroundUpPrompt(buildingType: string, property: VisualRequest): string {
  const lot = property.lotSize || "standard lot";
  const location = property.neighborhood || property.address;

  const prompts: Record<string, string> = {
    Residential: `Photorealistic architectural rendering of a newly constructed modern single-family home on a ${lot} in ${location}. Contemporary design with clean lines, mixed materials — fiber cement siding, stone accents, black-framed windows. Covered front porch, attached two-car garage, professional landscaping with concrete driveway. Two-story, approximately 2,200 sqft. Daytime exterior shot, blue sky, realistic lighting. Looks like a real photograph. No text, labels, or watermarks.`,
    Multifamily: `Photorealistic architectural rendering of a newly constructed multifamily apartment building on a ${lot} in ${location}. Modern apartment complex — 3 stories, 16-24 units, private balconies with glass railings, covered parking, landscaped courtyard with seating areas. Contemporary design with mixed materials, earth tones. Daytime shot, realistic lighting. Looks like a real photograph. No text, labels, or watermarks.`,
    "Shopping Plaza": `Photorealistic architectural rendering of a newly constructed shopping plaza on a ${lot} in ${location}. L-shaped or strip mall design with 6-10 retail units, glass storefronts, covered walkway, shared parking lot with landscaping islands, monument sign area. Modern retail architecture with stone and stucco facade. Daytime shot, realistic lighting. No text, labels, or watermarks.`,
    "Warehouse": `Photorealistic architectural rendering of a newly constructed warehouse on a ${lot} in ${location}. Modern industrial warehouse — metal building with concrete tilt-up walls, multiple loading docks with levelers, truck court, office entrance with glass doors. Approximately 20,000-40,000 sqft. Clean industrial design. Daytime shot, realistic lighting. No text, labels, or watermarks.`,
    "Logistics Center": `Photorealistic architectural rendering of a newly constructed logistics and distribution center on a ${lot} in ${location}. Large modern logistics facility — cross-dock design, multiple truck bays on both sides, large paved truck court, office wing with glass facade, security gate. 50,000+ sqft. Contemporary industrial architecture. Daytime shot, realistic lighting. No text, labels, or watermarks.`,
    "Data Center": `Photorealistic architectural rendering of a newly constructed data center on a ${lot} in ${location}. Modern data center facility — windowless concrete and metal building with secure entrance, backup generator compound, cooling equipment on roof, secured perimeter with fencing, minimal landscaping. Sleek, high-security industrial design. Daytime shot, realistic lighting. No text, labels, or watermarks.`,
    "Hotel": `Photorealistic architectural rendering of a newly constructed hotel on a ${lot} in ${location}. Modern mid-scale hotel — 4-5 stories, 80-120 rooms, glass lobby entrance with porte-cochere, pool area visible, parking structure, landscaped grounds. Contemporary hospitality design with mixed materials. Daytime shot, realistic lighting. No text, labels, brand names, or watermarks.`,
    "Cold Storage": `Photorealistic architectural rendering of a newly constructed cold storage facility on a ${lot} in ${location}. Modern refrigerated warehouse — insulated metal panel construction, multiple refrigerated loading docks, condensing units on roof, truck staging area. 15,000-30,000 sqft. Clean industrial design optimized for temperature control. Daytime shot, realistic lighting. No text, labels, or watermarks.`,
    "Storage Unit Facility": `Photorealistic architectural rendering of a newly constructed self-storage facility on a ${lot} in ${location}. Modern self-storage — 3-story climate-controlled building with roll-up doors visible, plus single-story drive-up units, security gate with keypad, office/reception building, well-lit with security cameras. Clean modern design with bold colors. Daytime shot, realistic lighting. No text, labels, or watermarks.`,
    "Semi Truck & Equipment Parking": `Photorealistic architectural rendering of a newly constructed semi truck and equipment parking facility on a ${lot} in ${location}. Large paved and graded lot with marked parking spaces for semi trucks and heavy equipment, security fencing with razor wire, gated entrance with guard booth, lighting poles throughout, small office building at entrance, concrete barriers between spaces. Industrial but well-maintained. Daytime shot, realistic lighting. No text, labels, or watermarks.`,
  };

  return prompts[buildingType] || prompts.Residential;
}

function buildFranchiseLayoutSVG(
  layoutType: "counter" | "assembly" | "drivethru",
  franchiseName: string
): string {
  const name = franchiseName || "Franchise Restaurant";

  if (layoutType === "counter") {
    return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" style="background:#1e293b">
  <style>
    text { font-family: 'Segoe UI', system-ui, sans-serif; }
    .title { fill: #f8fafc; font-size: 18px; font-weight: 700; }
    .subtitle { fill: #94a3b8; font-size: 12px; }
    .label { fill: #e2e8f0; font-size: 11px; font-weight: 600; }
    .sublabel { fill: #94a3b8; font-size: 9px; }
    .arrow { fill: none; stroke: #22c55e; stroke-width: 2; marker-end: url(#arrowhead); }
    .flow-label { fill: #22c55e; font-size: 9px; font-weight: 600; }
  </style>
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#22c55e"/>
    </marker>
  </defs>
  <!-- Border -->
  <rect x="20" y="20" width="760" height="560" rx="12" fill="none" stroke="#334155" stroke-width="2"/>
  <!-- Title -->
  <text x="400" y="55" text-anchor="middle" class="title">${name} — Counter Service Layout</text>
  <text x="400" y="75" text-anchor="middle" class="subtitle">1,200 – 2,500 sq ft  |  Traditional counter ordering</text>
  <!-- Building outline -->
  <rect x="80" y="100" width="640" height="400" rx="6" fill="#0f172a" stroke="#475569" stroke-width="2"/>
  <!-- Kitchen / Back of House -->
  <rect x="90" y="110" width="300" height="380" rx="4" fill="#1a1a2e" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="240" y="135" text-anchor="middle" class="label">KITCHEN / BOH</text>
  <!-- Prep area -->
  <rect x="110" y="155" width="120" height="70" rx="3" fill="#312e81" opacity="0.5"/>
  <text x="170" y="195" text-anchor="middle" class="sublabel">PREP AREA</text>
  <!-- Cooking line -->
  <rect x="250" y="155" width="120" height="70" rx="3" fill="#7f1d1d" opacity="0.5"/>
  <text x="310" y="195" text-anchor="middle" class="sublabel">COOKING LINE</text>
  <!-- Walk-in -->
  <rect x="110" y="245" width="80" height="80" rx="3" fill="#1e3a5f" opacity="0.5"/>
  <text x="150" y="285" text-anchor="middle" class="sublabel">WALK-IN</text>
  <text x="150" y="298" text-anchor="middle" class="sublabel">COOLER</text>
  <!-- Storage -->
  <rect x="210" y="245" width="80" height="80" rx="3" fill="#1e3a5f" opacity="0.5"/>
  <text x="250" y="290" text-anchor="middle" class="sublabel">DRY STORAGE</text>
  <!-- Dish -->
  <rect x="310" y="245" width="60" height="80" rx="3" fill="#1e3a5f" opacity="0.5"/>
  <text x="340" y="290" text-anchor="middle" class="sublabel">DISH</text>
  <!-- Office -->
  <rect x="110" y="345" width="100" height="60" rx="3" fill="#1e3a5f" opacity="0.4"/>
  <text x="160" y="380" text-anchor="middle" class="sublabel">OFFICE</text>
  <!-- Restrooms -->
  <rect x="230" y="345" width="70" height="60" rx="3" fill="#1e3a5f" opacity="0.4"/>
  <text x="265" y="375" text-anchor="middle" class="sublabel">REST-</text>
  <text x="265" y="388" text-anchor="middle" class="sublabel">ROOMS</text>
  <!-- Mech -->
  <rect x="310" y="345" width="60" height="60" rx="3" fill="#1e3a5f" opacity="0.3"/>
  <text x="340" y="380" text-anchor="middle" class="sublabel">MECH</text>
  <!-- COUNTER -->
  <rect x="400" y="180" width="20" height="200" rx="3" fill="#f59e0b"/>
  <text x="395" y="280" text-anchor="end" class="label" transform="rotate(-90,395,280)" style="fill:#f59e0b">SERVICE COUNTER</text>
  <!-- Dining / FOH -->
  <rect x="430" y="110" width="280" height="380" rx="4" fill="#0c1524" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="570" y="135" text-anchor="middle" class="label">DINING / FOH</text>
  <!-- POS -->
  <rect x="440" y="200" width="50" height="40" rx="3" fill="#065f46" opacity="0.6"/>
  <text x="465" y="224" text-anchor="middle" class="sublabel">POS</text>
  <!-- Tables -->
  <rect x="510" y="165" width="60" height="40" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="590" y="165" width="60" height="40" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="510" y="225" width="60" height="40" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="590" y="225" width="60" height="40" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="510" y="285" width="60" height="40" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="590" y="285" width="60" height="40" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="510" y="345" width="60" height="40" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="590" y="345" width="60" height="40" rx="3" fill="#1e293b" stroke="#475569"/>
  <text x="570" y="438" text-anchor="middle" class="sublabel">8-12 TABLES / 32-48 SEATS</text>
  <!-- Entrance -->
  <rect x="650" y="440" width="50" height="40" rx="3" fill="#065f46"/>
  <text x="675" y="465" text-anchor="middle" class="sublabel" style="fill:white">ENTRY</text>
  <!-- Flow arrows -->
  <path d="M675 440 L675 350 L500 350 L500 280 L440 280" class="arrow"/>
  <text x="560" y="340" class="flow-label">CUSTOMER FLOW →</text>
  <!-- Food flow -->
  <path d="M310 190 L400 190" class="arrow" style="stroke:#f59e0b"/>
  <text x="350" y="183" class="flow-label" style="fill:#f59e0b">FOOD →</text>
</svg>`;
  }

  if (layoutType === "assembly") {
    return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" style="background:#1e293b">
  <style>
    text { font-family: 'Segoe UI', system-ui, sans-serif; }
    .title { fill: #f8fafc; font-size: 18px; font-weight: 700; }
    .subtitle { fill: #94a3b8; font-size: 12px; }
    .label { fill: #e2e8f0; font-size: 11px; font-weight: 600; }
    .sublabel { fill: #94a3b8; font-size: 9px; }
    .arrow { fill: none; stroke: #22c55e; stroke-width: 2; marker-end: url(#arrowhead2); }
    .flow-label { fill: #22c55e; font-size: 9px; font-weight: 600; }
  </style>
  <defs>
    <marker id="arrowhead2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#22c55e"/>
    </marker>
  </defs>
  <rect x="20" y="20" width="760" height="560" rx="12" fill="none" stroke="#334155" stroke-width="2"/>
  <text x="400" y="55" text-anchor="middle" class="title">${name} — Assembly Line Layout</text>
  <text x="400" y="75" text-anchor="middle" class="subtitle">1,500 – 2,000 sq ft  |  Customer walks the line, builds their order</text>
  <!-- Building -->
  <rect x="80" y="100" width="640" height="400" rx="6" fill="#0f172a" stroke="#475569" stroke-width="2"/>
  <!-- Kitchen -->
  <rect x="90" y="110" width="250" height="380" rx="4" fill="#1a1a2e" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="215" y="135" text-anchor="middle" class="label">KITCHEN / PREP</text>
  <rect x="110" y="155" width="100" height="65" rx="3" fill="#312e81" opacity="0.5"/>
  <text x="160" y="192" text-anchor="middle" class="sublabel">PREP STATION</text>
  <rect x="230" y="155" width="90" height="65" rx="3" fill="#7f1d1d" opacity="0.5"/>
  <text x="275" y="192" text-anchor="middle" class="sublabel">COOK LINE</text>
  <rect x="110" y="240" width="80" height="70" rx="3" fill="#1e3a5f" opacity="0.5"/>
  <text x="150" y="280" text-anchor="middle" class="sublabel">WALK-IN</text>
  <rect x="210" y="240" width="80" height="70" rx="3" fill="#1e3a5f" opacity="0.5"/>
  <text x="250" y="280" text-anchor="middle" class="sublabel">DRY</text>
  <text x="250" y="293" text-anchor="middle" class="sublabel">STORAGE</text>
  <rect x="110" y="330" width="80" height="55" rx="3" fill="#1e3a5f" opacity="0.4"/>
  <text x="150" y="362" text-anchor="middle" class="sublabel">OFFICE</text>
  <rect x="210" y="330" width="60" height="55" rx="3" fill="#1e3a5f" opacity="0.4"/>
  <text x="240" y="355" text-anchor="middle" class="sublabel">REST-</text>
  <text x="240" y="368" text-anchor="middle" class="sublabel">ROOMS</text>
  <!-- ASSEMBLY LINE - the star of this layout -->
  <rect x="350" y="140" width="360" height="70" rx="4" fill="#0c2918" stroke="#22c55e" stroke-width="2"/>
  <text x="530" y="165" text-anchor="middle" class="label" style="fill:#22c55e">ASSEMBLY LINE</text>
  <!-- Stations along the line -->
  <rect x="365" y="155" width="60" height="40" rx="2" fill="#065f46" opacity="0.6"/>
  <text x="395" y="178" text-anchor="middle" class="sublabel" style="fill:#a7f3d0">PROTEINS</text>
  <rect x="435" y="155" width="55" height="40" rx="2" fill="#065f46" opacity="0.6"/>
  <text x="462" y="178" text-anchor="middle" class="sublabel" style="fill:#a7f3d0">BASE</text>
  <rect x="500" y="155" width="60" height="40" rx="2" fill="#065f46" opacity="0.6"/>
  <text x="530" y="178" text-anchor="middle" class="sublabel" style="fill:#a7f3d0">TOPPINGS</text>
  <rect x="570" y="155" width="55" height="40" rx="2" fill="#065f46" opacity="0.6"/>
  <text x="597" y="178" text-anchor="middle" class="sublabel" style="fill:#a7f3d0">SAUCE</text>
  <rect x="635" y="155" width="60" height="40" rx="2" fill="#065f46" opacity="0.6"/>
  <text x="665" y="178" text-anchor="middle" class="sublabel" style="fill:#a7f3d0">CHECKOUT</text>
  <!-- Customer flow along line -->
  <path d="M365 145 L695 145" class="arrow"/>
  <text x="530" y="138" text-anchor="middle" class="flow-label">CUSTOMER FLOW →</text>
  <!-- Dining -->
  <rect x="350" y="230" width="360" height="260" rx="4" fill="#0c1524" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="530" y="255" text-anchor="middle" class="label">DINING AREA</text>
  <!-- Tables -->
  <rect x="380" y="275" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="455" y="275" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="530" y="275" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="615" y="275" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="380" y="330" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="455" y="330" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="530" y="330" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="615" y="330" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <text x="530" y="405" text-anchor="middle" class="sublabel">8 TABLES / 24-32 SEATS</text>
  <!-- Drink station -->
  <rect x="380" y="420" width="90" height="40" rx="3" fill="#1e3a5f" opacity="0.5"/>
  <text x="425" y="445" text-anchor="middle" class="sublabel">DRINKS / FOUNTAIN</text>
  <!-- Entry -->
  <rect x="620" y="440" width="50" height="35" rx="3" fill="#065f46"/>
  <text x="645" y="462" text-anchor="middle" class="sublabel" style="fill:white">ENTRY</text>
  <!-- Entry arrow -->
  <path d="M645 440 L645 215 L365 215 L365 155" class="arrow"/>
</svg>`;
  }

  // Drive-thru hybrid
  return `<svg viewBox="0 0 900 650" xmlns="http://www.w3.org/2000/svg" style="background:#1e293b">
  <style>
    text { font-family: 'Segoe UI', system-ui, sans-serif; }
    .title { fill: #f8fafc; font-size: 18px; font-weight: 700; }
    .subtitle { fill: #94a3b8; font-size: 12px; }
    .label { fill: #e2e8f0; font-size: 11px; font-weight: 600; }
    .sublabel { fill: #94a3b8; font-size: 9px; }
    .arrow { fill: none; stroke: #22c55e; stroke-width: 2; marker-end: url(#arrowhead3); }
    .dt-arrow { fill: none; stroke: #f59e0b; stroke-width: 2.5; marker-end: url(#dtarrow); stroke-dasharray: 8,4; }
    .flow-label { fill: #22c55e; font-size: 9px; font-weight: 600; }
  </style>
  <defs>
    <marker id="arrowhead3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#22c55e"/>
    </marker>
    <marker id="dtarrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#f59e0b"/>
    </marker>
  </defs>
  <rect x="20" y="20" width="860" height="610" rx="12" fill="none" stroke="#334155" stroke-width="2"/>
  <text x="450" y="55" text-anchor="middle" class="title">${name} — Drive-Thru Hybrid Layout</text>
  <text x="450" y="75" text-anchor="middle" class="subtitle">2,500 – 4,000 sq ft  |  Indoor dining + drive-thru lane</text>
  <!-- Building outline -->
  <rect x="80" y="100" width="520" height="420" rx="6" fill="#0f172a" stroke="#475569" stroke-width="2"/>
  <!-- Kitchen -->
  <rect x="90" y="110" width="240" height="400" rx="4" fill="#1a1a2e" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="210" y="135" text-anchor="middle" class="label">KITCHEN / BOH</text>
  <rect x="110" y="155" width="100" height="60" rx="3" fill="#312e81" opacity="0.5"/>
  <text x="160" y="190" text-anchor="middle" class="sublabel">PREP AREA</text>
  <rect x="230" y="155" width="80" height="60" rx="3" fill="#7f1d1d" opacity="0.5"/>
  <text x="270" y="190" text-anchor="middle" class="sublabel">GRILL / FRY</text>
  <rect x="110" y="235" width="80" height="60" rx="3" fill="#1e3a5f" opacity="0.5"/>
  <text x="150" y="270" text-anchor="middle" class="sublabel">WALK-IN</text>
  <rect x="210" y="235" width="80" height="60" rx="3" fill="#1e3a5f" opacity="0.5"/>
  <text x="250" y="270" text-anchor="middle" class="sublabel">DRY STORE</text>
  <rect x="110" y="315" width="80" height="50" rx="3" fill="#1e3a5f" opacity="0.4"/>
  <text x="150" y="345" text-anchor="middle" class="sublabel">OFFICE</text>
  <rect x="210" y="315" width="60" height="50" rx="3" fill="#1e3a5f" opacity="0.4"/>
  <text x="240" y="340" text-anchor="middle" class="sublabel">REST-</text>
  <text x="240" y="353" text-anchor="middle" class="sublabel">ROOMS</text>
  <!-- Drive-thru window -->
  <rect x="90" y="385" width="100" height="50" rx="3" fill="#78350f" opacity="0.7" stroke="#f59e0b"/>
  <text x="140" y="405" text-anchor="middle" class="sublabel" style="fill:#fbbf24">DRIVE-THRU</text>
  <text x="140" y="418" text-anchor="middle" class="sublabel" style="fill:#fbbf24">WINDOW</text>
  <!-- Expediting -->
  <rect x="210" y="385" width="100" height="50" rx="3" fill="#78350f" opacity="0.4"/>
  <text x="260" y="415" text-anchor="middle" class="sublabel">EXPEDITING</text>
  <!-- Counter -->
  <rect x="340" y="150" width="18" height="150" rx="3" fill="#f59e0b"/>
  <text x="335" y="225" text-anchor="end" class="label" transform="rotate(-90,335,225)" style="fill:#f59e0b">COUNTER</text>
  <!-- POS -->
  <rect x="368" y="170" width="45" height="35" rx="3" fill="#065f46" opacity="0.6"/>
  <text x="390" y="192" text-anchor="middle" class="sublabel">POS</text>
  <!-- Dining -->
  <rect x="340" y="110" width="250" height="400" rx="4" fill="#0c1524" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="6,3"/>
  <text x="465" y="135" text-anchor="middle" class="label">DINING / FOH</text>
  <rect x="420" y="160" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="490" y="160" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="420" y="210" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="490" y="210" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="420" y="260" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="490" y="260" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="420" y="310" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <rect x="490" y="310" width="55" height="35" rx="3" fill="#1e293b" stroke="#475569"/>
  <text x="465" y="380" text-anchor="middle" class="sublabel">8-10 TABLES / 32-40 SEATS</text>
  <!-- Drink station -->
  <rect x="370" y="400" width="90" height="35" rx="3" fill="#1e3a5f" opacity="0.5"/>
  <text x="415" y="422" text-anchor="middle" class="sublabel">DRINKS</text>
  <!-- Entry -->
  <rect x="520" y="440" width="50" height="35" rx="3" fill="#065f46"/>
  <text x="545" y="462" text-anchor="middle" class="sublabel" style="fill:white">ENTRY</text>
  <!-- Customer flow -->
  <path d="M545 440 L545 310 L420 310 L390 310 L390 205 L358 205" class="arrow"/>
  <text x="465" y="305" class="flow-label">CUSTOMER FLOW</text>
  <!-- DRIVE-THRU LANE -->
  <rect x="620" y="100" width="250" height="520" rx="8" fill="#0f172a" stroke="#f59e0b" stroke-width="2" stroke-dasharray="8,4"/>
  <text x="745" y="130" text-anchor="middle" class="label" style="fill:#f59e0b">DRIVE-THRU LANE</text>
  <!-- Menu board -->
  <rect x="680" y="160" width="80" height="45" rx="3" fill="#78350f" opacity="0.6" stroke="#f59e0b"/>
  <text x="720" y="180" text-anchor="middle" class="sublabel" style="fill:#fbbf24">MENU</text>
  <text x="720" y="193" text-anchor="middle" class="sublabel" style="fill:#fbbf24">BOARD</text>
  <!-- Order point -->
  <rect x="680" y="230" width="80" height="40" rx="3" fill="#78350f" opacity="0.5"/>
  <text x="720" y="255" text-anchor="middle" class="sublabel" style="fill:#fbbf24">ORDER HERE</text>
  <!-- Pay window -->
  <rect x="680" y="320" width="80" height="40" rx="3" fill="#78350f" opacity="0.5"/>
  <text x="720" y="345" text-anchor="middle" class="sublabel" style="fill:#fbbf24">PAY WINDOW</text>
  <!-- Pickup window -->
  <rect x="680" y="400" width="80" height="40" rx="3" fill="#78350f" opacity="0.7" stroke="#f59e0b"/>
  <text x="720" y="425" text-anchor="middle" class="sublabel" style="fill:#fbbf24">PICKUP</text>
  <!-- Drive-thru flow -->
  <path d="M745 580 L745 440 L720 440 L720 370 L720 280 L720 210 L720 160" class="dt-arrow"/>
  <text x="780" y="500" class="flow-label" style="fill:#f59e0b">DRIVE-THRU</text>
  <text x="780" y="513" class="flow-label" style="fill:#f59e0b">FLOW ↑</text>
  <!-- Entry/Exit labels -->
  <text x="745" y="605" text-anchor="middle" class="sublabel" style="fill:#f59e0b">ENTER ↑</text>
  <text x="660" y="155" text-anchor="middle" class="sublabel" style="fill:#f59e0b">EXIT →</text>
</svg>`;
}

export async function POST(req: Request) {
  try {
    const body: VisualRequest = await req.json();
    const openai = getOpenAI();

    const isLand = body.propertyType === "Land";
    const promises: Promise<{ type: string; label: string; url: string | null; svg?: string; originalPhoto?: string; error?: string }>[] = [];

    // === EXISTING PROPERTY: Photo-based renovation ===
    if (!isLand && body.photos && body.photos.length > 0) {
      const descriptions = await Promise.all(
        body.photos.map((photo, i) => describePhoto(openai, photo, i))
      );

      const levelLabels: Record<string, string> = {
        cosmetic: "Cosmetic Rehab",
        moderate: "Moderate Rehab",
        fullGut: "Full Gut Rehab",
      };
      const level = body.rehabLevel || "cosmetic";
      const label = levelLabels[level] || "Cosmetic Rehab";

      for (let i = 0; i < descriptions.length; i++) {
        const prompt = buildRenovationPrompt(descriptions[i], level, body);
        promises.push(
          openai.images
            .generate({ model: "dall-e-3", prompt, n: 1, size: "1792x1024", quality: "hd" })
            .then((res) => ({
              type: "renovation",
              label: `${label} — Photo ${i + 1}`,
              url: res.data[0]?.url || null,
              originalPhoto: body.photos[i],
            }))
            .catch((err) => ({
              type: "renovation",
              label: `${label} — Photo ${i + 1}`,
              url: null,
              originalPhoto: body.photos[i],
              error: err.message,
            }))
        );
      }
    }

    // === LAND: Selected building types ===
    if (isLand && body.buildingTypes) {
      for (const type of body.buildingTypes) {
        if (type === "Commercial" && body.commercialSubtypes) {
          // Generate each selected commercial sub-type
          for (const subtype of body.commercialSubtypes) {
            const prompt = buildGroundUpPrompt(subtype, body);
            promises.push(
              openai.images
                .generate({ model: "dall-e-3", prompt, n: 1, size: "1792x1024", quality: "hd" })
                .then((res) => ({
                  type: "groundup",
                  label: subtype,
                  url: res.data[0]?.url || null,
                }))
                .catch((err) => ({
                  type: "groundup",
                  label: subtype,
                  url: null,
                  error: err.message,
                }))
            );
          }
        } else if (type === "Franchise") {
          // Generate franchise exterior rendering using GPT-4o to describe the style
          const franchiseType = body.franchiseName || "Restaurant";
          
          // First, get GPT-4o to describe the franchise's architectural style without brand names
          const styleDescription = await describeFranchiseStyle(openai, franchiseType);
          
          const franchisePrompt = `Photorealistic architectural rendering of a newly constructed restaurant/retail building on a ${body.lotSize || "standard lot"} in ${body.neighborhood || body.address}. 

Architectural description: ${styleDescription}

The building sits on a professionally landscaped lot with a full parking lot, sidewalks, and curb appeal. Daytime exterior shot with blue sky, natural shadows, and realistic lighting. The image should look like a real photograph of a completed building, not a 3D render. No text, no logos, no brand names, no signage text, no watermarks anywhere in the image.`;
          promises.push(
            openai.images
              .generate({ model: "dall-e-3", prompt: franchisePrompt, n: 1, size: "1792x1024", quality: "hd" })
              .then((res) => ({
                type: "groundup",
                label: `Franchise: ${franchiseType}`,
                url: res.data[0]?.url || null,
              }))
              .catch((err) => ({
                type: "groundup",
                label: `Franchise: ${franchiseType}`,
                url: null,
                error: err.message,
              }))
          );

          // Generate 3 franchise floor plan SVGs (no API call needed)
          const franchiseName = body.franchiseName || "Franchise Restaurant";
          const layouts = [
            { key: "counter" as const, label: `${franchiseName} — Counter Service (1.2k-2.5k sqft)` },
            { key: "assembly" as const, label: `${franchiseName} — Assembly Line (1.5k-2k sqft)` },
            { key: "drivethru" as const, label: `${franchiseName} — Drive-Thru Hybrid (2.5k-4k sqft)` },
          ];

          for (const layout of layouts) {
            const svg = buildFranchiseLayoutSVG(layout.key, franchiseName);
            promises.push(
              Promise.resolve({
                type: "franchise-layout",
                label: layout.label,
                url: null,
                svg,
              })
            );
          }
        } else {
          // Residential or Multifamily
          const prompt = buildGroundUpPrompt(type, body);
          promises.push(
            openai.images
              .generate({ model: "dall-e-3", prompt, n: 1, size: "1792x1024", quality: "hd" })
              .then((res) => ({
                type: "groundup",
                label: `${type} Build`,
                url: res.data[0]?.url || null,
              }))
              .catch((err) => ({
                type: "groundup",
                label: `${type} Build`,
                url: null,
                error: err.message,
              }))
          );
        }
      }
    }

    const results = await Promise.all(promises);

    const renovationVisuals = results.filter((r) => r.type === "renovation" && r.url);
    const groundUpVisuals = results.filter((r) => r.type === "groundup" && r.url);
    const franchiseLayouts = results.filter((r) => r.type === "franchise-layout" && r.svg);
    const errors = results.filter((r) => r.error);

    return NextResponse.json({
      renovationVisuals,
      groundUpVisuals,
      franchiseLayouts,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Visual generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
