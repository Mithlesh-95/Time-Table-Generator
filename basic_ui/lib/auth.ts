import { apiClient } from "./api"

export type Me = {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  role: "superadmin" | "admin" | "user"
  college?: {
    id: number
    name: string
    code: string
  } | null
}

export async function fetchMe(): Promise<Me> {
  const res = await apiClient.get("/auth/me/")
  // Our DRF renderer wraps responses as { success, data }
  const payload = res?.data
  if (payload && typeof payload === "object" && Object.prototype.hasOwnProperty.call(payload, "data")) {
    return payload.data as Me
  }
  return payload as Me
}
