"use client";

import type { RoutineResponse, ProductRecommendation, UserFilters } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { ExternalLink, ShoppingCart, Beaker, Info, RotateCcw } from "lucide-react";

const STEP_COLORS: Record<string, string> = {
  Cleanser: "step-cleanser",
  Toner: "step-toner",
  Essence: "step-essence",
  Serum: "step-serum",
  Treatment: "step-treatment",
  "Eye Cream": "step-eye",
  Moisturizer: "step-moisturizer",
  Sunscreen: "step-sunscreen",
};

const STEP_EMOJIS: Record<string, string> = {
  Cleanser: "🫧",
  Toner: "💧",
  Essence: "✨",
  Serum: "🔬",
  Treatment: "💊",
  "Eye Cream": "👁️",
  Moisturizer: "🧴",
  Sunscreen: "☀️",
};

/** Maps filter values to their i18n translation keys */
const FILTER_I18N_KEYS: Record<string, Record<string, string>> = {
  skinType: { dry: "dry", oily: "oily", combination: "combination", normal: "normal", sensitive: "sensitive" },
  primaryConcern: { acne: "acne", aging: "aging", hyperpigmentation: "hyperpigmentation", dryness: "drynessConcern", sensitivity: "sensitivity", brightening: "brightening", pores: "pores", redness: "redness" },
  budget: { "under-30": "under30", "30-60": "range3060", "60-100": "range60100", "over-100": "over100" },
  brandOrigin: { any: "noPreference", korean: "korean", japanese: "japanese", european: "european", american: "american" },
  climate: { humid: "humid", dry: "dryClimate", temperate: "temperate", cold: "cold" },
  avoidIngredients: { fragrance: "fragrance", alcohol: "alcohol", parabens: "parabens", silicones: "silicones", "essential-oils": "essentialOils" },
};

function ProductCard({ product, index }: { product: ProductRecommendation; index: number }) {
  const { t } = useI18n();
  const stepClass = STEP_COLORS[product.step] ?? "step-default";
  const emoji = STEP_EMOJIS[product.step] ?? "✦";

  return (
    <div className={`product-card rounded-2xl p-6 space-y-4 ${stepClass}`}>
      {/* Step badge + name */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="step-number">{index + 1}</div>
          <div>
            <div className="step-badge">
              {emoji} {product.step}
            </div>
            <h3 className="product-name">{product.productName}</h3>
            <div className="product-meta">
              {product.brand} · {product.origin}
            </div>
          </div>
        </div>
      </div>

      {/* Match reason */}
      <p className="match-reason">{product.matchReason}</p>

      {/* Key ingredients */}
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-xs font-semibold text-purple-300 uppercase tracking-wider">
          <Beaker size={12} />
          {t("keyIngredients")}
        </div>
        <div className="flex flex-wrap gap-2">
          {product.keyIngredients.map((ing) => (
            <span key={ing} className="ingredient-pill">
              {ing}
            </span>
          ))}
        </div>
      </div>

      {/* Vendor links */}
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-xs font-semibold text-pink-300 uppercase tracking-wider">
          <ShoppingCart size={12} />
          {t("whereToBuy")}
        </div>
        <div className="flex flex-wrap gap-2">
          {product.vendors.map((vendor) => (
            <a
              key={vendor.name}
              href={vendor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="vendor-link"
            >
              {vendor.name}
              <span className="vendor-price">{vendor.price}</span>
              <ExternalLink size={10} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

interface Props {
  routine: RoutineResponse;
  filters: UserFilters | null;
  onReset: () => void;
}

export default function ResultsDashboard({ routine, filters, onReset }: Props) {
  const { t } = useI18n();

  function filterLabel(category: string, value: string): string {
    const key = FILTER_I18N_KEYS[category]?.[value];
    return key ? t(key) : value;
  }

  return (
    <div className="space-y-6">
      {/* Filter summary banner */}
      {filters && (
        <div className="filter-summary rounded-xl px-5 py-3 text-sm text-purple-200 leading-relaxed">
          {t("filterSummaryIntro")}{' '}
          <strong className="text-purple-100">{filterLabel("skinType", filters.skinType)}</strong> {t("skinWord")},{' '}
          <strong className="text-purple-100">{filterLabel("primaryConcern", filters.primaryConcern)}</strong> {t("withinBudget")}{' '}
          <strong className="text-purple-100">{filterLabel("budget", filters.budget)}</strong> {t("budgetWord")} {t("fromBrands")}{' '}
          <strong className="text-purple-100">{filterLabel("brandOrigin", filters.brandOrigin)}</strong> {t("brandsWord")} {t("forClimate")}{' '}
          <strong className="text-purple-100">{filterLabel("climate", filters.climate)}</strong> {t("climateWord")}
          {filters.avoidIngredients.length > 0 && (
            <>
              , {t("avoiding")}{' '}
              <strong className="text-purple-100">
                {filters.avoidIngredients.map((i) => filterLabel("avoidIngredients", i)).join(", ")}
              </strong>
            </>
          )}
          .
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t("personalizedRoutine")}</h2>
          <p className="text-purple-300 text-sm mt-1">
            {t("productsCurated", { count: routine.products.length })}
          </p>
        </div>
        <button onClick={onReset} className="reset-btn flex items-center gap-2">
          <RotateCcw size={14} />
          {t("adjustFilters")}
        </button>
      </div>

      {/* Product cards */}
      <div className="space-y-4">
        {routine.products.map((product, i) => (
          <ProductCard key={`${product.step}-${i}`} product={product} index={i} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-box flex gap-3 rounded-xl p-4">
        <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
        <p className="text-xs text-purple-300 leading-relaxed">{routine.disclaimer}</p>
      </div>
    </div>
  );
}
