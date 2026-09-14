'use client';

import { useState } from 'react';
import { Lock, Mail, ArrowRight, Briefcase } from 'lucide-react';
import Image from "next/image";
type UserRole = 'User' | 'Admin';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole] = useState<UserRole>('User');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      window.location.href = "/dashboard/leadgen";
    } catch (error) {
      console.error(error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none py-10 font-['Calibri']">

      {/* Soft Ambient Light Backdrops - Savvi Dashboard Theme */}
      <div className="absolute top-1/3 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[340px] sm:w-[550px] lg:w-[700px] h-[340px] sm:h-[450px] bg-[#24a9ec]/20 rounded-full blur-[100px] sm:blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#24a9ec]/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#1a8bc4]/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Crisp Technical Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#24a9ec0a_1px,transparent_1px),linear-gradient(to_bottom,#24a9ec0a_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      <div className="max-w-[440px] w-full relative z-10 mx-auto">

        {/* Brand & Logo Header */}
        <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8 text-left bg-white/80 p-2 rounded-2xl border border-[#24a9ec]/30 shadow-sm backdrop-blur-md">

          <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 flex items-center justify-center relative">
  <Image
    src="/logo.webp"
    alt="Savvi & Sales"
    width={112}
    height={112}
    priority
    className="w-full h-full object-contain"
  />
</div>

          {/* Text Right Container */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              SAVVI & SALES
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Sales Performance & Analytics Platform
            </p>
          </div>
        </div>

        {/* Elevated White Glass Card */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-[#24a9ec]/30 shadow-[0_20px_50px_rgba(36,169,236,0.15),0_0_0_1px_rgba(255,255,255,0.8)_inset] relative">

          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#24a9ec]/40 to-transparent rounded-t-3xl pointer-events-none" />

          {/* User Portal Badge */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-b from-[#24a9ec] to-[#1a8bc4] text-white text-[11px] sm:text-xs font-semibold rounded-2xl shadow-[0_4px_14px_rgba(36,169,236,0.40),0_1px_2px_rgba(255,255,255,0.2)_inset]">
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              User Portal
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-1.5 sm:mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-[#24a9ec]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#24a9ec] focus:ring-4 focus:ring-[#24a9ec]/10 outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-[#24a9ec]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:bg-white focus:border-[#24a9ec] focus:ring-4 focus:ring-[#24a9ec]/10 outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 bg-gradient-to-b from-[#24a9ec] to-[#1a8bc4] text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-[0_8px_20px_rgba(36,169,236,0.40),0_1px_2px_rgba(255,255,255,0.25)_inset] hover:from-[#1a8bc4] hover:to-[#1478a8] active:translate-y-[1px] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In to User Portal"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-xl bg-red-100 border border-red-300 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6 tracking-wide font-medium">
          © 2026 Savvi & Sales. All rights reserved.
        </p>
      </div>
    </div>
  );
}