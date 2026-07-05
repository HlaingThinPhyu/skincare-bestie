"use client";

import { useState } from "react";
import type {
  UserFilters,
  SkinType,
  PrimaryConcern,
  Budget,
  BrandOrigin,
  RoutineComplexity,
  AvoidIngredient,
  Climate,
  CurrentRoutine,
} from "@/lib/types";
import { Sparkles, Loader2 } from "lucide-react";

const DEFAULT_FILTERS: UserFilters = {
  skinType: "combination",
  primaryConcern: "acne",
  budget: "30-60",
  brandOrigin: "any",
  routineComplexity: "moderate",
  avoidIngredients: [],
  climate: "temperate",
  currentRoutine: "basic",
};

const AVOID_OPTIONS: { value: AvoidIngredient; label: string }[] = [
  { value: "fragrance", label: "Fragrance" },
  { value: "alcohol", label: "Alcohol" },
  { value: "parabens", label: "Parabens" },
  { value: "silicones", label: "Silicones" },
  { value: "essential-oils", label: "Essential Oils" },
];

interface Props {
  onSubmit: (filters: UserFilters) => void;
  loading: boolean;
}

export default function FilterForm({ onSubmit, loading }: Props) {
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);

  function set<K extends keyof UserFilters>(key: K, value: UserFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAvoid(ingredient: AvoidIngredient) {
    setFilters((prev) => ({
      ...prev,
      avoidIngredients: prev.avoidIngredients.includes(ingredient)
        ? prev.avoidIngredients.filter((i) => i !== ingredient)
        : [...prev.avoidIngredients, ingredient],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(filters);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skin Type */}
        <div className="space-y-2">
          <label className="filter-label">Skin Type</label>
          <select
            value={filters.skinType}
            onChange={(e) => set("skinType", e.target.value as SkinType)}
            className="filter-select"
          >
            <option value="dry">Dry</option>
            <option value="oily">Oily</option>
            <option value="combination">Combination</option>
            <option value="normal">Normal</option>
            <option value="sensitive">Sensitive</option>
          </select>
        </div>

        {/* Primary Concern */}
        <div className="space-y-2">
          <label className="filter-label">Primary Concern</label>
          <select
            value={filters.primaryConcern}
            onChange={(e) => set("primaryConcern", e.target.value as PrimaryConcern)}
            className="filter-select"
          >
            <option value="acne">Acne / Breakouts</option>
            <option value="aging">Anti-Aging / Wrinkles</option>
            <option value="hyperpigmentation">Hyperpigmentation / Dark Spots</option>
            <option value="dryness">Dryness / Hydration</option>
            <option value="sensitivity">Sensitivity / Redness</option>
            <option value="brightening">Brightening / Glow</option>
            <option value="pores">Enlarged Pores</option>
            <option value="redness">Redness / Rosacea</option>
          </select>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label className="filter-label">Budget per Product</label>
          <select
            value={filters.budget}
            onChange={(e) => set("budget", e.target.value as Budget)}
            className="filter-select"
          >
            <option value="under-30">Under $30</option>
            <option value="30-60">$30 – $60</option>
            <option value="60-100">$60 – $100</option>
            <option value="over-100">Over $100</option>
          </select>
        </div>

        {/* Brand Origin */}
        <div className="space-y-2">
          <label className="filter-label">Brand Origin</label>
          <select
            value={filters.brandOrigin}
            onChange={(e) => set("brandOrigin", e.target.value as BrandOrigin)}
            className="filter-select"
          >
            <option value="any">No Preference</option>
            <option value="korean">Korean (K-Beauty)</option>
            <option value="japanese">Japanese (J-Beauty)</option>
            <option value="european">European</option>
            <option value="american">American</option>
          </select>
        </div>

        {/* Routine Complexity */}
        <div className="space-y-2">
          <label className="filter-label">Routine Complexity</label>
          <select
            value={filters.routineComplexity}
            onChange={(e) => set("routineComplexity", e.target.value as RoutineComplexity)}
            className="filter-select"
          >
            <option value="minimal">Minimal (3 steps)</option>
            <option value="moderate">Moderate (5 steps)</option>
            <option value="full">Full Routine (7+ steps)</option>
          </select>
        </div>

        {/* Climate */}
        <div className="space-y-2">
          <label className="filter-label">Your Climate</label>
          <select
            value={filters.climate}
            onChange={(e) => set("climate", e.target.value as Climate)}
            className="filter-select"
          >
            <option value="humid">Humid / Tropical</option>
            <option value="dry">Dry / Arid</option>
            <option value="temperate">Temperate</option>
            <option value="cold">Cold / Harsh Winter</option>
          </select>
        </div>

        {/* Current Routine */}
        <div className="space-y-2">
          <label className="filter-label">Current Routine</label>
          <select
            value={filters.currentRoutine}
            onChange={(e) => set("currentRoutine", e.target.value as CurrentRoutine)}
            className="filter-select"
          >
            <option value="none">None / Starting Fresh</option>
            <option value="basic">Basic (Cleanser + Moisturizer)</option>
            <option value="some">Some Products</option>
            <option value="full">Full Routine</option>
          </select>
        </div>
      </div>

      {/* Avoid Ingredients (multi-select checkboxes) */}
      <div className="space-y-3">
        <label className="filter-label">Avoid Ingredients</label>
        <div className="flex flex-wrap gap-3">
          {AVOID_OPTIONS.map(({ value, label }) => {
            const checked = filters.avoidIngredients.includes(value);
            return (
              <label
                key={value}
                className={`avoid-chip ${checked ? "avoid-chip-active" : ""}`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggleAvoid(value)}
                />
                {checked && <span className="mr-1">✓</span>}
                {label}
              </label>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="submit-btn w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-semibold text-lg transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Researching Your Routine…
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Find My Skincare Routine
          </>
        )}
      </button>
    </form>
  );
}
