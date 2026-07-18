"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Locale = "en" | "zh" | "fr" | "my";

export const LOCALE_OPTIONS: { value: Locale; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "zh", label: "中文", flag: "🇨🇳" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "my", label: "မြန်မာဘာသာ", flag: "🇲🇲" },
];

type TranslationKey = string;

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    heroBadge: "✦ AI-Powered Skincare Research",
    heroTitle: "Skincare Bestie: Your Personalized Routine, Curated by AI",
    heroSubtitle: "Tell us your skin profile. Our AI researches live products and builds a personalized routine — no generic lists, no guesswork.",
    footerText: "Powered by Claude AI + Tavily search · Results are for informational purposes only",

    skinType: "Skin Type",
    dry: "Dry", oily: "Oily", combination: "Combination", normal: "Normal", sensitive: "Sensitive",
    primaryConcern: "Primary Concern",
    acne: "Acne / Breakouts", aging: "Anti-Aging / Wrinkles", hyperpigmentation: "Hyperpigmentation / Dark Spots",
    drynessConcern: "Dryness / Hydration", sensitivity: "Sensitivity / Redness", brightening: "Brightening / Glow",
    pores: "Enlarged Pores", redness: "Redness / Rosacea",
    budget: "Budget per Product",
    under30: "Under $30", range3060: "$30 – $60", range60100: "$60 – $100", over100: "Over $100",
    brandOrigin: "Brand Origin",
    noPreference: "No Preference", korean: "Korean (K-Beauty)", japanese: "Japanese (J-Beauty)",
    european: "European", american: "American",
    routineComplexity: "Routine Complexity",
    minimal: "Minimal (3 steps)", moderate: "Moderate (5 steps)", full: "Full Routine (7+ steps)",
    climate: "Your Climate",
    humid: "Humid / Tropical", dryClimate: "Dry / Arid", temperate: "Temperate", cold: "Cold / Harsh Winter",
    currentRoutine: "Current Routine",
    none: "None / Starting Fresh", basic: "Basic (Cleanser + Moisturizer)", someProducts: "Some Products", fullRoutine: "Full Routine",
    avoidIngredients: "Avoid Ingredients",
    fragrance: "Fragrance", alcohol: "Alcohol", parabens: "Parabens", silicones: "Silicones", essentialOils: "Essential Oils",
    findRoutine: "Find My Skincare Routine",
    researching: "Researching Your Routine…",

    personalizedRoutine: "Your Personalized Routine",
    productsCurated: "{count} products curated for your skin profile",
    adjustFilters: "Adjust Filters",
    keyIngredients: "Key Ingredients",
    whereToBuy: "Where to Buy",

    filterSummaryIntro: "Product recommendations for",
    skinWord: "skin",
    withinBudget: "within",
    budgetWord: "budget",
    fromBrands: "from",
    brandsWord: "brands",
    forClimate: "for",
    climateWord: "climate",
    avoiding: "avoiding",
  },
  zh: {
    heroBadge: "✦ AI 驱动护肤研究",
    heroTitle: "护肤好友：您的个性化护肤方案，由 AI 精选",
    heroSubtitle: "告诉我们您的皮肤状况。我们的 AI 研究实时产品并构建个性化护肤方案——无通用列表，无猜测。",
    footerText: "由 Claude AI + Tavily 搜索驱动 · 结果仅供参考",

    skinType: "肤质",
    dry: "干性", oily: "油性", combination: "混合性", normal: "中性", sensitive: "敏感性",
    primaryConcern: "主要问题",
    acne: "痤疮 / 痘痘", aging: "抗衰老 / 皱纹", hyperpigmentation: "色素沉着 / 暗斑",
    drynessConcern: "干燥 / 保湿", sensitivity: "敏感 / 泛红", brightening: "提亮 / 光泽",
    pores: "毛孔粗大", redness: "泛红 / 玫瑰痤疮",
    budget: "每件产品预算",
    under30: "30 美元以下", range3060: "30–60 美元", range60100: "60–100 美元", over100: "100 美元以上",
    brandOrigin: "品牌来源",
    noPreference: "无偏好", korean: "韩国 (K-Beauty)", japanese: "日本 (J-Beauty)",
    european: "欧洲", american: "美国",
    routineComplexity: "护肤步骤复杂度",
    minimal: "精简 (3 步)", moderate: "适中 (5 步)", full: "完整 (7+ 步)",
    climate: "您的气候",
    humid: "潮湿 / 热带", dryClimate: "干燥 / 干旱", temperate: "温带", cold: "寒冷 / 严冬",
    currentRoutine: "当前护肤流程",
    none: "无 / 从零开始", basic: "基础 (洁面 + 保湿)", someProducts: "部分产品", fullRoutine: "完整流程",
    avoidIngredients: "避免成分",
    fragrance: "香精", alcohol: "酒精", parabens: "对羟基苯甲酸酯", silicones: "硅油", essentialOils: "精油",
    findRoutine: "查找我的护肤方案",
    researching: "正在研究您的方案…",

    personalizedRoutine: "您的个性化方案",
    productsCurated: "为您的肤质精选 {count} 件产品",
    adjustFilters: "调整筛选",
    keyIngredients: "核心成分",
    whereToBuy: "购买渠道",

    filterSummaryIntro: "产品推荐：",
    skinWord: "肤质",
    withinBudget: "预算",
    budgetWord: "",
    fromBrands: "品牌来源",
    brandsWord: "",
    forClimate: "气候",
    climateWord: "",
    avoiding: "避免",
  },
  fr: {
    heroBadge: "✦ Recherche Skincare par IA",
    heroTitle: "Skincare Bestie : Votre Routine Personnalisée, Par l'IA",
    heroSubtitle: "Parlez-nous de votre peau. Notre IA recherche des produits en temps réel et construit une routine personnalisée — pas de listes génériques, pas de devinettes.",
    footerText: "Propulsé par Claude AI + Tavily search · Les résultats sont fournis à titre informatif uniquement",

    skinType: "Type de Peau",
    dry: "Sèche", oily: "Grasse", combination: "Mixte", normal: "Normale", sensitive: "Sensible",
    primaryConcern: "Préoccupation Principale",
    acne: "Acné / Boutons", aging: "Anti-Âge / Ride", hyperpigmentation: "Hyperpigmentation / Taches Sombres",
    drynessConcern: "Sécheresse / Hydratation", sensitivity: "Sensibilité / Rougeurs", brightening: "Éclat / Luminosité",
    pores: "Pores Élargis", redness: "Rougeurs / Rosacée",
    budget: "Budget par Produit",
    under30: "Moins de 30 $", range3060: "30 $ – 60 $", range60100: "60 $ – 100 $", over100: "Plus de 100 $",
    brandOrigin: "Origine de la Marque",
    noPreference: "Pas de Préférence", korean: "Coréenne (K-Beauty)", japanese: "Japonaise (J-Beauty)",
    european: "Européenne", american: "Américaine",
    routineComplexity: "Complexité de la Routine",
    minimal: "Minimale (3 étapes)", moderate: "Modérée (5 étapes)", full: "Complète (7+ étapes)",
    climate: "Votre Climat",
    humid: "Humide / Tropical", dryClimate: "Sec / Aride", temperate: "Tempéré", cold: "Froid / Hiver Rigoureux",
    currentRoutine: "Routine Actuelle",
    none: "Aucune / Départ à Zéro", basic: "Basique (Nettoyant + Hydratant)", someProducts: "Quelques Produits", fullRoutine: "Routine Complète",
    avoidIngredients: "Ingrédients à Éviter",
    fragrance: "Parfum", alcohol: "Alcool", parabens: "Parabènes", silicones: "Silicones", essentialOils: "Huiles Essentielles",
    findRoutine: "Trouver Ma Routine Skincare",
    researching: "Recherche de Votre Routine…",

    personalizedRoutine: "Votre Routine Personnalisée",
    productsCurated: "{count} produits sélectionnés pour votre profil de peau",
    adjustFilters: "Ajuster les Filtres",
    keyIngredients: "Ingrédients Clés",
    whereToBuy: "Où Acheter",

    filterSummaryIntro: "Recommandations de produits pour une peau",
    skinWord: "",
    withinBudget: "avec un budget de",
    budgetWord: "",
    fromBrands: "de marques",
    brandsWord: "",
    forClimate: "pour un climat",
    climateWord: "",
    avoiding: "sans",
  },
  my: {
    heroBadge: "✦ AI ဖြင့် အသားထိန်းသိမ်းမှု သုတေသန",
    heroTitle: "Skincare Bestie - AI ဖြင့် ရွေးချယ်ထားသည့် သင့်ကိုယ်ပိုင် အသားထိန်းသိမ်းမှု အစီအစဉ်",
    heroSubtitle: "သင့်အသားအရေ အခြေအနေကို ပြောပြပါ။ ကျွန်တော်တို့၏ AI က ထုတ်ကုန်များကို လက်တွေ့ ရှာဖွေပြီး ကိုယ်ပိုင် အစီအစဉ် တည်ဆောက်ပေးပါသည် - ယေဘုယျ စာရင်းများ မဟုတ်ပါ။",
    footerText: "Claude AI + Tavily search ဖြင့် အားဖြည့်ထားသည် · ရလဒ်များသည် အချက်အလက် ရည်ရွယ်ချက်သာ ဖြစ်ပါသည်",

    skinType: "အသားအရေ အမျိုးအစား",
    dry: "ခြောက်သွေ့", oily: "ဆီပြန်", combination: "ရောနှော", normal: "ပုံမှန်", sensitive: "အထိခိုက်လွယ်",
    primaryConcern: "အဓိ စိတ်ပူစရာ",
    acne: "ဝက်ခြံ / အဖုအပိမ့်", aging: "အိုမင်းခြင်း / အရေးအကြောင်း", hyperpigmentation: "အရောင်ဖြူ / အမဲစွန်း",
    drynessConcern: "ခြောက်သွေ့ခြင်း / ရေဓာတ်", sensitivity: "အထိခိုက်လွယ်ခြင်း / နီရဲခြင်း", brightening: "ထွန်းလင်းခြင်း / တောက်ပခြင်း",
    pores: "အပေါက်ကြီးခြင်း", redness: "နီရဲခြင်း / Rosacea",
    budget: "ထုတ်ကုန်တစ်ခုစီ ဘတ်ဂျက်",
    under30: "$30 အောက်", range3060: "$30 – $60", range60100: "$60 – $100", over100: "$100 အထက်",
    brandOrigin: "အမှတ်တံဆိပ် မူလနေရာ",
    noPreference: "ဦးစားပေးမှု မရှိ", korean: "ကိုရီးယား (K-Beauty)", japanese: "ဂျပန် (J-Beauty)",
    european: "ဥရောပ", american: "အမေရိကန်",
    routineComplexity: "အသားထိန်းသိမ်းမှု ရှုပ်ထွေးမှု",
    minimal: "အနည်းဆုံး (အဆင့် ၃)", moderate: "အလယ်အလတ် (အဆင့် ၅)", full: "အပြည့်အစုံ (အဆင့် ၇+)",
    climate: "သင့်ရာသီဥတု",
    humid: "စိုထိုင်း / အပူပိုင်း", dryClimate: "ခြောက်သွေ့", temperate: "အပူအအေး လတ်ဆတ်", cold: "အေးမြခြင်း / ဆောင်းရာသီ",
    currentRoutine: "လက်ရှိ အသားထိန်းသိမ်းမှု အစီအစဉ်",
    none: "မရှိ / အစမှ စတင်", basic: "အခြခံ (သန့်စင်ဆေး + အစိုဓာတ်)", someProducts: "ထုတ်ကုန် အချို့", fullRoutine: "အပြည့်အစုံ အစီအစဉ်",
    avoidIngredients: "ရှောင်ရန် ပါဝင်ပစ္စည်းများ",
    fragrance: "အနံ့", alcohol: "အရက်", parabens: "ပါရာဘင်", silicones: "ဆီလီကွန်", essentialOils: "အဆီများ",
    findRoutine: "ကျွန်တော့် အသားထိန်းသိမ်းမှု အစီအစဉ် ရှာဖွေရန်",
    researching: "သင့်အစီအစဉ်ကို သုတေသန ပြုနေပါသည်…",

    personalizedRoutine: "သင့်ကိုယ်ပိုင် အသားထိန်းသိမ်းမှု အစီအစဉ်",
    productsCurated: "သင့်အသားအရေ ပရိုဖိုင်အတွက် ထုတ်ကုန် {count} ခု ရွေးချယ်ထားပါသည်",
    adjustFilters: "စစ်ထုတ်မှုများ ပြင်ဆင်ရန်",
    keyIngredients: "အဓိ ပါဝင်ပစ္စည်းများ",
    whereToBuy: "ဘယ်မှာ ဝယ်ရမလဲ",

    filterSummaryIntro: "ထုတ်ကုန် အကြံပြုချက်များ",
    skinWord: "အသားအရေ",
    withinBudget: "ဘတ်ဂျက်",
    budgetWord: "အတွင်း",
    fromBrands: "အမှတ်တံဆိပ်",
    brandsWord: "မှ",
    forClimate: "ရာသီဥတု",
    climateWord: "အတွက်",
    avoiding: "ရှောင်ရှား",
  },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && translations[saved]) {
      setLocaleState(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;
    localStorage.setItem("locale", locale);
  }, [locale, mounted]);

  function setLocale(l: Locale) {
    setLocaleState(l);
  }

  function t(key: string, params?: Record<string, string | number>): string {
    const dict = translations[locale] || translations.en;
    let value = dict[key] || translations.en[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }
    return value;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
