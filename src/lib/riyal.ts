// New Saudi Riyal symbol (U+20C1) support across the whole app.
// The glyph is provided by the "saudi_riyal" webfont, registered in index.css
// and injected into print windows through RIYAL_FONT_CSS.

export const RIYAL = '\u20C1';

// CSS to embed in printed documents (separate window => needs its own @font-face)
export const RIYAL_FONT_CSS = `
@font-face {
  font-family: 'saudi_riyal';
  src: url('https://cdn.jsdelivr.net/npm/@emran-alhaddad/saudi-riyal-font/fonts/regular/saudi_riyal.woff2') format('woff2'),
       url('https://cdn.jsdelivr.net/npm/@emran-alhaddad/saudi-riyal-font/fonts/regular/saudi_riyal.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}
`;

// Tokens produced by Intl for SAR in the various locales used in the app
const CURRENCY_TOKENS = /(?:SAR|ر\.س\.?|﷼|ريال سعودي|ريال)/g;

/** Replaces any legacy SAR wording with the new Riyal symbol. */
export const withRiyalSymbol = (value: string) =>
  value.replace(CURRENCY_TOKENS, RIYAL).replace(/\s{2,}/g, ' ').trim();

/**
 * Global patch: every Intl.NumberFormat currency output in the app renders the
 * new Riyal symbol instead of "SAR" / "ر.س".
 */
export const installRiyalSymbol = () => {
  const OriginalNumberFormat = Intl.NumberFormat;
  if ((OriginalNumberFormat as any).__riyalPatched) return;

  const patchInstance = (instance: Intl.NumberFormat) => {
    const originalFormat = instance.format.bind(instance);
    instance.format = (value: number | bigint) => withRiyalSymbol(originalFormat(value as number));
    return instance;
  };

  const Patched: any = function (
    this: unknown,
    locales?: string | string[],
    options?: Intl.NumberFormatOptions
  ) {
    const instance = new (OriginalNumberFormat as any)(locales, options);
    if (options?.style === 'currency') patchInstance(instance);
    return instance;
  };

  Patched.prototype = OriginalNumberFormat.prototype;
  Patched.supportedLocalesOf = OriginalNumberFormat.supportedLocalesOf.bind(OriginalNumberFormat);
  Patched.__riyalPatched = true;

  (Intl as any).NumberFormat = Patched;
};
