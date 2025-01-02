// Boundary GeoJSON URL
export const BOUNDARY_GEOJSON_URL =
  "/assets/geo/bielsko-biala-boundary.geojson";

// Days of the week options
export const DNI_TYGODNIA_OPTIONS = [
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
  "Niedziela",
];

// Time of day options
export const PORA_DNIA_OPTIONS = ["Rano", "Popołudnie", "Wieczór", "Noc"];

// Image compression options
export const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/png", // explicitly set the output format
  initialQuality: 0.8,
};
