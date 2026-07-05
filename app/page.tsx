"use client";

import { useState } from "react";
import FilterForm from "@/components/FilterForm";
import ResultsDashboard from "@/components/ResultsDashboard";
import type { UserFilters, RoutineResponse } from "@/lib/types";

export default function Home() {
  const [routine, setRoutine] = useState<RoutineResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(filters: UserFilters) {
    setLoading(true);
    setError(null);
    setRoutine(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }
      setRoutine(data as RoutineResponse);
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
        {/* Hero */}
        <header className="text-center space-y-4">
          <div className="hero-badge mx-auto w-fit">
            ✦ AI-Powered Skincare Research
          </div>
          <h1 className="hero-title">
            Skincare Scout
          </h1>
          <p className="hero-subtitle">
            Tell us your skin profile. Our AI researches live products and builds
            a personalized routine — no generic lists, no guesswork.
          </p>
        </header>

        {/* Form or Results */}
        {routine ? (
          <ResultsDashboard routine={routine} onReset={() => setRoutine(null)} />
        ) : (
          <>
            <FilterForm onSubmit={handleSubmit} loading={loading} />
            {error && (
              <div className="error-box rounded-xl p-4 text-center text-sm">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-purple-500">
          Powered by Claude AI + Tavily search · Results are for informational purposes only
        </footer>
      </div>
    </main>
  );
}
