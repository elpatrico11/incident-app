const axios = require("axios");

const verifyRecaptcha = async (token) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "reCAPTCHA secret key not defined in environment variables"
    );
  }

  const params = new URLSearchParams();
  params.append("secret", secretKey);
  params.append("response", token);

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      params,
      {
        timeout: 5000,
      }
    );
    return response.data.success;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    throw new Error("Failed to verify reCAPTCHA");
  }
};

module.exports = {
  verifyRecaptcha,
};
