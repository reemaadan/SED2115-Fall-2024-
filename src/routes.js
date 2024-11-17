//import App from './App';
//import SpotifyServicePage from './components/SpotifyServicePage';
/*
export const routes = [
  { path: '/', exact: true, component: DashboardPage },
  { path: '/search', component: SearchPage },
  { path: '/profile', component: ProfilePage },
  { path: '/spotify-service', component: SpotifyServicePage },
  { path: '/artist-rankings', component: InteractiveArtistRankingsPage },
];*/


import App from './App';
import UserProfilePage from './components/UserProfilePage';  


import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },

  {
    path: '/profile',
    element: <UserProfilePage />
  },

]);
