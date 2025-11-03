import { create } from "zustand";
import { getUsersCollection } from "@/db/rxdb";
import type { UserDocType } from "@/db/schemas/user.schema";
import { v4 as uuidv4 } from "uuid";

const USERNAME_STORAGE_KEY = "auth_username";

interface AuthState {
  userId: string | null;
  userName: string | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (name: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  userName: null,
  isLoading: true,

  initialize: async () => {
    const savedUserName = localStorage.getItem(USERNAME_STORAGE_KEY);
    if (savedUserName) {
      try {
        await get().login(savedUserName);
        set({ isLoading: false });
      } catch {
        localStorage.removeItem(USERNAME_STORAGE_KEY);
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: async (name: string) => {
    try {
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new Error("Name cannot be empty");
      }

      const usersCollection = await getUsersCollection();
      const user = await usersCollection.findOne().where("name").equals(trimmedName).exec();

      let userDoc: UserDocType;
      if (user) {
        userDoc = user.toJSON() as UserDocType;
      } else {
        const userId = uuidv4();
        const newUser = await usersCollection.insert({
          id: userId,
          name: trimmedName,
          createdAt: new Date().toISOString(),
        });
        userDoc = newUser.toJSON() as UserDocType;
      }

      localStorage.setItem(USERNAME_STORAGE_KEY, userDoc.name);

      set({
        userId: userDoc.id,
        userName: userDoc.name,
      });
    } catch (error) {
      console.error("Failed to login:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(USERNAME_STORAGE_KEY);
    set({
      userId: null,
      userName: null,
    });
  },
}));
