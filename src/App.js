import logo from './logo.svg';
import './App.css';

function App() {
  // State variables to store the access token and user data
  const [token, setToken] = useState(null); // 'token' will store the Spotify access token
  const [userData, setUserData] = useState(null); // 'userData' will store the user's top artist data

  // useEffect to extract access token from URL hash when the page loads
  useEffect(() => {
    // When Spotify redirects back, the token is part of the URL (after '#')
    const hash = window.location.hash; // Get everything after the hash ('#') in the URL
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // Parse the parameters in the URL
      const accessToken = params.get('access_token'); // Extract the 'access_token' from the URL
      setToken(accessToken); // Save the token to state
    }
  }, []); // Empty dependency array ensures this runs only once when the component loads

  // useEffect to fetch user data from Spotify API after the token is set
  useEffect(() => {
    if (token) {
      // If there's a token available, use it to fetch data from the Spotify API
      fetchUserData(token).then((response) => {
        setUserData(response.data); // Save the API response (user's top artists) to state
      });
    }
  }, [token]); // Runs this effect every time 'token' changes

  // Function to handle user login. Redirects to Spotify authorization page.
  const handleLogin = () => {
    window.location.href = getAuthUrl(); // Redirect user to Spotify login page to authorize the app
  };

  // Render the user interface
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
