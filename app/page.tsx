"use client";

import { useState } from "react";
import FilterForm from "@/components/FilterForm";
import ResultsDashboard from "@/components/ResultsDashboard";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/lib/i18n";
import type { UserFilters, RoutineResponse } from "@/lib/types";

export default function Home() {
  const { t } = useI18n();
  const [routine, setRoutine] = useState<RoutineResponse | null>(null);
  const [submittedFilters, setSubmittedFilters] = useState<UserFilters | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(filters: UserFilters) {
    setLoading(true);
    setError(null);
    setRoutine(null);
    setSubmittedFilters(filters);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });

      const data = await res.json();
      const payload = data as RoutineResponse & { debug?: Record<string, unknown> };
      // debug trace is hidden in the UI for now
      // setDebugTrace(payload.debug ?? null);

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      setRoutine(payload as RoutineResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-12">
      {/* Ambient background blobs */}
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <div className="blob blob-3" aria-hidden="true" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-10">
        {/* Top bar: language selector + theme toggle */}
        <div className="flex justify-end items-center gap-3">
          <LanguageSelector />
          <ThemeToggle />
        </div>

        {/* Hero */}
        <header className="text-center space-y-4">
          <div className="hero-badge mx-auto w-fit">
            {t("heroBadge")}
          </div>
          <h1 className="hero-title">
            {t("heroTitle")}
          </h1>
          <p className="hero-subtitle">
            {t("heroSubtitle")}
          </p>
        </header>

        {/* Form or Results */}
        {routine ? (
          <>
            <ResultsDashboard routine={routine} filters={submittedFilters} onReset={() => { setRoutine(null); setSubmittedFilters(null); }} />
            {/* debugTrace UI hidden temporarily
            {debugTrace && (
              <section className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Live AI Trace</h2>
                    <p className="text-sm text-purple-300">Step-by-step verification of the request and response</p>
                  </div>
                </div>
                <pre className="max-h-96 overflow-auto rounded-xl bg-slate-950/80 p-4 text-xs text-slate-200 whitespace-pre-wrap">
{JSON.stringify(debugTrace, null, 2)}
                </pre>
              </section>
            )}
            */}
          </>
        ) : (
          <>
            <FilterForm onSubmit={handleSubmit} loading={loading} />
            {/* submittedFilters UI hidden temporarily
            {submittedFilters && (
              <section className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Submitted Filters</h2>
                    <p className="text-sm text-purple-300">This is the exact input object sent to the API.</p>
                  </div>
                </div>
                <pre className="max-h-96 overflow-auto rounded-xl bg-slate-950/80 p-4 text-xs text-slate-200 whitespace-pre-wrap">
{JSON.stringify(submittedFilters, null, 2)}
                </pre>
              </section>
            )}
            */}
            {error && (
              <>
                <div className="error-box rounded-xl p-4 text-center text-sm">
                  <span className="font-semibold">Error:</span> {error}
                </div>
                {/* request trace UI hidden temporarily
                {debugTrace && (
                  <section className="glass-card rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-white">Request Trace</h2>
                        <p className="text-sm text-purple-300">Inspect the request payload and AI provider details.</p>
                      </div>
                    </div>
                    <pre className="max-h-96 overflow-auto rounded-xl bg-slate-950/80 p-4 text-xs text-slate-200 whitespace-pre-wrap">
{JSON.stringify(debugTrace, null, 2)}
                    </pre>
                  </section>
                )}
                */}
              </>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-purple-500">
          {t("footerText")}
        </footer>
      </div>
    </main>
  );
}
