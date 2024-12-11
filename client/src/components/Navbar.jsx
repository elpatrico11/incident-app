// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../store/useAuthStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold">
              MyApp
            </Link>
          </div>
          {/* Menu */}
          <div className="hidden md:flex space-x-4">
            <Link to="/report" className="hover:text-gray-400">
              Dodaj zgłoszenie
            </Link>
            <Link to="/incidents" className="hover:text-gray-400">
              Przeglądaj incydenty
            </Link>
            <Link to="/map" className="hover:text-gray-400">
              Mapa incydentów
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="hover:text-gray-400">
                  Profil
                </Link>
                <button onClick={logout} className="hover:text-gray-400">
                  Wyloguj się
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-gray-400">
                  Logowanie
                </Link>
                <Link to="/register" className="hover:text-gray-400">
                  Rejestracja
                </Link>
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Menu>
              {({ open }) => (
                <>
                  <Menu.Button className="text-gray-400 hover:text-white focus:outline-none">
                    {open ? (
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    )}
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/report"
                          className={`block px-4 py-2 text-sm ${
                            active ? 'bg-gray-700' : ''
                          }`}
                        >
                          Dodaj zgłoszenie
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/incidents"
                          className={`block px-4 py-2 text-sm ${
                            active ? 'bg-gray-700' : ''
                          }`}
                        >
                          Przeglądaj incydenty
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/map"
                          className={`block px-4 py-2 text-sm ${
                            active ? 'bg-gray-700' : ''
                          }`}
                        >
                          Mapa incydentów
                        </Link>
                      )}
                    </Menu.Item>
                    {user ? (
                      <>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`block px-4 py-2 text-sm ${
                                active ? 'bg-gray-700' : ''
                              }`}
                            >
                              Profil
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={`block w-full text-left px-4 py-2 text-sm ${
                                active ? 'bg-gray-700' : ''
                              }`}
                            >
                              Wyloguj się
                            </button>
                          )}
                        </Menu.Item>
                      </>
                    ) : (
                      <>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/login"
                              className={`block px-4 py-2 text-sm ${
                                active ? 'bg-gray-700' : ''
                              }`}
                            >
                              Logowanie
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/register"
                              className={`block px-4 py-2 text-sm ${
                                active ? 'bg-gray-700' : ''
                              }`}
                            >
                              Rejestracja
                            </Link>
                          )}
                        </Menu.Item>
                      </>
                    )}
                  </Menu.Items>
                </>
              )}
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
