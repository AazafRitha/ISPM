// Author: Aazaf Ritha
// Frontend-only badge utilities: maps quiz difficulty to badge images
// and persists earned badges to localStorage (scoped per user).

import badgeEasy from "../assets/Badge/Badge Esay.jpg";
import badgeMedium from "../assets/Badge/Badge Medium.jpg";
import badgeHard from "../assets/Badge/Badge Hard.jpg";
import { getAuth } from "./auth";

export function badgeAssetForDifficulty(difficulty) {
  switch ((difficulty || "medium").toLowerCase()) {
    case "easy":
      return { title: "Easy Badge", image: badgeEasy };
    case "hard":
      return { title: "Hard Badge", image: badgeHard };
    case "medium":
    default:
      return { title: "Medium Badge", image: badgeMedium };
  }
}

function storageKey() {
  const { name, token } = getAuth();
  // Namespace by user when possible
  const ns = name || token || "guest";
  return `earnedBadges:${ns}`;
}

export function listEarnedBadges() {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function hasBadgeForQuiz(quizId) {
  return listEarnedBadges().some((b) => String(b.quizId) === String(quizId));
}

export function saveEarnedBadge({ quizId, quizTitle, difficulty, score }) {
  if (!quizId) return;
  const existing = listEarnedBadges();
  if (existing.some((b) => String(b.quizId) === String(quizId))) return existing; // no dupes

  const { title, image } = badgeAssetForDifficulty(difficulty);
  const entry = {
    id: `${quizId}-${Date.now()}`,
    quizId,
    quizTitle,
    difficulty,
    badgeTitle: title,
    badgeImage: image,
    score: typeof score === "number" ? score : null,
    earnedDate: new Date().toISOString(),
  };
  const next = [entry, ...existing];
  localStorage.setItem(storageKey(), JSON.stringify(next));
  return next;
}
