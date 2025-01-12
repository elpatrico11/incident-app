export const validateEmail = (email) => {
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Wyrażenie regularne wymaga:
  // - przynajmniej jednej małej litery (?=.*[a-z])
  // - przynajmniej jednej dużej litery (?=.*[A-Z])
  // - przynajmniej jednej cyfry (?=.*\d)
  // oraz minimalnie 12 znaków spośród dozwolonych:
  // Litery (bez polskich znaków), cyfry oraz następujące znaki specjalne:
  // [ ] ! @ # $ % ^ & * ( ) _ + = { } ; ' : " \ | , . < > / ? -
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[[\]A-Za-z\d!@#$%^&*()_+={};':"\\|,.<>/?-]{12,}$/;
  return passwordRegex.test(password);
};
