import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, MenuItem, MenuItems, MenuButton } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../store/useAuthStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold">
              MyApp
            </Link>
          </div>
          <div className="hidden md:flex space-x-4">
            <Link to="/report" className="hover:text-gray-400">Dodaj zgłoszenie</Link>
            <Link to="/incidents" className="hover:text-gray-400">Przeglądaj incydenty</Link>
            <Link to="/map" className="hover:text-gray-400">Mapa incydentów</Link>
            {user && (
              <>
                <Link to="/my-incidents" className="hover:text-gray-400">Moje Zgłoszenia</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="hover:text-gray-400">Panel Admina</Link>
                )}
                <Link to="/profile" className="hover:text-gray-400">Profil</Link>
                <button onClick={logout} className="hover:text-gray-400">Wyloguj się</button>
              </>
            )}
            {!user && (
              <>
                <Link to="/login" className="hover:text-gray-400">Logowanie</Link>
                <Link to="/register" className="hover:text-gray-400">Rejestracja</Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <Menu>
              {({ open }) => (
                <>
                  <MenuButton className="text-gray-400 hover:text-white focus:outline-none">
                    {open ? (
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    )}
                  </MenuButton>
                  <MenuItems className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1">
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          to="/report"
                          className={`block px-4 py-2 text-sm ${active ? 'bg-gray-700' : ''}`}
                        >
                          Dodaj zgłoszenie
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          to="/incidents"
                          className={`block px-4 py-2 text-sm ${active ? 'bg-gray-700' : ''}`}
                        >
                          Przeglądaj incydenty
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <Link
                          to="/map"
                          className={`block px-4 py-2 text-sm ${active ? 'bg-gray-700' : ''}`}
                        >
                          Mapa incydentów
                        </Link>
                      )}
                    </MenuItem>
                    {user ? (
                      <>
                        <MenuItem>
                          {({ active }) => (
                            <Link
                              to="/my-incidents"
                              className={`block px-4 py-2 text-sm ${active ? 'bg-gray-700' : ''}`}
                            >
                              Moje Zgłoszenia
                            </Link>
                          )}
                        </MenuItem>
                        {user.role === 'admin' && (
                          <MenuItem>
                            {({ active }) => (
                              <Link
                                to="/admin"
                                className={`block px-4 py-2 text-sm ${active ? 'bg-gray-700' : ''}`}
                              >
                                Panel Admina
                              </Link>
                            )}
                          </MenuItem>
                        )}
                        <MenuItem>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`block px-4 py-2 text-sm ${active ? 'bg-gray-700' : ''}`}
                            >
                              Profil
                            </Link>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-700' : ''}`}
                            >
                              Wyloguj się
                            </button>
                          )}
                        </MenuItem>
                      </>
                    ) : (
                      <>
                        <MenuItem>
                          {({ active }) => (
                            <Link
                              to="/login"
                              className={`block px-4 py-2 text-sm ${active ? 'bg-gray-700' : ''}`}
                            >
                              Logowanie
                            </Link>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <Link
                              to="/register"
                              className={`block px-4 py-2 text-sm ${active ? 'bg-gray-700' : ''}`}
                            >
                              Rejestracja
                            </Link>
                          )}
                        </MenuItem>
                      </>
                    )}
                  </MenuItems>
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
