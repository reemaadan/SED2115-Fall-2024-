import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

// App.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import App from './App';
import { validateToken, fetchUserTopArtists } from './spotify_service';

// Mock the Spotify service functions
jest.mock('./spotify_service');

// Mock the chart component since we're not testing its implementation
jest.mock('./chart_component', () => {
  return function MockChartComponent() {
    return <div data-testid="chart">Chart Component</div>;
  };
});

describe('App', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    window.location.hash = '';
  });

  test('should handle successful authentication and data loading', async () => {
    // Setup mocks for successful flow
    validateToken.mockResolvedValue(true);
    fetchUserTopArtists.mockResolvedValue({
      items: [
        { name: 'Artist 1', popularity: 90 },
        { name: 'Artist 2', popularity: 85 }
      ]
    });

    // Simulate Spotify redirect with token in URL
    window.location.hash = '#access_token=valid_token';

    // Render app
    await act(async () => {
      render(<App />);
    });

    // Verify successful authentication flow
    await waitFor(() => {
      // Check that token validation was called
      expect(validateToken).toHaveBeenCalledWith('valid_token');
      // Check that data was fetched
      expect(fetchUserTopArtists).toHaveBeenCalled();
      // Verify UI shows data visualization
      expect(screen.getByText('Your Top Artists')).toBeInTheDocument();
      expect(screen.getByTestId('chart')).toBeInTheDocument();
    });
  });

  test('should handle failed token validation', async () => {
    // Setup mock for invalid token
    validateToken.mockResolvedValue(false);

    // Simulate Spotify redirect with invalid token
    window.location.hash = '#access_token=invalid_token';

    // Render app
    await act(async () => {
      render(<App />);
    });

    // Verify error handling
    await waitFor(() => {
      // Check error message is displayed
      expect(screen.getByText('Invalid access token received')).toBeInTheDocument();
      // Check that login button is shown
      expect(screen.getByText('Login Again')).toBeInTheDocument();
      // Verify data was not fetched
      expect(fetchUserTopArtists).not.toHaveBeenCalled();
    });
  });

  test('should handle data loading error', async () => {
    // Setup mocks for failed data loading
    validateToken.mockResolvedValue(true);
    fetchUserTopArtists.mockRejectedValue(new Error('Failed to load user data'));

    // Simulate Spotify redirect with token
    window.location.hash = '#access_token=valid_token';

    // Render app
    await act(async () => {
      render(<App />);
    });

    // Verify error handling
    await waitFor(() => {
      // Check error message is displayed
      expect(screen.getByText('Failed to load user data')).toBeInTheDocument();
      // Verify token was reset
      expect(screen.getByText('Login Again')).toBeInTheDocument();
    });
  });
});
