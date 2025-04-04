export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
}

export interface User {
  id: number
  username: string
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface UserCreateDto {
  username: string
  email: string
  password: string
  role: UserRole
}

export interface UserUpdateDto {
  username?: string
  email?: string
  password?: string
  role?: UserRole
}

export interface UserLoginDto {
  email: string
  password: string
}

export interface UserAuthResponse {
  user: User
  token: string
}
