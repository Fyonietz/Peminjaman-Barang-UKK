 import { defineMiddleware } from "astro:middleware"

const protectedRoutes: Record<string, string[]> = {
  "/admin": ["admin"],
  "/staff": ["staff"],
  "/customer": ["customer"],
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url)
  const path = url.pathname

  // Check if route needs protection
  const matchedPrefix = Object.keys(protectedRoutes).find(prefix =>
    path.startsWith(prefix)
  )

  if (!matchedPrefix) return next() // public route, skip

  // Read token from cookie
  const token = context.cookies.get("token")?.value

  if (!token) {
    return context.redirect("/login")
  }

  try {
 const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"



    const payload = JSON.parse(atob(token.split(".")[1]))
    const role = payload[ROLE_CLAIM]?.toLowerCase()
    const allowed = protectedRoutes[matchedPrefix]

    if (!allowed.includes(role)) {
      return context.redirect("/403")
    }
  } catch {
    return context.redirect("/login")
  }

  return next()
})
