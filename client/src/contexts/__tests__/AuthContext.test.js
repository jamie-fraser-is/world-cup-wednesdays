import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import axios from 'axios';

// Mock axios
jest.mocked(axios);

// Test component to access auth context
const TestComponent = () => {
  const { user, login, register, logout, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.displayName : 'no-user'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register('test@example.com', 'password', 'Test User')}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should provide initial loading state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('should handle successful login', async () => {
    const mockResponse = {
      data: {
        token: 'mock-token',
        user: {
          id: 1,
          email: 'test@example.com',
          displayName: 'Test User'
        }
      }
    };

    axios.post.mockResolvedValueOnce(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // Click login button
    screen.getByText('Login').click();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    expect(localStorage.getItem('token')).toBe('mock-token');
    expect(axios.defaults.headers.common['Authorization']).toBe('Bearer mock-token');
  });

  it('should handle login failure', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    screen.getByText('Login').click();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });
  });

  it('should handle successful registration', async () => {
    const mockResponse = {
      data: {
        token: 'mock-token',
        user: {
          id: 1,
          email: 'test@example.com',
          displayName: 'Test User'
        }
      }
    };

    axios.post.mockResolvedValueOnce(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    screen.getByText('Register').click();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    expect(localStorage.getItem('token')).toBe('mock-token');
  });

  it('should handle logout', async () => {
    // Set up initial logged-in state
    localStorage.setItem('token', 'existing-token');
    axios.defaults.headers.common['Authorization'] = 'Bearer existing-token';
    
    const mockUserResponse = {
      data: {
        user: {
          id: 1,
          email: 'test@example.com',
          displayName: 'Test User'
        }
      }
    };

    axios.get.mockResolvedValueOnce(mockUserResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    screen.getByText('Logout').click();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
  });

  it('should fetch user on mount when token exists', async () => {
    localStorage.setItem('token', 'existing-token');
    
    const mockUserResponse = {
      data: {
        user: {
          id: 1,
          email: 'test@example.com',
          displayName: 'Test User'
        }
      }
    };

    axios.get.mockResolvedValueOnce(mockUserResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    expect(axios.get).toHaveBeenCalledWith('/api/auth/me');
  });
});