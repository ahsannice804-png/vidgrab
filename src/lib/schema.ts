/**
 * Minimal, dependency-free schema.org typings — the same shape as `schema-dts`
 * (Graph / WithContext helpers). Kept intentionally small; extend as needed.
 */

interface Thing {
  "@type"?: string | string[];
  [key: string]: unknown;
}

export type WithContext<T extends Thing> = Thing & T;

export interface WebApplication extends Thing {
  "@type": "WebApplication";
  name?: string;
  url?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  description?: string;
  offers?: Thing;
  publisher?: Thing;
  browserRequirements?: string;
}

export interface FAQPage extends Thing {
  "@type": "FAQPage";
  mainEntity?: Array<Thing & { "@type": "Question" }>;
}

export interface BreadcrumbList extends Thing {
  "@type": "BreadcrumbList";
  itemListElement?: Array<Thing & { "@type": "ListItem" }>;
}