"use client";

import type { RoutineResponse, ProductRecommendation } from "@/lib/types";
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

function ProductCard({ product, index }: { product: ProductRecommendation; index: number }) {
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
          Key Ingredients
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
          Where to Buy
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
  onReset: () => void;
}

export default function ResultsDashboard({ routine, onReset }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Personalized Routine</h2>
          <p className="text-purple-300 text-sm mt-1">
            {routine.products.length} products curated for your skin profile
          </p>
        </div>
        <button onClick={onReset} className="reset-btn flex items-center gap-2">
          <RotateCcw size={14} />
          Adjust Filters
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
