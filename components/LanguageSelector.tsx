"use client";

import { useI18n, LOCALE_OPTIONS, type Locale } from "@/lib/i18n";

export default function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="language-selector"
      aria-label="Select language"
    >
      {LOCALE_OPTIONS.map(({ value, label, flag }) => (
        <option key={value} value={value}>
          {flag} {label}
        </option>
      ))}
    </select>
  );
}
