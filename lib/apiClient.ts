let refreshPromise: Promise<Response> | null = null;

export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (res.status === 401) {
    // Parallel calls me sirf ek refresh ho
    if (!refreshPromise) {
      refreshPromise = fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      }).finally(() => {
        refreshPromise = null;
      });
    }

    const refreshRes = await refreshPromise;

    if (refreshRes.ok) {
      // Retry original request
      res = await fetch(url, {
        ...options,
        credentials: "include",
      });
    }
  }

  return res;
}