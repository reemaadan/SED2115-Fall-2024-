// Import necessary tools from the testing library
import { render, screen } from '@testing-library/react';
// Import the main component of the app for testing
import App from './App';

// Define a test to check if the "learn react" link is visible in the App
test('renders learn react link', () => {
  // Show (or "render") the App component on a simulated screen
  render(<App />);
  // Look for the element containing the text "learn react"
  const linkElement = screen.getByText(/learn react/i);
  // Check that the link element is actually in the document (visible on screen)
  expect(linkElement).toBeInTheDocument();
});

// ------------ More Detailed Tests for App Component -------------

// Import React to use React functions
import React from 'react';
// Import more testing tools for interacting with the app and testing async code
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
// Import the App component and specific Spotify-related functions for testing
import App from './App';
import { validateToken, fetchUserTopArtists } from './spotify_service';

// Mock (fake) the Spotify service functions so they don’t make real API calls
jest.mock('./spotify_service');

// Mock the chart component (a visual part) since we’re not testing it here
jest.mock('./chart_component', () => {
  return function MockChartComponent() {
    // Simulate a chart element with a "data-testid" for easy reference
    return <div data-testid="chart">Chart Component</div>;
  };
});

// Grouping tests specifically for the App component
describe('App', () => {
  // Before each test, reset any mocked functions and clear the URL hash
  beforeEach(() => {
    jest.clearAllMocks();
    window.location.hash = '';
  });

  // Test for handling successful login and data loading
  test('should handle successful authentication and data loading', async () => {
    // Set up the validateToken function to return "true" (meaning token is valid)
    validateToken.mockResolvedValue(true);
    // Set up the fetchUserTopArtists function to return some "artist" data
    fetchUserTopArtists.mockResolvedValue({
      items: [
        { name: 'Artist 1', popularity: 90 },
        { name: 'Artist 2', popularity: 85 }
      ]
    });

    // Simulate a URL where Spotify added the "access token" after login
    window.location.hash = '#access_token=valid_token';

    // Show the App component and wait for it to load
    await act(async () => {
      render(<App />);
    });

    // Check that each part of the login flow works as expected
    await waitFor(() => {
      // Check that the token validation function was called with the right token
      expect(validateToken).toHaveBeenCalledWith('valid_token');
      // Check that data about top artists was fetched
      expect(fetchUserTopArtists).toHaveBeenCalled();
      // Confirm that the UI shows "Your Top Artists" text and the chart component
      expect(screen.getByText('Your Top Artists')).toBeInTheDocument();
      expect(screen.getByTestId('chart')).toBeInTheDocument();
    });
  });

  // Test for handling an invalid token
  test('should handle failed token validation', async () => {
    // Set up the validateToken function to return "false" (token is invalid)
    validateToken.mockResolvedValue(false);

    // Simulate an invalid token in the URL hash
    window.location.hash = '#access_token=invalid_token';

    // Show the App component and wait for it to load
    await act(async () => {
      render(<App />);
    });

    // Check that error handling works correctly
    await waitFor(() => {
      // Confirm an error message for an invalid token appears on screen
      expect(screen.getByText('Invalid access token received')).toBeInTheDocument();
      // Confirm that a "Login Again" button appears for the user
      expect(screen.getByText('Login Again')).toBeInTheDocument();
      // Verify that no data fetching was attempted with an invalid token
      expect(fetchUserTopArtists).not.toHaveBeenCalled();
    });
  });

  // Test for handling an error when loading data fails
  test('should handle data loading error', async () => {
    // Set up mocks: token validation is successful, but data loading fails
    validateToken.mockResolvedValue(true);
    fetchUserTopArtists.mockRejectedValue(new Error('Failed to load user data'));

    // Simulate a valid token in the URL
    window.location.hash = '#access_token=valid_token';

    // Show the App component and wait for it to load
    await act(async () => {
      render(<App />);
    });

    // Check that the data loading error handling works
    await waitFor(() => {
      // Confirm an error message about data loading appears on screen
      expect(screen.getByText('Failed to load user data')).toBeInTheDocument();
      // Confirm a "Login Again" button appears for the user
      expect(screen.getByText('Login Again')).toBeInTheDocument();
    });
  });
});
