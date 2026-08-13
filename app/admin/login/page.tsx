"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { BoaLogo } from "@/components/ui/BoaLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(""); setLoading(true);
    try {
      await api.login(email.trim(), password);
      router.replace("/admin/questions");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F1EC] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">

        {/* Card */}
        <div className="bg-white rounded-[20px] shadow-[0_4px_6px_rgba(0,0,0,0.04),0_16px_48px_rgba(0,0,0,0.10)] overflow-hidden">

          {/* Top band */}
          <div className="bg-[#0D0D0D] px-8 py-8">
            <BoaLogo variant="login" />
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {error && (
              <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-[10px] px-4 py-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                  className="w-4 h-4 text-red-500 flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                </svg>
                <p className="text-[13px] text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-[12.5px] font-semibold text-[#0D0D0D] mb-2 tracking-wide">
                  Email address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@bankofabyssinia.com"
                  className="w-full border border-[#E6E5E0] rounded-[10px] bg-[#F8F7F4] px-4 py-3 text-[13.5px] text-[#0D0D0D] placeholder-[#BBBBB0] focus:outline-none focus:ring-2 focus:ring-[#E8A020] focus:border-[#E8A020] transition-all"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#0D0D0D] mb-2 tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border border-[#E6E5E0] rounded-[10px] bg-[#F8F7F4] px-4 py-3 text-[13.5px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#E8A020] focus:border-[#E8A020] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0D0D0D] text-white rounded-[10px] py-3.5 font-semibold text-[14px] tracking-wide hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2.5 mt-1"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                )}
                Sign In
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center font-mono text-[10px] text-[#0D0D0D]/25 tracking-[0.18em] uppercase mt-6">
          Bank of Abyssinia · THE CHOICE FOR ALL
        </p>
      </div>
    </div>
  );
}
