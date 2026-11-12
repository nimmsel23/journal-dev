// Store-Build-Erkennung (Play-Store-Edition von VitalOS). Owner-/Private-Builds
// setzen weder VITE_VOS_EDITION noch VITE_VOS_PRODUCT_BUILD und bleiben unverändert.
// Einzelvergleiche (statt Array.includes), damit der Bundler den Zweig zur Build-Zeit auflöst.
const EDITION = import.meta.env?.VITE_VOS_EDITION;

export const IS_STORE_BUILD = EDITION === "store" || EDITION === "observe" || EDITION === "operate"
  || import.meta.env?.VITE_VOS_PRODUCT_BUILD === "1";
