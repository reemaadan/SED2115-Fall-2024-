// chart_component.js

import React, { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Import the CSS file
import '../styles/chart_component.css';

// Register the required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * ChartComponent renders a bar chart of the user's top artists or tracks.
 * @param {object} data The user data (top artists or top tracks) fetched from Spotify
 * @param {function} onItemClick Callback function when an item is clicked
 * @param {string} type The type of data ('artist' or 'track')
 */
const ChartComponent = ({ data, onItemClick, type }) => {
  // Reference for the chart instance
  const chartRef = useRef(null);

  // Prepare the labels and data based on the type
  const labels = data.items.map((item) => {
    if (type === 'artist') {
      return item.name;
    } else if (type === 'track') {
      return `${item.name} - ${item.artists.map(artist => artist.name).join(', ')}`;
    }
    return '';
  });

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Popularity',
        data: data.items.map(item => item.popularity),
        backgroundColor: 'rgba(144,238,144,0.6)', // Light green bars
        borderWidth: 1
      }
    ]
  };

  // Options for the chart
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2, // Adjust as needed
    plugins: {
      legend: {
        labels: {
          color: 'white'
        }
      },
      tooltip: {
        titleColor: 'white',
        bodyColor: 'white',
        backgroundColor: 'rgba(0,0,0,0.8)',
        footerColor: 'white'
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const selectedItem = data.items[index];
        onItemClick(selectedItem);
      }
    }
  };

  // Use useEffect to handle chart destruction
  useEffect(() => {
    const chart = chartRef.current;

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [data]);

  // Render the Bar chart component
  return (
    <div className="chart-container">
      <Bar
        ref={chartRef}
        data={chartData}
        options={options}
      />
    </div>
  );
};

export default ChartComponent;
