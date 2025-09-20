export async function fetchMetrics() {
  const res = await fetch("/api/admin/metrics");
  if (!res.ok) throw new Error("Failed to load metrics");
  return res.json();
}
