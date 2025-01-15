import { useState } from "react";

const useContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Coś poszło nie tak.");
      }

      setStatus({ loading: false, error: "", success: data.message });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  };

  return {
    formData,
    status,
    handleChange,
    handleSubmit,
  };
};

export default useContact;
