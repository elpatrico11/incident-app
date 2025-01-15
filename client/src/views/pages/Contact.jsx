import React from 'react';
import useContact from '../../controllers/hooks/useContact';

const Contact = () => {
  const { formData, status, handleChange, handleSubmit } = useContact();

  return (
    <div className="w-full p-8 md:p-12 lg:p-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-white">Kontakt</h2>
        
        {status.error && (
          <div className="mb-6 p-4 bg-red-500 text-white rounded">
            {status.error}
          </div>
        )}
        {status.success && (
          <div className="mb-6 p-4 bg-green-500 text-white rounded">
            {status.success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl">
          <div className="mb-6">
            <label className="block text-gray-300 text-lg mb-2" htmlFor="name">
              Imię:
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Twoje imię"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-lg mb-2" htmlFor="email">
              Adres email:
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="example@domain.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-lg mb-2" htmlFor="subject">
              Temat:
            </label>
            <input
              type="text"
              name="subject"
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Temat wiadomości"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-lg mb-2" htmlFor="message">
              Wiadomość:
            </label>
            <textarea
              name="message"
              id="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Wpisz treść wiadomości"
              rows="8"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className="w-full md:w-auto md:min-w-[200px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-300"
          >
            {status.loading ? 'Wysyłanie...' : 'Wyślij'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;