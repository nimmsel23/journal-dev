export function isISODate(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function sanitizeMetric(value) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.max(0, Math.round(num * 10) / 10) : 0;
}

export function normalizeRoutedPath(pathname, req) {
  let path = pathname;

  // Strip /c/<clientId>/ prefix (client-based routing)
  const clientMatch = path.match(/^\/c\/([^/]+)\/(.*)$/);
  if (clientMatch) {
    req.clientId = clientMatch[1];
    path = "/" + clientMatch[2];
  }

  // Strip other prefixes (backwards compat)
  const prefixMatch = path.match(/^\/[a-z0-9-]+\/(.+)$/);
  if (prefixMatch && !path.startsWith("/v2") && !path.startsWith("/nutrition") &&
      !path.startsWith("/supplements") && !path.startsWith("/fuel")) {
    path = "/" + prefixMatch[1];
  }

  return path;
}
