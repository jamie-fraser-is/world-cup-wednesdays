import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Layout/Navbar';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the useAuth hook
const mockLogout = jest.fn();
const mockUseAuth = {
  user: null,
  logout: mockLogout
};

jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: () => mockUseAuth
}));

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render logo and title', () => {
    renderNavbar();
    
    expect(screen.getByText('World Cup Wednesdays')).toBeInTheDocument();
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });

  it('should show login and register links when user is not logged in', () => {
    renderNavbar();
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('should show user menu when user is logged in', () => {
    mockUseAuth.user = {
      id: 1,
      displayName: 'Test User',
      email: 'test@example.com'
    };

    renderNavbar();
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', () => {
    mockUseAuth.user = {
      id: 1,
      displayName: 'Test User',
      email: 'test@example.com'
    };

    renderNavbar();
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('should have correct navigation links', () => {
    renderNavbar();
    
    const homeLink = screen.getByText('World Cup Wednesdays').closest('a');
    const leaderboardLink = screen.getByText('Leaderboard').closest('a');
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(leaderboardLink).toHaveAttribute('href', '/leaderboard');
  });
});