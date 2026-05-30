"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { TitleWorldScene } from "@/components/TitleWorldScene";

type OAuthProvider = "google" | "twitter";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FieldIcon({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-slate-950/[0.06] text-slate-500">
      {children}
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/");
    } catch {
      setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: OAuthProvider) => {
    setError("");
    setOauthLoading(provider);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setOauthLoading(null);
      setError(`${provider === "google" ? "Google" : "X"}ログインに失敗しました。SupabaseのAuthentication設定を確認してください。`);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <TitleWorldScene />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <section className="w-full max-w-[480px]">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/35 bg-white/[0.22] shadow-[0_30px_120px_rgba(44,21,70,0.34)] backdrop-blur-3xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.48),transparent_28%),radial-gradient(circle_at_92%_12%,rgba(251,191,36,0.18),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.34),rgba(255,255,255,0.1)_42%,rgba(15,23,42,0.08))]" />
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 opacity-80" />
            <div className="relative p-5 sm:p-7">
              <Link
                href="/"
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/[0.72] px-3 py-1.5 text-xs font-black text-slate-700 shadow-lg backdrop-blur-xl transition hover:bg-white/[0.86] hover:text-slate-950"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                タイトルへ戻る
              </Link>

              <div className="mb-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-100/60 bg-amber-50/[0.76] px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-orange-700 shadow-sm backdrop-blur-xl">
                  <Sparkles className="h-3.5 w-3.5" />
                  Basecamp Login
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_4px_18px_rgba(52,25,76,0.4)] sm:text-4xl">ベースキャンプに入る</h2>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-white/[0.78] drop-shadow-[0_2px_10px_rgba(52,25,76,0.35)]">
                  メール、Google、Xのいずれかでログインできます。
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200/70 bg-red-50/[0.92] px-4 py-3 text-sm font-bold leading-relaxed text-red-700 shadow-lg backdrop-blur-xl">
                  {error}
                </div>
              )}

              <div className="grid gap-3">
                <button
                  onClick={() => handleOAuthSignIn("google")}
                  type="button"
                  disabled={oauthLoading !== null || loading}
                  className="group flex min-h-[3.25rem] w-full items-center justify-between rounded-2xl border border-white/55 bg-white/[0.82] px-4 py-3 text-sm font-black text-slate-900 shadow-[0_10px_34px_rgba(44,21,70,0.14)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.92] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">
                      <GoogleIcon />
                    </span>
                    {oauthLoading === "google" ? "Googleへ移動中..." : "Googleでログイン"}
                  </span>
                  <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
                </button>

                <button
                  onClick={() => handleOAuthSignIn("twitter")}
                  type="button"
                  disabled={oauthLoading !== null || loading}
                  className="group flex min-h-[3.25rem] w-full items-center justify-between rounded-2xl border border-white/20 bg-slate-950/[0.84] px-4 py-3 text-sm font-black text-white shadow-[0_14px_38px_rgba(15,23,42,0.28)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-slate-950/[0.92] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-950">
                      <XIcon />
                    </span>
                    {oauthLoading === "twitter" ? "Xへ移動中..." : "Xでログイン"}
                  </span>
                  <ChevronRight className="h-5 w-5 text-white/[0.38] transition group-hover:translate-x-0.5 group-hover:text-white" />
                </button>
              </div>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/35" />
                <span className="text-xs font-black uppercase tracking-[0.22em] text-white/[0.72]">or email</span>
                <div className="h-px flex-1 bg-white/35" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/[0.76]">メールアドレス</span>
                  <div className="relative">
                    <FieldIcon>
                      <Mail className="h-4 w-4" />
                    </FieldIcon>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-14 w-full rounded-2xl border border-white/45 bg-white/[0.82] pl-16 pr-4 text-base font-bold text-slate-950 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-white/30"
                      placeholder="email@example.com"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/[0.76]">パスワード</span>
                  <div className="relative">
                    <FieldIcon>
                      <LockKeyhole className="h-4 w-4" />
                    </FieldIcon>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-14 w-full rounded-2xl border border-white/45 bg-white/[0.82] pl-16 pr-4 text-base font-bold text-slate-950 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-white/30"
                      placeholder="password"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading || oauthLoading !== null}
                  className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 px-5 py-3 text-base font-black text-white shadow-xl shadow-rose-500/28 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "ログイン中..." : "メールでログイン"}
                  <ChevronRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                </button>
              </form>

              <div className="mt-6 grid gap-2 text-center text-sm font-bold">
                <Link href="/auth/signup" className="text-white transition drop-shadow-[0_2px_10px_rgba(52,25,76,0.35)] hover:text-amber-100">
                  アカウント作成はこちら
                </Link>
                <Link href="/" className="text-white/[0.68] transition hover:text-white">
                  トップページに戻る
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
