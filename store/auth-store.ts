import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminUser, AuthState } from '@/types';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
}

// Mock admin credentials
const MOCK_ADMIN = {
  email: 'admin@brewmaster.com',
  password: 'admin123',
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock authentication
        if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
          const mockUser: AdminUser = {
            id: 'admin-1',
            email: MOCK_ADMIN.email,
            name: 'Admin User',
            role: 'admin',
          };

          // Generate mock JWT token
          const mockToken = `mock-jwt-token-${Date.now()}`;

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
          });

          return true;
        }

        return false;
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: () => {
        const { token, isAuthenticated } = get();
        return !!token && isAuthenticated;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
