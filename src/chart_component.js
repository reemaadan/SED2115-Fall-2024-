import React from 'react'; // Import React
import { Bar } from 'react-chartjs-2'; // Import Bar chart from react-chartjs-2

/**
 * ChartComponent renders a bar chart of the user's top artists and their popularity.
 * @param {object} userData The user data (top artists) fetched from Spotify
 */
const ChartComponent = ({ userData }) => {
  // Prepare the data for the bar chart
  const chartData = {
    // 'labels' are the names of the artists. We map over 'userData.items' to extract the artist names
    labels: userData.items.map(artist => artist.name),
    
    // 'datasets' contains the actual data for the chart (popularity scores of the artists)
    datasets: [
      {
        label: 'Popularity', // This will be the label for the dataset on the chart
        data: userData.items.map(artist => artist.popularity), // The popularity data for each artist
        backgroundColor: 'rgba(75,192,192,0.6)', // Bar colors (light greenish blue)
        borderWidth: 1 // Width of the bar borders
      }
    ]
  };

  // Options for the chart to define the behavior of axes, grid lines, etc.
  const options = {
    scales: {
      y: {
        beginAtZero: true // Start the y-axis at zero to make the chart easier to read
      }
    }
  };

  // Render the Bar chart component from react-chartjs-2, passing 'chartData' and 'options'
  return <Bar data={chartData} options={options} />;
};

export default ChartComponent;
  