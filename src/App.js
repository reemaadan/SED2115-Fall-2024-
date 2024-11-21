import React, { useState, useEffect } from "react";
import {
 BrowserRouter as Router,
 Routes,
 Route,
 Navigate,
} from "react-router-dom";
import ChartComponent from "./components/chart_component";
import TopTracksList from './components/TopTracksList';
import InteractiveArtistRankings from "./components/InteractiveArtistRankings";
import SpotifyProfilePage from "./UserProfilePage";
import {
 getAuthUrl,
 validateToken,
 fetchUserTopArtists,
 fetchUserTopTracks,
 getTokenFromUrl,
} from "./components/auth/spotify_service";

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
console.log('Client ID:', process.env.REACT_APP_CLIENT_ID);

function App() {
 const [token, setToken] = useState(null);
 const [userData, setUserData] = useState({ topArtists: null, topTracks: null });
 const [error, setError] = useState(null);
 const [selectedArtist, setSelectedArtist] = useState(null);
 const [isLoading, setIsLoading] = useState(true);

 const loadUserData = async (accessToken) => {
   setError(null);
   try {
     const [artistsData, tracksData] = await Promise.all([
       fetchUserTopArtists(accessToken),
       fetchUserTopTracks(accessToken)
     ]);
     setUserData({ topArtists: artistsData, topTracks: tracksData });
   } catch (err) {
     setError(err.message || "Failed to load user data");
     setToken(null);
   }
 };

 useEffect(() => {
   const initializeAuth = async () => {
     try {
       const accessToken = getTokenFromUrl();
       console.log("Access Token:", accessToken);
       if (accessToken) {
         const isValid = await validateToken(accessToken);
         if (isValid) {
           setToken(accessToken);
           localStorage.setItem("spotify_access_token", accessToken);
         } else {
           setError("Invalid access token received");
         }
       } else {
         const storedToken = localStorage.getItem("spotify_access_token");
         if (storedToken) {
           const isValid = await validateToken(storedToken);
           if (isValid) {
             setToken(storedToken);
           } else {
             localStorage.removeItem("spotify_access_token");
           }
         }
       }
     } catch (err) {
       setError("Failed to initialize authentication");
       console.error("Auth initialization error:", err);
     } finally {
       setIsLoading(false);
     }
   };

   initializeAuth();
 }, []);

 useEffect(() => {
   if (token) {
     loadUserData(token);
   }
 }, [token]);

 const handleLogin = () => {
   window.location.href = getAuthUrl(CLIENT_ID);
 };

 const handleLogout = () => {
   localStorage.removeItem("spotify_access_token");
   setToken(null);
   setUserData({ topArtists: null, topTracks: null });
 };

 const handleArtistClick = (artistData) => {
   setSelectedArtist(artistData);
 };

 const handleTrackClick = (trackData) => {
   console.log('Track clicked:', trackData);
 };

 const ProtectedRoute = ({ children }) => {
   if (!token) {
     return <Navigate to="/" replace />;
   }
   return children;
 };

 if (isLoading) {
   return (
     <div className="container mx-auto p-4">
       <div className="text-center">Loading...</div>
     </div>
   );
 }

 if (error) {
   return (
     <div className="container mx-auto p-4">
       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
         {error}
       </div>
       <button
         onClick={handleLogin}
         className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
       >
         Login Again
       </button>
     </div>
   );
 }

 return (
   <Router>
     <Routes>
       <Route
         path="/"
         element={
           <div className="container mx-auto p-4">
             {!token && (
               <button
                 onClick={handleLogin}
                 className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
               >
                 Login with Spotify
               </button>
             )}
             {userData.topArtists && (
               <div className="mt-8">
                 <div className="flex justify-between items-center mb-6">
                   <div>
                     <h1 className="text-3xl font-bold mb-2">Data Spot</h1>
                     <p className="mb-6">
                       Welcome to Data Spot, where you can see all the data
                       from your favorite artists and tracks
                     </p>
                   </div>
                   {token && (
                     <button
                       onClick={handleLogout}
                       className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                     >
                       Logout
                     </button>
                   )}
                 </div>
                 <h2 className="text-2xl font-semibold mb-4">
                   Your Top Artists
                 </h2>

                 <div className="mb-8">
                   <div className="bg-white p-6 rounded-lg shadow-lg">
                     <h3 className="text-xl font-semibold mb-4">
                       Artist Popularity Chart
                     </h3>
                     <ChartComponent 
                       data={userData.topArtists}
                       onItemClick={handleArtistClick}
                       type="artist"
                     />
                   </div>
                 </div>

                 {userData.topTracks && (
                   <div className="mt-8">
                     <h2 className="text-2xl font-semibold mb-4">Your Top Tracks</h2>
                     <TopTracksList
                       data={userData.topTracks}
                       onTrackClick={handleTrackClick}
                     />
                   </div>
                 )}

                 {token && (
                   <button
                     onClick={() => (window.location.href = "/profile")}
                     className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-full transition-colors"
                   >
                     View Profile
                   </button>
                 )}
               </div>
             )}
           </div>
         }
       />
       <Route
         path="/profile"
         element={
           <ProtectedRoute>
             <SpotifyProfilePage accessToken={token} />
           </ProtectedRoute>
         }
       />
     </Routes>
   </Router>
 );
}

export default App;