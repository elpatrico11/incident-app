export const SORT_OPTIONS = [
  { value: "date_desc", label: "Data (najnowsze)" },
  { value: "date_asc", label: "Data (najstarsze)" },
  { value: "category_asc", label: "Kategoria (A-Z)" },
  { value: "category_desc", label: "Kategoria (Z-A)" },
];

export const STATUS_COLORS = {
  nowe: "bg-blue-500",
  weryfikacja: "bg-yellow-500",
  potwierdzone: "bg-green-500",
  wstrzymane: "bg-gray-500",
  eskalowane: "bg-orange-500",
  rozwiązane: "bg-teal-500",
  nierozwiązane: "bg-red-500",
  zamknięte: "bg-purple-500",
  odrzucone: "bg-pink-500",
  default: "bg-gray-500",
};

export const STATUS_OPTIONS = [
  "Nowe",
  "Weryfikacja",
  "Potwierdzone",
  "Wstrzymane",
  "Eskalowane",
  "Rozwiązane",
  "Nierozwiązane",
  "Zamknięte",
  "Odrzucone",
];

export const BOUNDARY_GEOJSON_URL =
  "/assets/geo/bielsko-biala-boundary.geojson";

export const DNI_TYGODNIA_OPTIONS = [
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
  "Niedziela",
];

export const PORA_DNIA_OPTIONS = ["Rano", "Popołudnie", "Wieczór", "Noc"];
