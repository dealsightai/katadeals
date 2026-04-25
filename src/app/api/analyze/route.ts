import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: Request) {
  const { address, price, sqft, bedrooms, bathrooms, notes } = await req.json();

  const prompt = `You are an expert real estate investment analyst, underwriter, and developer. You have deep knowledge of construction costs, creative financing, zoning law, and exit strategies across all US markets.

PROPERTY TO ANALYZE:
- Address: ${address}
- Asking Price: $${price}
- Size: ${sqft || "Unknown"} sqft | ${bedrooms || "Unknown"} bed / ${bathrooms || "Unknown"} bath
- Additional Notes: ${notes || "None"}

ANALYSIS INSTRUCTIONS:
1. Use the address to infer the city, state, neighborhood, and local market conditions.
2. Base ALL estimates on realistic data for that specific market — not national averages.
3. For rehab costs, use regional cost-per-sqft data: cosmetic $15-30/sqft, moderate $40-75/sqft, full gut $80-150+/sqft, adjusted for the local market.
4. For financing, use current market rates (conventional ~6.5-7.5%, FHA ~6-7%, VA ~6-6.5%, DSCR ~7.5-9.5%). Creative finance terms should reflect typical negotiated terms.
5. For ARV estimates, base them on comparable sales in the neighborhood at the appropriate condition level.
6. For rental estimates, base them on comparable rentals in the area for the property type and size.
7. For development options, consider the property's ACTUAL zoning and what's realistically achievable in that jurisdiction. Don't suggest options that are clearly impossible for the property type or location.
8. For exit strategies, calculate projected profit by subtracting ALL costs (purchase, rehab, closing costs, holding costs, financing costs) from the exit price.

Respond with a JSON object containing ALL of these fields:

{
  "dealScore": (number 1-10, where 1 is terrible and 10 is exceptional),
  "recommendation": ("BUY", "HOLD", or "PASS"),
  "summary": (2-3 sentence overview — be specific about WHY this is a buy/hold/pass, reference actual numbers),

  "propertyDetails": {
    "estimatedBedrooms": (number or null if already provided),
    "estimatedBathrooms": (number or null if already provided),
    "estimatedSqft": (number or null if already provided),
    "estimatedLotSize": (string like "0.25 acres" — estimate based on typical lot sizes in this specific neighborhood),
    "propertyType": ("Single Family" | "Multi-Family" | "Land" | "Commercial" | "Mixed-Use"),
    "yearBuiltEstimate": (string like "1970s" or "Unknown"),
    "neighborhood": (string — 1-2 sentence description of the area, mention nearby landmarks or characteristics)
  },

  "valuationAnalysis": {
    "estimatedARV": (number — after full moderate rehab),
    "estimatedAsIsValue": (number),
    "estimatedMonthlyRent": (number — market rent after rehab),
    "estimatedCashFlow": (number — monthly, after PITI and expenses),
    "capRate": (number like 5.2),
    "cashOnCashReturn": (number — percentage, based on conventional 25% down),
    "rentToPrice": (number — percentage, monthly rent / purchase price * 100),
    "pricePerSqft": (number — asking price / sqft),
    "arvPerSqft": (number — ARV / sqft),
    "marketComparison": (string — how does the price/sqft compare to area average? "Below market", "At market", or "Above market" with brief explanation)
  },

  "rehabAnalysis": {
    "cosmetic": {
      "description": (string — specific work items for THIS property: e.g. "Interior paint, new light fixtures, landscape cleanup, carpet cleaning, minor drywall patches"),
      "estimatedCost": (number),
      "costPerSqft": (number),
      "timelineWeeks": (number),
      "arvAfterRehab": (number)
    },
    "moderate": {
      "description": (string — specific work: e.g. "Kitchen remodel with new cabinets/counters, bathroom tile and vanity update, LVP flooring throughout, interior paint, updated light fixtures, new appliances"),
      "estimatedCost": (number),
      "costPerSqft": (number),
      "timelineWeeks": (number),
      "arvAfterRehab": (number)
    },
    "fullGut": {
      "description": (string — specific work: e.g. "Full demo to studs, new electrical and plumbing, HVAC replacement, new roof, all new finishes, possible layout reconfiguration"),
      "estimatedCost": (number),
      "costPerSqft": (number),
      "timelineWeeks": (number),
      "arvAfterRehab": (number)
    }
  },

  "financingOptions": {
    "traditional": [
      {
        "type": "Conventional",
        "downPaymentPercent": (number like 20 or 25),
        "downPaymentAmount": (number — calculated from price),
        "interestRate": (number like 7.0),
        "term": "30 years",
        "monthlyPayment": (number — P&I only),
        "monthlyPITI": (number — include estimated taxes and insurance),
        "bestFor": (string — one sentence on ideal use case),
        "requirements": (string — key qualification requirements)
      },
      {
        "type": "FHA",
        "downPaymentPercent": 3.5,
        "downPaymentAmount": (number),
        "interestRate": (number),
        "term": "30 years",
        "monthlyPayment": (number),
        "monthlyPITI": (number),
        "bestFor": "First-time homebuyers or owner-occupant investors wanting low down payment",
        "requirements": (string — MIP, occupancy requirement, property condition requirements)
      },
      {
        "type": "FHA 203K",
        "downPaymentPercent": 3.5,
        "downPaymentAmount": (number — based on purchase + rehab),
        "interestRate": (number),
        "term": "30 years",
        "monthlyPayment": (number),
        "monthlyPITI": (number),
        "totalLoanAmount": (number — purchase price + rehab budget),
        "maxRehabBudget": (number — based on FHA limits for this area),
        "bestFor": "Owner-occupants who want to finance the purchase AND renovation in one loan",
        "requirements": (string)
      },
      {
        "type": "VA Loan",
        "downPaymentPercent": 0,
        "downPaymentAmount": 0,
        "interestRate": (number),
        "term": "30 years",
        "monthlyPayment": (number),
        "monthlyPITI": (number),
        "bestFor": "Veterans and active-duty military — zero down, no PMI",
        "requirements": "Must be eligible veteran/active-duty. Property must meet VA minimum property requirements (MPRs). Owner-occupied only."
      },
      {
        "type": "DSCR Loan",
        "downPaymentPercent": (number — typically 20-25),
        "downPaymentAmount": (number),
        "interestRate": (number — typically 7.5-9.5),
        "term": "30 years",
        "monthlyPayment": (number),
        "monthlyPITI": (number),
        "dscr": (number — estimated DSCR ratio for this property, rent / PITI),
        "bestFor": "Investors who qualify based on property cash flow, not personal income. No tax returns or W2s needed.",
        "requirements": (string — minimum DSCR ratio, credit score, reserves)
      }
    ],
    "creative": [
      {
        "type": "Owner Financing",
        "structure": (string — e.g. "Negotiate with seller: 10% down, 6% interest, 5-year balloon with 30-year amortization"),
        "estimatedDownPayment": (number),
        "estimatedMonthlyPayment": (number),
        "bestFor": "Properties with motivated sellers or free-and-clear properties. Avoids bank qualification.",
        "risks": (string — key risks like balloon payment, due-on-sale),
        "negotiationTips": (string — how to approach the seller)
      },
      {
        "type": "Subject To",
        "structure": (string — e.g. "Take over existing mortgage payments. Seller's loan stays in place. You get the deed."),
        "estimatedDownPayment": (number — typically just seller's equity or back payments),
        "estimatedMonthlyPayment": (number — existing mortgage payment),
        "bestFor": "Sellers behind on payments or in pre-foreclosure. Low cash to close.",
        "risks": (string — due-on-sale clause, insurance complications),
        "negotiationTips": (string)
      },
      {
        "type": "Seller Carryback",
        "structure": (string — e.g. "Seller carries a second mortgage for 15% of purchase price at 5% interest, 10-year term. Combine with conventional first mortgage."),
        "estimatedDownPayment": (number — reduced down payment),
        "estimatedMonthlyPayment": (number — combined first + second mortgage),
        "bestFor": "Reducing out-of-pocket down payment by having seller finance a portion.",
        "risks": (string),
        "negotiationTips": (string)
      },
      {
        "type": "JV Equity Split",
        "structure": (string — e.g. "Partner puts up 100% of capital, you manage the project. Split profits 50/50 after capital return."),
        "estimatedCapitalNeeded": (number — total project cost),
        "projectedPartnerReturn": (string — e.g. "12-18% annualized"),
        "projectedYourReturn": (string — e.g. "$25,000-$40,000 profit with zero cash invested"),
        "bestFor": "When you have the deal and expertise but limited capital.",
        "risks": (string),
        "keyTerms": (string — what to include in JV agreement)
      },
      {
        "type": "Syndication Partnership",
        "structure": (string — e.g. "Raise capital from multiple passive investors. You serve as General Partner (GP) managing the deal."),
        "minimumRaise": (number — total capital needed from investors),
        "gpEquity": (string — typical GP share, e.g. "20-30% equity + acquisition fee"),
        "projectedInvestorReturn": (string — e.g. "8% preferred return + 70% of profits"),
        "bestFor": "Larger deals where you need significant capital from multiple investors.",
        "risks": (string),
        "requirements": "Must comply with SEC regulations. Typically requires 506(b) or 506(c) exemption. Consult securities attorney."
      },
      {
        "type": "Ground Up Development Financing",
        "structure": (string — e.g. "Construction loan at 65-75% LTC, 12-18 month term, interest-only during construction, then refinance to permanent debt."),
        "estimatedDownPayment": (number — equity required),
        "interestRate": (string — e.g. "8-10% + 1-2 points"),
        "loanAmount": (number),
        "bestFor": "Vacant land or tear-down properties where you're building new construction.",
        "risks": (string — construction risk, cost overruns, market timing),
        "requirements": (string — experience requirements, plans needed)
      },
      {
        "type": "Franchise Financing / SBA",
        "structure": (string — describe SBA 7(a) or 504 loan structure for franchise or commercial development on the property),
        "estimatedDownPayment": (number),
        "loanAmount": (number),
        "interestRate": (string),
        "bestFor": "Developing the property for franchise or commercial use with SBA-backed financing.",
        "risks": (string),
        "requirements": (string — SBA requirements, franchise approval)
      }
    ]
  },

  "developmentOptions": [
    {
      "option": (string — e.g. "ADU Addition", "Multifamily Expansion", "Mixed-Use Conversion", "Storage Rentals", "Truck Parking", "Franchise Development", "Lot Split/Subdivision"),
      "description": (string — what specifically could be built and why it makes sense for this property),
      "estimatedCost": (number),
      "estimatedMonthlyRevenue": (number),
      "estimatedAnnualRevenue": (number),
      "timelineMonths": (number),
      "zoningCurrent": (string — estimated current zoning based on address),
      "zoningChangeNeeded": (boolean),
      "zoningNotes": (string — what zoning changes are needed if any, and how difficult they typically are in this jurisdiction),
      "permitDifficulty": ("Easy" | "Moderate" | "Difficult"),
      "bestCase": (string — best case scenario outcome),
      "worstCase": (string — worst case scenario / risk)
    }
  ],

  "constructionEstimate": {
    "totalRehabCost": (number — for moderate rehab),
    "costPerSqft": (number),
    "timelineWeeks": (number),
    "majorCostItems": [
      {"item": (string — e.g. "Kitchen remodel"), "cost": (number)},
      {"item": (string), "cost": (number)},
      {"item": (string), "cost": (number)},
      {"item": (string), "cost": (number)},
      {"item": (string), "cost": (number)}
    ],
    "stabilizedMonthlyIncome": (number — total monthly income once stabilized),
    "annualOperatingIncome": (number — NOI),
    "operatingExpenses": (number — annual, include taxes, insurance, maintenance, vacancy, management),
    "expenseBreakdown": {
      "propertyTax": (number — annual estimate for this address),
      "insurance": (number — annual),
      "maintenance": (number — annual, typically 5-10% of rent),
      "vacancy": (number — annual, based on local vacancy rate),
      "management": (number — annual, typically 8-10% of rent),
      "capex": (number — annual reserve for capital expenditures)
    }
  },

  "dataCenterAnalysis": (ONLY include this section if the property is being analyzed as a data center or the notes mention data center. Otherwise set to null) {
    "facilityOverview": {
      "totalSqft": (number — total facility square footage),
      "raisedFloorSqft": (number — usable white space),
      "totalRacks": (number — estimated rack capacity),
      "powerCapacityMW": (number — total power capacity in megawatts),
      "redundancyTier": (string — "Tier 1", "Tier 2", "Tier 3", or "Tier 4" with brief explanation),
      "coolingType": (string — e.g. "Air-cooled with hot/cold aisle containment", "Rear-door heat exchangers", "Direct liquid cooling", "Immersion cooling"),
      "pueTarget": (number — Power Usage Effectiveness target, e.g. 1.3)
    },
    "buildCosts": {
      "totalBuildCost": (number — total construction and fit-out),
      "shellConstruction": (number — building shell, concrete, steel, roof),
      "electricalInfrastructure": (number — utility feed, transformers, switchgear, PDUs, busways),
      "coolingInfrastructure": (number — CRAH/CRAC units, chillers, cooling towers, piping),
      "backupPower": (number — diesel generators, UPS systems, fuel storage, ATS),
      "fireSupression": (number — clean agent fire suppression, VESDA, monitoring),
      "networkInfrastructure": (number — fiber runs, cable trays, meet-me rooms, cross connects),
      "security": (number — biometric access, CCTV, mantrap, fencing, NOC buildout),
      "buildTimelineMonths": (number — from groundbreaking to operational)
    },
    "equipmentOptions": {
      "gpuServers": [
        {
          "name": (string — e.g. "NVIDIA HGX H100 8-GPU Server"),
          "specs": (string — e.g. "8x H100 80GB SXM5, 2x Intel Xeon 8480+, 2TB DDR5, 8x 400Gbps InfiniBand"),
          "costPerUnit": (number),
          "powerPerUnit": (number — watts),
          "quantity": (number — recommended for this facility),
          "totalCost": (number),
          "bestFor": (string — e.g. "AI/ML training, LLM inference, HPC workloads")
        },
        {
          "name": (string — e.g. "NVIDIA L40S GPU Server"),
          "specs": (string — e.g. "4x L40S 48GB, 2x AMD EPYC 9454, 1TB DDR5, 100GbE"),
          "costPerUnit": (number),
          "powerPerUnit": (number — watts),
          "quantity": (number),
          "totalCost": (number),
          "bestFor": (string — e.g. "AI inference, rendering, VDI, mixed workloads")
        }
      ],
      "cpuServers": [
        {
          "name": (string — e.g. "Dell PowerEdge R760 2U Rack Server"),
          "specs": (string — e.g. "2x Intel Xeon 8490H 60-core, 1TB DDR5, 24x NVMe bays, 100GbE"),
          "costPerUnit": (number),
          "powerPerUnit": (number — watts),
          "quantity": (number),
          "totalCost": (number),
          "bestFor": (string — e.g. "Enterprise compute, virtualization, database hosting")
        },
        {
          "name": (string — e.g. "AMD EPYC 9004 Platform Server"),
          "specs": (string — e.g. "2x EPYC 9654 96-core, 1.5TB DDR5, NVMe storage, 200GbE"),
          "costPerUnit": (number),
          "powerPerUnit": (number — watts),
          "quantity": (number),
          "totalCost": (number),
          "bestFor": (string — e.g. "Cloud compute, high-density virtualization")
        }
      ],
      "tpuAccelerators": [
        {
          "name": (string — e.g. "Google TPU v5e Pod Slice" or "Custom AI ASIC Accelerator"),
          "specs": (string — describe specs and capabilities),
          "costPerUnit": (number — estimated, as TPUs are typically leased),
          "powerPerUnit": (number — watts),
          "quantity": (number),
          "totalCost": (number),
          "bestFor": (string — e.g. "Large-scale AI training, Google Cloud TPU hosting")
        }
      ],
      "networkEquipment": {
        "topOfRackSwitches": (string — e.g. "Arista 7060X5 400GbE, 2 per rack"),
        "spineSwitches": (string — e.g. "Arista 7800R3 chassis switches"),
        "firewalls": (string — e.g. "Palo Alto PA-5450 or Fortinet 4400F"),
        "loadBalancers": (string — e.g. "F5 BIG-IP r10900"),
        "totalNetworkCost": (number)
      },
      "storageEquipment": {
        "primaryStorage": (string — e.g. "NetApp AFF A900, 2PB raw flash"),
        "backupStorage": (string — e.g. "Dell PowerScale F710, 5PB"),
        "totalStorageCost": (number)
      },
      "totalEquipmentCost": (number — sum of all equipment)
    },
    "operatingIncome": {
      "coloRackRental": {
        "pricePerRack": (number — monthly per rack, based on market),
        "occupancyRate": (number — percentage, e.g. 75),
        "monthlyRevenue": (number),
        "annualRevenue": (number)
      },
      "managedHosting": {
        "pricePerServer": (number — monthly),
        "estimatedClients": (number),
        "monthlyRevenue": (number),
        "annualRevenue": (number)
      },
      "gpuAsAService": {
        "pricePerGPUHour": (number — e.g. 2.50 for H100),
        "utilizationRate": (number — percentage, e.g. 70),
        "monthlyRevenue": (number),
        "annualRevenue": (number)
      },
      "totalMonthlyRevenue": (number),
      "totalAnnualRevenue": (number)
    },
    "operatingExpenses": {
      "electricity": {
        "costPerKWh": (number — local utility rate),
        "monthlyPowerDraw": (number — kWh),
        "monthlyCost": (number),
        "annualCost": (number)
      },
      "cooling": {
        "monthlyCost": (number — included in electricity but broken out),
        "annualCost": (number)
      },
      "internetBandwidth": {
        "description": (string — e.g. "2x 100Gbps blended transit + peering"),
        "monthlyCost": (number),
        "annualCost": (number)
      },
      "staffing": {
        "roles": (string — e.g. "NOC techs (4), facility manager (1), security (2)"),
        "annualCost": (number)
      },
      "maintenance": {
        "description": (string — e.g. "Generator service, UPS battery replacement, HVAC maintenance"),
        "annualCost": (number)
      },
      "insurance": (number — annual),
      "propertyTax": (number — annual),
      "totalMonthlyExpenses": (number),
      "totalAnnualExpenses": (number)
    },
    "financialSummary": {
      "totalProjectCost": (number — build + equipment),
      "annualNOI": (number — revenue minus expenses),
      "capRate": (number — percentage),
      "cashOnCashReturn": (number — percentage),
      "paybackPeriodYears": (number — how long to recoup investment),
      "stabilizationTimeMonths": (number — time to reach target occupancy)
    }
  },

  "exitStrategies": [
    {
      "strategy": (string — e.g. "Fix and Flip", "BRRRR", "Buy and Hold Rental", "Wholesale", "Lease Option", "1031 Exchange", "Seller Finance to Buyer", "Short-Term Rental / Airbnb", "Live-In Flip"),
      "projectedProfit": (number),
      "totalInvestment": (number — all-in cost including purchase, rehab, closing, holding),
      "exitPrice": (number — sale price or appraised value),
      "roi": (number — percentage return on investment),
      "timelineMonths": (number),
      "riskLevel": ("Low" | "Medium" | "High"),
      "description": (string — step-by-step overview of how to execute this strategy),
      "monthlyIncome": (number or null — for rental/hold strategies only)
    }
  ],

  "positives": [(array of 3-5 strings — specific advantages of THIS deal, not generic statements)],
  "redFlags": [(array of 2-4 strings — specific risks, be honest even if the deal scores high)],

  "marketInsights": {
    "areaGrowthTrend": ("Growing" | "Stable" | "Declining"),
    "demandLevel": ("High" | "Medium" | "Low"),
    "medianHomePrice": (number — for this zip code/neighborhood),
    "medianRent": (number — for comparable properties in area),
    "rentGrowthProjection": (string like "3-5% annually"),
    "appreciationProjection": (string like "2-4% annually"),
    "keyFactors": [(array of 3-4 strings — specific market factors for THIS area: employers, development projects, population trends, school ratings, etc.)]
  }
}

IMPORTANT RULES:
- Every number must be realistic for the specific address and market. Do not use placeholder round numbers.
- Include at least 4 development options relevant to this property type and location.
- Include at least 6 exit strategies with fully calculated numbers.
- For creative financing, tailor the structures to this specific deal — don't just give generic descriptions.
- Be specific in descriptions — reference the actual property, neighborhood, and market conditions.
- If the property type is "Land", adjust the analysis accordingly: skip rehab sections or note they don't apply, focus on development options and ground-up construction.
- All monthly payment calculations should use standard amortization formulas.
- If the notes mention "data center" or the development options include a data center, include the full dataCenterAnalysis section with realistic equipment specs, power costs, and revenue projections for the local market. Use current 2025-2026 pricing for GPU servers (H100, L40S), CPU servers, and network equipment. Base electricity costs on the local utility rate for the address. Otherwise set dataCenterAnalysis to null.
- For data center GPU specs, use real current-generation hardware: NVIDIA H100, H200, L40S, A100 for GPUs. Intel Xeon 8400/8500 series or AMD EPYC 9004 series for CPUs. Google TPU v5e or custom ASICs for TPUs.`;

  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "You must be signed in to analyze deals." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 401 });
    }

    // Plan enforcement - free users get 3 deals/month
    if (user.plan === "free") {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const monthlyCount = await prisma.deal.count({
        where: {
          userId: user.id,
          createdAt: { gte: start },
        },
      });
      if (monthlyCount >= 3) {
        return NextResponse.json(
          { error: "Free plan limit reached (3 deals/month). Upgrade to Pro for unlimited analyses." },
          { status: 403 }
        );
      }
    }

    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 8192,
      temperature: 0.7,
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");

    const deal = await prisma.deal.create({
      data: {
        address,
        price: parseFloat(price),
        sqft: sqft ? parseFloat(sqft) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseFloat(bathrooms) : null,
        notes: notes || null,
        analysis,
        userId: user.id,
      },
    });

    return NextResponse.json({ dealId: deal.id, analysis });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}