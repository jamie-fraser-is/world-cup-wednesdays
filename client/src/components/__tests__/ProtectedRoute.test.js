import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../Auth/ProtectedRoute';

// Mock the useAuth hook
const mockUseAuth = {
  user: null,
  loading: false
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth
}));

const TestComponent = () => <div>Protected Content</div>;

const renderProtectedRoute = () => {
  return render(
    <BrowserRouter>
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading spinner when loading', () => {
    mockUseAuth.loading = true;
    mockUseAuth.user = null;
    
    renderProtectedRoute();
    
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    mockUseAuth.loading = false;
    mockUseAuth.user = { id: 1, displayName: 'Test User' };
    
    renderProtectedRoute();
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockUseAuth.loading = false;
    mockUseAuth.user = null;
    
    renderProtectedRoute();
    
    // Should redirect to login (Navigate component)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should not render children during loading state', () => {
    mockUseAuth.loading = true;
    mockUseAuth.user = { id: 1, displayName: 'Test User' };
    
    renderProtectedRoute();
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});