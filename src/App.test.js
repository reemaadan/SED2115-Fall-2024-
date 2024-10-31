// Import special functions to help us test the code
import { render, screen } from '@testing-library/react';
// Import the main component of our app, named "App"
import App from './App';

// Begin a test to check if a "learn react" link shows up on the screen
test('renders learn react link', () => {
  // Render (display) the App component in a simulated environment
  render(<App />);
  // Look for any text that says "learn react" (the `/learn react/i` part ignores case)
  const linkElement = screen.getByText(/learn react/i);
  // Check that this text element actually shows up on the screen
  expect(linkElement).toBeInTheDocument();
});

// --------- Start of More Detailed Testing for App Component ----------

// Import React so we can use React components and tools
import React from 'react';
// Import additional functions to help us with testing, including waiting for things to load
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
// Import the App component and specific functions related to Spotify for testing
import App from './App';
import { validateToken, fetchUserTopArtists } from './spotify_service';

// Mock (or "fake") the Spotify service functions so we don’t make real API calls
jest.mock('./spotify_service');

// Mock (fake) the chart component, as we’re only testing App’s functionality here
jest.mock('./chart_component', () => {
  return function MockChartComponent() {
    // Fake the chart component with a simple div (HTML box) we can refer to in tests
    return <div data-testid="chart">Chart Component</div>;
  };
});

// Grouping our tests for the "App" component
describe('App', () => {
  // Before each test, reset any mocked functions and clear the URL hash
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocked functions so they act fresh each time
    window.location.hash = ''; // Clear any URL "hash" (extra info after a # symbol)
  });

  // Test #1: Check if App handles a successful login and data load correctly
  test('should handle successful authentication and data loading', async () => {
    // Set up validateToken function to return "true" (meaning the token is valid)
    validateToken.mockResolvedValue(true);
    // Set up fetchUserTopArtists to return a list of artists (fake artist data)
    fetchUserTopArtists.mockResolvedValue({
      items: [
        { name: 'Artist 1', popularity: 90 },
        { name: 'Artist 2', popularity: 85 }
      ]
    });

    // Pretend the URL contains a valid token after a successful login
    window.location.hash = '#access_token=valid_token';

    // Wait for everything in this block to finish before moving on
    await act(async () => {
      // Render (show) the App component in a simulated browser screen
      render(<App />);
      // Because this is inside "act," we ensure any changes that happen while 
      // rendering are fully finished before checking the test results
    });

    // Check that each part of the successful login flow works as expected
    await waitFor(() => {
      // Confirm validateToken was called with the "valid_token" we faked above
      expect(validateToken).toHaveBeenCalledWith('valid_token');
      // Confirm that fetchUserTopArtists function was called to get artist data
      expect(fetchUserTopArtists).toHaveBeenCalled();
      // Check that the screen shows "Your Top Artists" text and the chart
      expect(screen.getByText('Your Top Artists')).toBeInTheDocument();
      expect(screen.getByTestId('chart')).toBeInTheDocument();
    });
  });

  // Test #2: Check if App correctly handles an invalid token
  test('should handle failed token validation', async () => {
    // Set up validateToken to return "false" (meaning the token is invalid)
    validateToken.mockResolvedValue(false);

    // Pretend the URL contains an invalid token
    window.location.hash = '#access_token=invalid_token';

    // Wait for everything in this block to finish before moving on
    await act(async () => {
      // Render (show) the App component in a simulated browser screen
      render(<App />);
      // Ensures any changes from rendering are complete before checking the test results
    });

    // Check that error handling works correctly
    await waitFor(() => {
      // Confirm an error message about the invalid token appears on screen
      expect(screen.getByText('Invalid access token received')).toBeInTheDocument();
      // Confirm that a "Login Again" button appears for the user to retry
      expect(screen.getByText('Login Again')).toBeInTheDocument();
      // Make sure fetchUserTopArtists wasn't called since token was invalid
      expect(fetchUserTopArtists).not.toHaveBeenCalled();
    });
  });

  // Test #3: Check if App handles an error when data loading fails
  test('should handle data loading error', async () => {
    // Set up validateToken to return true, but fetchUserTopArtists to fail
    validateToken.mockResolvedValue(true);
    fetchUserTopArtists.mockRejectedValue(new Error('Failed to load user data'));

    // Pretend the URL contains a valid token
    window.location.hash = '#access_token=valid_token';

    // Wait for everything in this block to finish before moving on
    await act(async () => {
      // Render (show) the App component in a simulated browser screen
      render(<App />);
      // Ensures any updates or changes are complete before we check results
    });

    // Check that data loading error handling works as expected
    await waitFor(() => {
      // Confirm an error message about data loading appears on screen
      expect(screen.getByText('Failed to load user data')).toBeInTheDocument();
      // Confirm a "Login Again" button appears for the user to retry
      expect(screen.getByText('Login Again')).toBeInTheDocument();
    });
  });
});
