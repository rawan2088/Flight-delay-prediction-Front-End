import { createContext } from "react";
import { USERS_URL } from "../utils/Api";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "NORMAL" | "AIRLINE_STAFF" | "AIRLINE_ADMIN";
  airline: number | null;
  airline_name: string | null;
  created_at: string;
}

export interface ProfileUpdate {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface RegisterData extends ProfileUpdate {
  password: string;
  password2: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const API_URL = USERS_URL;
