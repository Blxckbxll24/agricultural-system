export interface User {
  id: number
  username: string
  email: string
  password_hash: string
  role: "admin" | "operator" | "viewer"
  full_name: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
  last_login: Date | null
}

export interface UserResponse {
  id: number
  username: string
  email: string
  role: string
  full_name: string | null
  is_active: boolean
  created_at: Date
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  full_name?: string
  role?: "admin" | "operator" | "viewer"
}

export interface TokenPayload {
  userId: number
  username: string
  role: string
}
