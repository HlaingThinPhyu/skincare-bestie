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
import { useI18n } from "@/lib/i18n";
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

const AVOID_OPTIONS: { value: AvoidIngredient; labelKey: string }[] = [
  { value: "fragrance", labelKey: "fragrance" },
  { value: "alcohol", labelKey: "alcohol" },
  { value: "parabens", labelKey: "parabens" },
  { value: "silicones", labelKey: "silicones" },
  { value: "essential-oils", labelKey: "essentialOils" },
];

interface Props {
  onSubmit: (filters: UserFilters) => void;
  loading: boolean;
}

export default function FilterForm({ onSubmit, loading }: Props) {
  const { t } = useI18n();
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
          <label className="filter-label">{t("skinType")}</label>
          <select
            value={filters.skinType}
            onChange={(e) => set("skinType", e.target.value as SkinType)}
            className="filter-select"
          >
            <option value="dry">{t("dry")}</option>
            <option value="oily">{t("oily")}</option>
            <option value="combination">{t("combination")}</option>
            <option value="normal">{t("normal")}</option>
            <option value="sensitive">{t("sensitive")}</option>
          </select>
        </div>

        {/* Primary Concern */}
        <div className="space-y-2">
          <label className="filter-label">{t("primaryConcern")}</label>
          <select
            value={filters.primaryConcern}
            onChange={(e) => set("primaryConcern", e.target.value as PrimaryConcern)}
            className="filter-select"
          >
            <option value="acne">{t("acne")}</option>
            <option value="aging">{t("aging")}</option>
            <option value="hyperpigmentation">{t("hyperpigmentation")}</option>
            <option value="dryness">{t("drynessConcern")}</option>
            <option value="sensitivity">{t("sensitivity")}</option>
            <option value="brightening">{t("brightening")}</option>
            <option value="pores">{t("pores")}</option>
            <option value="redness">{t("redness")}</option>
          </select>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label className="filter-label">{t("budget")}</label>
          <select
            value={filters.budget}
            onChange={(e) => set("budget", e.target.value as Budget)}
            className="filter-select"
          >
            <option value="under-30">{t("under30")}</option>
            <option value="30-60">{t("range3060")}</option>
            <option value="60-100">{t("range60100")}</option>
            <option value="over-100">{t("over100")}</option>
          </select>
        </div>

        {/* Brand Origin */}
        <div className="space-y-2">
          <label className="filter-label">{t("brandOrigin")}</label>
          <select
            value={filters.brandOrigin}
            onChange={(e) => set("brandOrigin", e.target.value as BrandOrigin)}
            className="filter-select"
          >
            <option value="any">{t("noPreference")}</option>
            <option value="korean">{t("korean")}</option>
            <option value="japanese">{t("japanese")}</option>
            <option value="european">{t("european")}</option>
            <option value="american">{t("american")}</option>
          </select>
        </div>

        {/* Routine Complexity */}
        <div className="space-y-2">
          <label className="filter-label">{t("routineComplexity")}</label>
          <select
            value={filters.routineComplexity}
            onChange={(e) => set("routineComplexity", e.target.value as RoutineComplexity)}
            className="filter-select"
          >
            <option value="minimal">{t("minimal")}</option>
            <option value="moderate">{t("moderate")}</option>
            <option value="full">{t("full")}</option>
          </select>
        </div>

        {/* Climate */}
        <div className="space-y-2">
          <label className="filter-label">{t("climate")}</label>
          <select
            value={filters.climate}
            onChange={(e) => set("climate", e.target.value as Climate)}
            className="filter-select"
          >
            <option value="humid">{t("humid")}</option>
            <option value="dry">{t("dryClimate")}</option>
            <option value="temperate">{t("temperate")}</option>
            <option value="cold">{t("cold")}</option>
          </select>
        </div>

        {/* Current Routine */}
        <div className="space-y-2">
          <label className="filter-label">{t("currentRoutine")}</label>
          <select
            value={filters.currentRoutine}
            onChange={(e) => set("currentRoutine", e.target.value as CurrentRoutine)}
            className="filter-select"
          >
            <option value="none">{t("none")}</option>
            <option value="basic">{t("basic")}</option>
            <option value="some">{t("someProducts")}</option>
            <option value="full">{t("fullRoutine")}</option>
          </select>
        </div>
      </div>

      {/* Avoid Ingredients (multi-select checkboxes) */}
      <div className="space-y-3">
        <label className="filter-label">{t("avoidIngredients")}</label>
        <div className="flex flex-wrap gap-3">
          {AVOID_OPTIONS.map(({ value, labelKey }) => {
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
                {t(labelKey)}
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
            {t("researching")}
          </>
        ) : (
          <>
            <Sparkles size={20} />
            {t("findRoutine")}
          </>
        )}
      </button>
    </form>
  );
}
