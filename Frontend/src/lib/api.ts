 const BASE_URL = import.meta.env.PUBLIC_API_URL

function getToken() {
  return localStorage.getItem("token")
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getToken()

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    // Token expired or invalid
    localStorage.removeItem("token")
    document.cookie = "token=; path=/; max-age=0"
    window.location.href = "/login"
  }

  return res
}
