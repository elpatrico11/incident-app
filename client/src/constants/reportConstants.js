export const CHART_COLORS = [
  "#68d391", // Green
  "#63b3ed", // Blue
  "#f6ad55", // Orange
  "#ed64a6", // Pink
  "#fc8181", // Red
  "#9f7aea", // Purple
  "#38b2ac", // Teal
  "#f56565", // Light Red
  "#ed8936", // Dark Orange
  "#D69E2E", // Yellow
  "#A0AEC0", // Gray
  "#7F9CF5", // Indigo
];

export const DEFAULT_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top",
      labels: {
        color: "#a0aec0",
      },
    },
    title: {
      display: true,
      text: "",
      color: "#ffffff",
      font: { size: 16 },
    },
    tooltip: {
      backgroundColor: "#2d3748",
      titleColor: "#a0aec0",
      bodyColor: "#a0aec0",
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        color: "#4a5568",
      },
      ticks: { color: "#ffffff" },
      title: {
        display: true,
        text: "",
        color: "#ffffff",
        font: { size: 14 },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "#4a5568",
      },
      ticks: {
        color: "#ffffff",
        stepSize: 1,
        precision: 0,
      },
      title: {
        display: true,
        text: "",
        color: "#ffffff",
        font: { size: 14 },
      },
    },
  },
};
