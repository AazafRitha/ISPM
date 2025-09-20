// Author: Aazaf Ritha

const AUTH_EVENT = "auth:changed";

// Snapshot of current auth info
export function getAuth() {
  const token = localStorage.getItem("token") || "";
  const role  = localStorage.getItem("role")  || ""; // "admin" | "employee" | ""
  const name  = localStorage.getItem("name")  || "";
  return { token, role, name, loggedIn: !!token };
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export function getRole() {
  return localStorage.getItem("role") || "employee";
}

export function getDashboardPath() {
  return getRole() === "admin" ? "/admin/quizzes/manage" : "/employee/quizzes";
}

// Call these from your login flow
export function login(token, role = "employee", name = "") {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  if (name) localStorage.setItem("name", name);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  window.dispatchEvent(new Event(AUTH_EVENT));
}

// Subscribe in components (like Header)
export function onAuthChange(cb) {
  window.addEventListener(AUTH_EVENT, cb);
  window.addEventListener("storage", cb); // cross-tab updates
  return () => {
    window.removeEventListener(AUTH_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
