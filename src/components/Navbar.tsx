"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
export default function Navbar({ session }: { session: Session | null }) {
return (
<nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
<div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
{/* Logo */}
<Link href="/" className="flex items-center gap-2">
<span className="text-xl">■</span>
<span className="text-white font-bold text-lg">KataDeals</span>
</Link>
{/* Links — only show Analyze and Dashboard when signed in */}
<div className="hidden md:flex items-center gap-6">
<Link href="/pricing"
className="text-slate-400 hover:text-white text-sm transition-colors">
Pricing
</Link>
{session && (
<>
<Link href="/analyze"
className="text-slate-400 hover:text-white text-sm transition-colors">
Analyze
</Link>
<Link href="/dashboard"
className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard
</Link>
</>
)}
</div>
{/* Auth */}
<div className="flex items-center gap-3">
{session ? (
<>
{session.user?.image && (
<img
src={session.user.image}
alt="avatar"
className="w-8 h-8 rounded-full border-2 border-slate-700"
/>
)}
<button
onClick={() => signOut({ callbackUrl: "/" })}
className="text-slate-400 hover:text-white text-sm transition-colors">
Sign Out
</button>
</>
) : (
<Link href="/api/auth/signin"
className="bg-blue-600 hover:bg-blue-500 text-white text-sm
font-medium px-4 py-2 rounded-lg transition-colors">
Sign In
</Link>
)}
</div>
</div>
</nav>
);
}
