export type SkinType = "dry" | "oily" | "combination" | "normal" | "sensitive";
export type PrimaryConcern =
  | "acne"
  | "aging"
  | "hyperpigmentation"
  | "dryness"
  | "sensitivity"
  | "brightening"
  | "pores"
  | "redness";
export type Budget = "under-30" | "30-60" | "60-100" | "over-100";
export type BrandOrigin = "any" | "korean" | "japanese" | "european" | "american";
export type RoutineComplexity = "minimal" | "moderate" | "full";
export type AvoidIngredient = "fragrance" | "alcohol" | "parabens" | "silicones" | "essential-oils";
export type Climate = "humid" | "dry" | "temperate" | "cold";
export type CurrentRoutine = "none" | "basic" | "some" | "full";

export interface UserFilters {
  skinType: SkinType;
  primaryConcern: PrimaryConcern;
  budget: Budget;
  brandOrigin: BrandOrigin;
  routineComplexity: RoutineComplexity;
  avoidIngredients: AvoidIngredient[];
  climate: Climate;
  currentRoutine: CurrentRoutine;
}

export interface Vendor {
  name: string;
  price: string;
  url: string;
}

export interface ProductRecommendation {
  step: string;
  productName: string;
  brand: string;
  origin: string;
  matchReason: string;
  keyIngredients: string[];
  vendors: Vendor[];
}

export interface RoutineResponse {
  products: ProductRecommendation[];
  disclaimer: string;
}

/** Encode UserFilters to a Base64 JSON string for safe transport */
export function encodeFilters(filters: UserFilters): string {
  if (typeof window === "undefined") return "";
  return btoa(JSON.stringify(filters));
}

/** Decode a Base64 JSON string back to UserFilters */
export function decodeFilters(encoded: string): UserFilters | null {
  try {
    if (typeof window === "undefined") return null;
    return JSON.parse(atob(encoded)) as UserFilters;
  } catch {
    return null;
  }
}
