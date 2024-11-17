// chart_component.js

import React, { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,     // 'linear' scale
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

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
        backgroundColor: 'rgba(75,192,192,0.6)',
        borderWidth: 1
      }
    ]
  };

  // Options for the chart to define the behavior of axes, grid lines, etc.
  const options = {
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const selectedItem = data.items[index];
        onItemClick(selectedItem);
      }
    },
    scales: {
      y: {
        beginAtZero: true
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

  // Render the Bar chart component from react-chartjs-2, passing 'chartData' and 'options'
  return <Bar ref={chartRef} data={chartData} options={options} />;
};

export default ChartComponent;
