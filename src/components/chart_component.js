// Import necessary React hooks and chart components
import React, { useEffect, useRef } from 'react';  // useEffect for lifecycle management, useRef for keeping references
import { Bar } from 'react-chartjs-2';  // Bar chart component from Chart.js React wrapper
import {
  Chart as ChartJS,  // Main Chart.js class
  CategoryScale,     // Required for x-axis categories
  LinearScale,       // Required for y-axis numeric values
  BarElement,        // Required for rendering bars
  Title,            // Required for chart title
  Tooltip,          // Required for hover tooltips
  Legend            // Required for chart legend
} from 'chart.js';

// Import custom styles
import '../styles/chart_component.css';

// Register Chart.js components - this is required before using any Chart.js features
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Main component definition - takes data, click handler, and type as props
const ChartComponent = ({ data, onItemClick, type }) => {
  // Create a reference to store the chart instance - useful for cleanup
  const chartRef = useRef(null);  // Would log null initially, then the chart instance after rendering

  // Create labels for x-axis based on data type
  // If logged: ['Artist Name 1', 'Artist Name 2'] or ['Track Name 1 - Artist', 'Track Name 2 - Artist']
  const labels = data.items.map((item) => {
    if (type === 'artist') {
      return item.name;
    } else if (type === 'track') {
      return `${item.name} - ${item.artists.map(artist => artist.name).join(', ')}`;
    }
    return '';
  });

  // Configure the chart data structure
  // If logged: { labels: [...], datasets: [{ label: 'Popularity', data: [80, 75, 90...], ... }] }
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Popularity',
        data: data.items.map(item => item.popularity),  // Array of popularity scores
        backgroundColor: 'rgba(144,238,144,0.6)',  // Light green color for bars
        borderWidth: 1
      }
    ]
  };

  // Chart configuration options
  const options = {
    responsive: true,  // Chart resizes with container
    maintainAspectRatio: true,  // Maintain aspect ratio when resizing
    aspectRatio: 2,  // Width:height ratio
    plugins: {
      legend: {
        labels: {
          color: 'white'  // Legend text color
        }
      },
      tooltip: {
        // Tooltip styling
        titleColor: 'white',
        bodyColor: 'white',
        backgroundColor: 'rgba(0,0,0,0.8)',
        footerColor: 'white'
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'white',  // X-axis label color
          autoSkip: false,  // Don't skip labels
          maxRotation: 45,  // Maximum label rotation
          minRotation: 45   // Minimum label rotation
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)'  // X-axis grid line color
        }
      },
      y: {
        beginAtZero: true,  // Start y-axis at 0
        ticks: {
          color: 'white'  // Y-axis label color
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)'  // Y-axis grid line color
        }
      }
    },
    // Click handler for bar elements
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;  // Get clicked bar index
        const selectedItem = data.items[index];  // Get corresponding data item
        onItemClick(selectedItem);  // Call parent's click handler
      }
    }
  };

  // Cleanup effect - destroys chart when component unmounts
  useEffect(() => {
    const chart = chartRef.current;
    return () => {
      if (chart) {
        chart.destroy();  // Prevents memory leaks
      }
    };
  }, [data]);  // Re-run when data changes

  // Render the chart inside a container div
  return (
    <div className="chart-container">
      <Bar
        ref={chartRef}  // Attach the ref
        data={chartData}  // Pass in the data
        options={options}  // Pass in the options
      />
    </div>
  );
};

export default ChartComponent;  // Export for use in other components
