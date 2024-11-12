// Import special functions to help us test the code
// "render" shows the component, "screen" lets us find things in the virtual UI (testing functions, not hooks or attributes)
import { render, screen } from '@testing-library/react';

// Import the main component of our app, named "App"
// This is the main component file we are testing (not a hook or attribute)
import App from '../App';

// Begin a test to check if a "learn react" link shows up on the screen
// "test" is a function to define what we're checking (not a hook or attribute)
test('renders learn react link', () => {

  // Render (display) the App component in a simulated environment
  // This shows the App component on a virtual screen (render is a function, not a hook or attribute)
  render(<App />);

  // Look for any text that says "learn react" (the `/learn react/i` part ignores case)
  // "screen.getByText" is a function to find text on the screen (not a hook or attribute)
  const linkElement = screen.getByText(/learn react/i);

  // Check that this text element actually shows up on the screen
  // "expect" is a testing function to confirm something is correct (not a hook or attribute)
  expect(linkElement).toBeInTheDocument();
});

// --------- Start of More Detailed Testing for App Component ----------

// Import React to use React components and tools
// Required for using React components, not a hook or attribute
import React from 'react';

// Import additional functions to help us with testing, including waiting for things to load
// "waitFor" waits until the UI updates
//"act" ensures changes finish before testing (testing functions, not hooks or attributes)
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

// Import the App component and specific functions related to Spotify for testing
// "validateToken" and "fetchUserTopArtists" are functions we’re testing (not hooks or attributes)
import App from '../App';
import { validateToken, fetchUserTopArtists } from './spotify_service';

// Mock (or "fake") the Spotify service functions so we don’t make real API calls
// "jest.mock" creates fake versions of these functions (mocking is a testing concept, not a hook or attribute)
jest.mock('./spotify_service');

// Mock (fake) the chart component, as we’re only testing App’s functionality here
// "jest.mock" again creates a fake chart, which is not the focus of our test
jest.mock('./chart_component', () => {
  // Return a function to fake the chart component with a simple HTML div
  return function MockChartComponent() {
    // "data-testid" is an **attribute** we add to the div to identify it in tests
    return <div data-testid="chart">Chart Component</div>;
  };
});

// Grouping our tests for the "App" component
// "describe" groups related tests under a single name
describe('App', () => {

  // Before each test, reset any mocked functions and clear the URL hash
  // "beforeEach" runs a setup step before each test (setup function, not a hook or attribute)
  beforeEach(() => {
    // "jest.clearAllMocks" resets any mock functions to their original state (testing function)
    jest.clearAllMocks();
    // "window.location.hash" refers to extra info in the URL after the # (hash property, not a hook or attribute)
    window.location.hash = '';
  });

  // Test #1: Check if App handles a successful login and data load correctly
  test('should handle successful authentication and data loading', async () => {

    // Set up validateToken function to return "true" (meaning the token is valid)
    // "mockResolvedValue" makes this mock return true, simulating a successful login
    validateToken.mockResolvedValue(true);

    // Set up fetchUserTopArtists to return a list of artists (fake artist data)
    // "mockResolvedValue" again simulates a response with sample artist data
    fetchUserTopArtists.mockResolvedValue({
      items: [
        { name: 'Artist 1', popularity: 90 },
        { name: 'Artist 2', popularity: 85 }
      ]
    });

    // Pretend the URL contains a valid token after a successful login
    // "window.location.hash" sets a fake token in the URL
    window.location.hash = '#access_token=valid_token';

    // Wait for everything in this block to finish before moving on
    // "await" pauses until this block finishes, and "act" ensures updates are done before testing
    await act(async () => {
      // Render (show) the App component in a simulated browser screen
      render(<App />);
    });

    // Check that each part of the successful login flow works as expected
    await waitFor(() => {
      // Confirm validateToken was called with the "valid_token" we faked above
      // Checks if validateToken was called with our specific fake token
      expect(validateToken).toHaveBeenCalledWith('valid_token');
      // Confirm that fetchUserTopArtists function was called to get artist data
      // Checks if fetchUserTopArtists function was used as expected
      expect(fetchUserTopArtists).toHaveBeenCalled();
      // Check that the screen shows "Your Top Artists" text and the chart
      expect(screen.getByText('Your Top Artists')).toBeInTheDocument();
      // "data-testid" is an **attribute** that lets us identify the chart specifically in our test
      expect(screen.getByTestId('chart')).toBeInTheDocument();
    });
  });

  // Test #2: Check if App correctly handles an invalid token
  test('should handle failed token validation', async () => {
    // Set up validateToken to return "false" (meaning the token is invalid)
    // "mockResolvedValue" simulates an invalid token by returning false
    validateToken.mockResolvedValue(false);

    // Pretend the URL contains an invalid token
    // "window.location.hash" sets a fake invalid token in the URL
    window.location.hash = '#access_token=invalid_token';

    // Wait for everything in this block to finish before moving on
    await act(async () => {
      // Render (show) the App component in a simulated browser screen
      render(<App />);
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
    // This mocks a valid token but an error fetching artist data
    validateToken.mockResolvedValue(true);
    fetchUserTopArtists.mockRejectedValue(new Error('Failed to load user data'));

    // Pretend the URL contains a valid token
    // Sets a fake valid token in the URL
    window.location.hash = '#access_token=valid_token';

    // Wait for everything in this block to finish before moving on
    await act(async () => {
      // Render (show) the App component in a simulated browser screen
      render(<App />);
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
