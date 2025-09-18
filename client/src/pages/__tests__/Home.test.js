import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import axios from 'axios';

// Mock axios
jest.mocked(axios);

const renderHome = () => {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
};

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render hero section', async () => {
    axios.get.mockResolvedValue({ data: { competition: null, competitions: [] } });
    
    renderHome();
    
    expect(screen.getByText('World Cup Wednesdays')).toBeInTheDocument();
    expect(screen.getByText('Fortnightly competitions to settle the great debates')).toBeInTheDocument();
    expect(screen.getByText('Join the Competition')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderHome();
    
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  });

  it('should display current competition when available', async () => {
    const mockCurrentCompetition = {
      id: 1,
      title: 'Best Soft Drink',
      topic: 'Which soft drink reigns supreme?',
      host_name: 'John Doe',
      status: 'accepting_entries',
      entry_count: 5,
      entry_deadline: '2024-12-31T23:59:59Z'
    };

    axios.get.mockImplementation((url) => {
      if (url === '/api/competitions/current') {
        return Promise.resolve({ data: { competition: mockCurrentCompetition } });
      }
      if (url === '/api/competitions?limit=5') {
        return Promise.resolve({ data: { competitions: [] } });
      }
    });
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('Current Competition')).toBeInTheDocument();
      expect(screen.getByText('Best Soft Drink')).toBeInTheDocument();
      expect(screen.getByText('Which soft drink reigns supreme?')).toBeInTheDocument();
      expect(screen.getByText('Host: John Doe')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Entry count
      expect(screen.getByText('ACCEPTING_ENTRIES')).toBeInTheDocument();
    });
  });

  it('should display recent competitions', async () => {
    const mockRecentCompetitions = [
      {
        id: 1,
        title: 'Best Movie',
        topic: 'Greatest film of all time',
        host_name: 'Jane Smith',
        status: 'completed',
        entry_count: 8,
        winner_name: 'The Godfather'
      },
      {
        id: 2,
        title: 'Best Pizza Topping',
        topic: 'Ultimate pizza topping debate',
        host_name: 'Bob Wilson',
        status: 'voting',
        entry_count: 12,
        winner_name: null
      }
    ];

    axios.get.mockImplementation((url) => {
      if (url === '/api/competitions/current') {
        return Promise.resolve({ data: { competition: null } });
      }
      if (url === '/api/competitions?limit=5') {
        return Promise.resolve({ data: { competitions: mockRecentCompetitions } });
      }
    });
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('Recent Competitions')).toBeInTheDocument();
      expect(screen.getByText('Best Movie')).toBeInTheDocument();
      expect(screen.getByText('Best Pizza Topping')).toBeInTheDocument();
      expect(screen.getByText('Host: Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Host: Bob Wilson')).toBeInTheDocument();
      expect(screen.getByText('Winner: The Godfather')).toBeInTheDocument();
    });
  });

  it('should show message when no competitions exist', async () => {
    axios.get.mockResolvedValue({ data: { competition: null, competitions: [] } });
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('No competitions yet. Be the first to start one!')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));
    
    renderHome();
    
    await waitFor(() => {
      // Should not crash and should show empty state
      expect(screen.getByText('Recent Competitions')).toBeInTheDocument();
    });
  });

  it('should have correct navigation links', async () => {
    axios.get.mockResolvedValue({ data: { competition: null, competitions: [] } });
    
    renderHome();
    
    await waitFor(() => {
      const joinButton = screen.getByText('Join the Competition');
      expect(joinButton.closest('a')).toHaveAttribute('href', '/register');
    });
  });
});