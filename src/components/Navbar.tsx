"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

export default function Navbar({ session }: { session: Session | null }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-emerald-900/30">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
            K
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Kata<span className="text-emerald-400">Deals</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Link
            href="/pricing"
            className="text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
          >
            Pricing
          </Link>

          {session && (
            <>
              <Link
                href="/analyze"
                className="text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                Analyze
              </Link>
              <Link
                href="/dashboard"
                className="text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                Dashboard
              </Link>
            </>
          )}

          <div className="w-px h-6 bg-slate-800 mx-2" />

          {session ? (
            <div className="flex items-center gap-3">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border-2 border-emerald-500/30"
                />
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/api/auth/signin"
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
