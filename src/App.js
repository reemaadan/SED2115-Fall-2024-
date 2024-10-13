import React, { useState, useEffect } from 'react'; // import React and hooks for state and side-effects
import { getAuthUrl, fetchUserData } from './spotify_service'; // imports the functions from spotify_service.js
import ChartComponent from './chart_component'; // this imports the chart component that will display the data

// hooks will be useful to hook into other pieces of data, like the api for a login
const clientId = 'e2d1da0d23e74e9797ca7ec1f04ee0e8';
const clientSecret = 'clientSecret'

function App() {
  // State variables to store the access component/token and users data
  const [token, setToken] = useState(null); // 'token' will store the Spotify access token
  const [userData, setUserData] = useState(null); // 'userData' will store the user's top artist data

  const fill = async () => {
    try {
      const res = await fetch('https://api.spotify.com/v1/artists/'+ {clientId}  + ':' + {clientSecret}+ '/0TnOYISbd1XYRBk9myaseg ');
      console.log(res.json)
     } catch (err) {
       console.log(err)
     }
  }

  // useEffect (state) for grabbing access token from URL hash when the page loads
  useEffect(() => {
    fill()
    // When Spotify redirects back, the token is part of the URL (after '#')
    const hash = window.location.hash; // Get everything after the hash ('#') in the URL
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // breaks down the parameters in the URL
      const accessToken = params.get('access_token'); // takes the 'access_token' out from the URL
      setToken(accessToken); // ask why we do this to knox -- maybe its a state thing
    }
  }, []); // ensures this runs only once when the component loads

  // useEffect to fetch user data from Spotify API after the token is set
  useEffect(() => {
    if (token) {
      // use token to fetch data from spotify API
      fetchUserData(token).then((response) => {
        console.log(response.data) //got  a response, but the response.data seems to be null/empty
        console.log("i got here")
        setUserData(response.data); // saves the API response (user's top artists) to a state (stays the same)
        console.log(response.data)
      });
    }
  }, [token]); // changes when/if token will change

  // create a function to handle user login. redirects to spotify authorization page.
  const handleLogin = () => {
    window.location.href = getAuthUrl(); // redirects the user to spotify login page to authorize the app
  };

  // displays/renders the user interface (graph)
  return (

    <div>
      {/* show login button if the user hasn't logged in */}
      {!token && <button onClick={handleLogin}>Login with Spotify</button>}

      {/* once we have user data, display the list of top artists */}
      {userData && (
        <div>
          <h1> Data Spot</h1>
          <p>Welcome to Data Spot, where you can see all the data from your fav artists</p>
          <h2>Your Top Artists</h2>
          {/* renders the chart_component and pass the userData as a prop */}
          <ChartComponent userData={userData} />
        </div>
      )}
    </div>
  );
}

export default App;
