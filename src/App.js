import React, { useState, useEffect } from 'react'; // import React and hooks for state and side-effects
import { getAuthUrl, fetchUserData } from './spotify_service'; // imports the functions from spotify_service.js
import ChartComponent from './chart_component'; // this imports the chart component that will display the data
import axios from 'axios';

// hooks will be useful to hook into other pieces of data, like the api for a login
const clientId = '6f0680f2317545fd8d2a7bd3263b4d51';
const clientSecret = '859ff11f4dd24d9fb92fdebeae39ef2a'

function App() {
  // State variables to store the access component/token and users data
  const [token, setToken] = useState(null); // 'token' will store the Spotify access token
  const [userData, setUserData] = useState(null); // 'userData' will store the user's top artist data

  const fill = async () => {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);

      const response = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: params
      });

     let data = response.data;
     console.log('data here', data);
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
    window.location.href = getAuthUrl(clientId); // redirects the user to spotify login page to authorize the app
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
