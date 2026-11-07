import "server-only";
import { cookies } from "next/headers";
import { isMarketplaceLocale, LOCALE_COOKIE, marketplaceT, type MarketplaceLocale, type MarketplaceStrings } from "./marketplace";

/** Marketplace locale from the `nonnina_lang` cookie (set by /helpers/lang). Default English. */
export async function getMarketplaceLocale(): Promise<MarketplaceLocale> {
  const jar = await cookies();
  const value = jar.get(LOCALE_COOKIE)?.value;
  return isMarketplaceLocale(value) ? value : "en";
}

export async function getMarketplaceT(): Promise<{ locale: MarketplaceLocale; t: MarketplaceStrings }> {
  const locale = await getMarketplaceLocale();
  return { locale, t: marketplaceT(locale) };
}
