const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchMetrics() {
  const res = await fetch(`${BASE}/admin/metrics`);
  if (!res.ok) throw new Error("Failed to load metrics");
  return res.json();
}

export async function getAdminProfile() {
  const res = await fetch(`${BASE}/admin/profile`);
  if (!res.ok) throw new Error('Failed to load admin profile');
  return res.json();
}

export async function updateAdminProfile({ name, nic, email, password, photo }) {
  const form = new FormData();
  if (name !== undefined) form.append('name', name);
  if (nic !== undefined) form.append('nic', nic);
  if (email !== undefined) form.append('email', email);
  if (password) form.append('password', password);
  if (photo instanceof File) form.append('photo', photo);

  const res = await fetch(`${BASE}/admin/profile`, {
    method: 'PUT',
    body: form
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || 'Failed to update admin profile');
  }
  return res.json();
}
