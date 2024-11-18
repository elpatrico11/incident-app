import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, MenuItem, MenuItems, MenuButton } from '@headlessui/react';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold">
              IncidentApp
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
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Menu>
              {({ open }) => (
                <>
                  <MenuButton className="text-gray-400 hover:text-white focus:outline-none">
                    {open ? (
                      <FaTimes className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <FaBars className="h-6 w-6" aria-hidden="true" />
                    )}
                  </MenuButton>
                  <MenuItems className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1">
                    <MenuItem>
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
                    </MenuItem>
                    <MenuItem>
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
                    </MenuItem>
                    <MenuItem>
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
                    </MenuItem>
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
