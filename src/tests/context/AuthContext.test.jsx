import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../../app/context/AuthContext.jsx';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { is_verified: true } }))
  }
}));

// A simple test component that consumes the AuthContext
const TestConsumer = () => {
  const { login, logout, token, userData } = useAuth();
  return (
    <div>
      <span data-testid="token">{token || 'no-token'}</span>
      <span data-testid="user">{userData ? userData.username : 'no-user'}</span>
      <button
        data-testid="login-btn"
        onClick={() => login('new-token', { username: 'newuser', role: 'user' })}
      >
        Login
      </button>
      <button
        data-testid="logout-btn"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
};

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value?.toString(); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it('provides default values', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('token').textContent).toBe('no-token');
    expect(screen.getByTestId('user').textContent).toBe('no-user');
  });

  it('loads token and userData from localStorage on mount', async () => {
    window.localStorage.setItem('token', 'stored-token');
    window.localStorage.setItem('userData', JSON.stringify({ username: 'storeduser' }));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('stored-token');
      expect(screen.getByTestId('user').textContent).toBe('storeduser');
    });
  });

  it('handles login properly', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    
    // Trigger login
    act(() => {
        screen.getByTestId('login-btn').click();
    });
    
    expect(screen.getByTestId('token').textContent).toBe('new-token');
    expect(screen.getByTestId('user').textContent).toBe('newuser');
    
    // LocalStorage should update
    expect(window.localStorage.getItem('token')).toBe('new-token');
    expect(JSON.parse(window.localStorage.getItem('userData'))).toEqual({ username: 'newuser', role: 'user' });
  });

  it('handles logout properly', async () => {
    // Setup initial logged in state
    window.localStorage.setItem('token', 'stored-token');
    window.localStorage.setItem('userData', JSON.stringify({ username: 'storeduser' }));
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    
    // Wait for initial async fetchProfile to finish
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('storeduser');
    });
    
    // Trigger logout
    act(() => {
        screen.getByTestId('logout-btn').click();
    });
    
    // State should clear
    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('no-token');
      expect(screen.getByTestId('user').textContent).toBe('no-user');
    });
    
    // LocalStorage should clear
    expect(window.localStorage.getItem('token')).toBeNull();
    expect(window.localStorage.getItem('userData')).toBeNull();
  });
});
