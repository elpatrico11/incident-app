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

export const STATUS_COLORS = {
  user: "bg-blue-500",
  admin: "bg-green-500",
  default: "bg-gray-500",
};

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};

/**
 * Validation messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: "To pole jest wymagane.",
  INVALID_EMAIL: "Nieprawidłowy adres email.",
};
