import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 pt-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-5 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            AI-Powered Deal Analysis
          </div>

          {/* Logo Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl shadow-emerald-500/30">
              K
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05]">
            <span className="text-white">Kata</span>
            <span className="text-emerald-400">Deals</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-xl md:text-2xl mb-4 max-w-2xl mx-auto leading-relaxed">
            The AI powered real estate decision engine.
          </p>

          <p className="text-slate-500 text-base mb-10 max-w-lg mx-auto leading-relaxed">
            Underwrite any deal in under 60 seconds. Input an address and get instant analysis — rehab costs, ARV, financing scenarios, and exit strategies.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 mb-20">
            <Link
              href="/analyze"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              Analyze a Deal
            </Link>
            <Link
              href="/pricing"
              className="bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl text-base border border-white/10 hover:border-white/20 transition-all hover:-translate-y-0.5"
            >
              View Pricing
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { value: "$2.4B+", label: "Deals Analyzed" },
              { value: "18K+", label: "Active Investors" },
              { value: "94%", label: "ARV Accuracy" },
              { value: "47s", label: "Avg Analysis Time" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-emerald-400 text-2xl md:text-3xl font-bold mb-1">
                  {stat.value}
                </p>
                <p className="text-slate-500 text-xs uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-5 py-20">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 md:p-12">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-white text-2xl md:text-3xl font-bold mb-10">
            Three steps to smarter deals
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Enter any property address",
                desc: "Type an address or describe the property. Works for residential, commercial, land, or franchise development.",
              },
              {
                step: "2",
                title: "AI analyzes everything",
                desc: "GPT-4o evaluates rehab costs, ARV, financing options, development potential, and exit strategies for your market.",
              },
              {
                step: "3",
                title: "Get your full report",
                desc: "Receive a comprehensive deal analysis with AI renovation visuals, construction estimates, and profit projections.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-start">
                <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 font-bold text-sm mb-4">
                  {item.step}
                </div>
                <h3 className="text-white font-semibold text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-4xl mx-auto px-5 pb-20">
        <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3 text-center">
          Features
        </p>
        <h2 className="text-white text-2xl md:text-3xl font-bold mb-10 text-center">
          Everything you need to underwrite deals
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: "AI Renovation Visuals",
              desc: "Upload property photos and see what they'd look like after cosmetic, moderate, or full gut renovation.",
              icon: "🏠",
            },
            {
              title: "Creative Financing",
              desc: "Get analysis on 12+ financing strategies — conventional, FHA, DSCR, subject-to, seller carry, syndication, and more.",
              icon: "💰",
            },
            {
              title: "Development Analysis",
              desc: "Evaluate ADUs, multifamily, commercial builds, franchise development, and zoning change feasibility.",
              icon: "🏗️",
            },
            {
              title: "Exit Strategy Modeling",
              desc: "Compare fix-and-flip, BRRRR, wholesale, Airbnb, 1031 exchange, and seller finance exits with full ROI projections.",
              icon: "📊",
            },
            {
              title: "Franchise Floor Plans",
              desc: "Generate counter service, assembly line, and drive-thru hybrid layouts for any franchise concept.",
              icon: "🍔",
            },
            {
              title: "Construction Estimates",
              desc: "Get itemized rehab budgets, cost-per-sqft analysis, and stabilized NOI projections for your market.",
              icon: "🔨",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-6 hover:border-emerald-900/50 transition-colors group"
            >
              <span className="text-2xl mb-3 block">{feature.icon}</span>
              <h3 className="text-white font-semibold text-sm mb-1.5 group-hover:text-emerald-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-5 pb-20">
        <div className="relative overflow-hidden bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-10 md:p-14 text-center">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          <h2 className="relative text-white text-2xl md:text-3xl font-bold mb-4">
            Ready to analyze your next deal?
          </h2>
          <p className="relative text-slate-400 text-base mb-8 max-w-md mx-auto">
            Join thousands of investors using AI to find better deals faster.
          </p>
          <Link
            href="/analyze"
            className="relative inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
          >
            Get Started Free →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-4xl mx-auto px-5 flex items-center justify-between">
          <p className="text-slate-600 text-sm">
            © 2026 KataDeals. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-slate-600 hover:text-slate-400 text-sm transition-colors">
              Pricing
            </Link>
            <Link href="/analyze" className="text-slate-600 hover:text-slate-400 text-sm transition-colors">
              Analyze
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
