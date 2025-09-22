// Normalize potentially relative asset paths to absolute URLs against the API origin
export function publicUrl(u) {
  try {
    if (!u) return "";
    // Already absolute or inlined
    if (/^(https?:|data:|blob:)/i.test(u)) return u;

    const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
    const origin = new URL(API).origin; // e.g., http://localhost:5000

    if (u.startsWith("/")) return origin + u; // "/uploads/..." -> "http://.../uploads/..."
    return origin + "/" + u.replace(/^\.\//, "");
  } catch (_) {
    return u;
  }
}
