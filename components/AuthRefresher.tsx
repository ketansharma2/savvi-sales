"use client";

import { useEffect } from "react";

export default function AuthRefresher() {
  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          console.warn("Token refresh failed");
        }
      } catch (err) {
        console.error("Refresh error:", err);
      }
    };

    // Har 13 minute me refresh (15 min expire hone se pehle)
    const interval = setInterval(refresh, 13 * 60 * 1000);

    // Pehli baar immediate refresh
    refresh();

    return () => clearInterval(interval);
  }, []);

  return null;
}