import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Leaderboard from '../Leaderboard';
import axios from 'axios';

// Mock axios
jest.mocked(axios);

describe('Leaderboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render leaderboard header', async () => {
    axios.get.mockResolvedValue({ data: { leaderboard: [] } });
    
    render(<Leaderboard />);
    
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Top performers in World Cup Wednesdays')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<Leaderboard />);
    
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  });

  it('should display leaderboard data', async () => {
    const mockLeaderboard = [
      {
        id: 1,
        display_name: 'Champion User',
        avatar_url: null,
        total_competitions: 10,
        total_wins: 8,
        win_rate: '80.00',
        times_hosted: 2,
        total_votes_cast: 45
      },
      {
        id: 2,
        display_name: 'Runner Up',
        avatar_url: 'https://example.com/avatar.jpg',
        total_competitions: 8,
        total_wins: 5,
        win_rate: '62.50',
        times_hosted: 1,
        total_votes_cast: 32
      }
    ];

    axios.get.mockResolvedValue({ data: { leaderboard: mockLeaderboard } });
    
    render(<Leaderboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Rankings')).toBeInTheDocument();
      expect(screen.getByText('Champion User')).toBeInTheDocument();
      expect(screen.getByText('Runner Up')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument(); // Wins for champion
      expect(screen.getByText('80%')).toBeInTheDocument(); // Win rate
      expect(screen.getByText('45')).toBeInTheDocument(); // Votes cast
    });
  });

  it('should show correct ranking positions', async () => {
    const mockLeaderboard = [
      {
        id: 1,
        display_name: 'First Place',
        total_competitions: 5,
        total_wins: 5,
        win_rate: '100.00',
        times_hosted: 1,
        total_votes_cast: 20
      },
      {
        id: 2,
        display_name: 'Second Place',
        total_competitions: 5,
        total_wins: 3,
        win_rate: '60.00',
        times_hosted: 0,
        total_votes_cast: 25
      }
    ];

    axios.get.mockResolvedValue({ data: { leaderboard: mockLeaderboard } });
    
    render(<Leaderboard />);
    
    await waitFor(() => {
      const rankings = screen.getAllByText(/^\d+$/);
      expect(rankings[0]).toHaveTextContent('1');
      expect(rankings[1]).toHaveTextContent('2');
    });
  });

  it('should show empty state when no data available', async () => {
    axios.get.mockResolvedValue({ data: { leaderboard: [] } });
    
    render(<Leaderboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No competition data available yet.')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));
    
    render(<Leaderboard />);
    
    await waitFor(() => {
      // Should show empty state instead of crashing
      expect(screen.getByText('No competition data available yet.')).toBeInTheDocument();
    });
  });

  it('should display user avatars when available', async () => {
    const mockLeaderboard = [
      {
        id: 1,
        display_name: 'User With Avatar',
        avatar_url: 'https://example.com/avatar.jpg',
        total_competitions: 5,
        total_wins: 3,
        win_rate: '60.00',
        times_hosted: 1,
        total_votes_cast: 20
      }
    ];

    axios.get.mockResolvedValue({ data: { leaderboard: mockLeaderboard } });
    
    render(<Leaderboard />);
    
    await waitFor(() => {
      const avatar = screen.getByAltText('User With Avatar');
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  it('should show default avatar when user has no avatar', async () => {
    const mockLeaderboard = [
      {
        id: 1,
        display_name: 'User Without Avatar',
        avatar_url: null,
        total_competitions: 5,
        total_wins: 3,
        win_rate: '60.00',
        times_hosted: 1,
        total_votes_cast: 20
      }
    ];

    axios.get.mockResolvedValue({ data: { leaderboard: mockLeaderboard } });
    
    render(<Leaderboard />);
    
    await waitFor(() => {
      // Should show default user icon instead of image
      expect(screen.queryByAltText('User Without Avatar')).not.toBeInTheDocument();
    });
  });
});