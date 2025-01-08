import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlusCircle, FaList, FaMapMarkedAlt } from 'react-icons/fa';

const HomePage = () => {
  const cards = [
    {
      title: 'Dodaj zgłoszenie',
      description: 'Zgłaszaj incydenty szybko i łatwo.',
      icon: <FaPlusCircle className="text-6xl text-blue-400 mb-6" />,
      link: '/report',
    },
    {
      title: 'Przeglądaj incydenty',
      description: 'Przeglądaj wszystkie zgłoszone incydenty.',
      icon: <FaList className="text-6xl text-green-400 mb-6" />,
      link: '/incidents',
    },
    {
      title: 'Mapa incydentów',
      description: 'Zobacz incydenty na mapie miasta.',
      icon: <FaMapMarkedAlt className="text-6xl text-purple-400 mb-6" />,
      link: '/map',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-12 font-inter">
      <section className="text-center">
        {/* Heading Section */}
        <h1 className="text-6xl font-extrabold tracking-tight mb-6 text-white">
          Witaj w <span className="text-blue-400">IncidentApp</span>
        </h1>
        <p className="text-lg md:text-xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Zgłaszaj incydenty, przeglądaj zgłoszenia i pomagaj w utrzymaniu
          bezpieczeństwa w swoim mieście.
        </p>

        {/* Card Section */}
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {cards.map((card, index) => (
            <Link
              to={card.link}
              key={index}
              className="transform transition duration-500 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex flex-col items-center p-8 rounded-lg bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-md border border-gray-700 shadow-md hover:bg-opacity-80">
                {card.icon}
                <h2 className="text-2xl font-semibold mb-4 text-white">
                  {card.title}
                </h2>
                <p className="text-center text-gray-300">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
