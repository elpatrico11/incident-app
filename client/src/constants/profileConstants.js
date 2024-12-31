/**
 * Validation messages for forms.
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: "Wszystkie pola są wymagane.",
  INVALID_EMAIL: "Nieprawidłowy adres email.",
  PASSWORD_MIN_LENGTH: "Nowe hasło musi mieć co najmniej 6 znaków.",
  PASSWORD_MISMATCH: "Nowe hasła nie są zgodne.",
  PASSWORD_SAME_AS_OLD: "Nowe hasło nie może być takie samo jak stare hasło.",
};

/**
 * User roles.
 */
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};

/**
 * Sort options for user lists.
 */
export const SORT_OPTIONS = [
  { value: "firstName_asc", label: "Imię (A-Z)" },
  { value: "firstName_desc", label: "Imię (Z-A)" },
  { value: "lastName_asc", label: "Nazwisko (A-Z)" },
  { value: "lastName_desc", label: "Nazwisko (Z-A)" },
  { value: "email_asc", label: "Email (A-Z)" },
  { value: "email_desc", label: "Email (Z-A)" },
  { value: "role_asc", label: "Rola (A-Z)" },
  { value: "role_desc", label: "Rola (Z-A)" },
];

/**
 * Status colors based on user roles.
 */
export const STATUS_COLORS = {
  user: "bg-blue-500",
  admin: "bg-green-500",
  default: "bg-gray-500",
};
