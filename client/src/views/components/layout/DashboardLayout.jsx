import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { UserCircle, X, Menu as MenuIcon } from 'lucide-react';
import useAuthStore from '../../../models/stores/useAuthStore';

const DashboardLayout = ({ children }) => {
  const { user, logout, notifications } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Number of unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/', icon: '🏠', label: 'Dashboard' },
    { path: '/report', icon: '📝', label: 'Dodaj zgłoszenie' },
    { path: '/incidents', icon: '📋', label: 'Przeglądaj incydenty' },
    { path: '/map', icon: '🗺️', label: 'Mapa incydentów' },
    { path: '/my-incidents', icon: '📁', label: 'Moje Zgłoszenia', protected: true },
  ];

  const adminItems = [
    { path: '/admin/users', icon: '👥', label: 'Użytkownicy' },
    { path: '/admin/incidents', icon: '⚠️', label: 'Zarządzanie Incydentami' },
    { path: '/admin/reports', icon: '📊', label: 'Raporty' },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out z-30 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo area */}
        <div className="h-14 flex items-center justify-between px-6 bg-gray-900 border-b border-gray-700">
          <Link to="/" className="text-xl font-bold text-white">
            IncidentApp
          </Link>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-300 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="py-4">
            <div className="px-3 space-y-1">
              {menuItems.map((item) => (
                (!item.protected || user) && (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActivePath(item.path)
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              ))}

              {user?.role === 'admin' && (
                <div className="pt-4">
                  <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase">
                    Admin
                  </div>
                  {adminItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActivePath(item.path)
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-300 hover:text-white"
          >
            <MenuIcon size={24} />
          </button>
          
          <div className="flex-1"></div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="relative flex items-center text-sm text-gray-300 hover:text-white">
                  {/* If there are unread notifications, show a red badge */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                      {unreadCount}
                    </span>
                  )}
                  <UserCircle className="w-8 h-8 mr-2" />
                  <span>
                    {user.firstName} {user.lastName}
                  </span>
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                  {/* Direct link to notifications (tab=2 on ProfilePage) */}
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile?tab=2"
                        className={`block px-4 py-2 text-sm text-gray-300 ${
                          active ? 'bg-gray-700' : ''
                        }`}
                      >
                        Powiadomienia
                      </Link>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={`block px-4 py-2 text-sm text-gray-300 ${
                          active ? 'bg-gray-700' : ''
                        }`}
                      >
                        Profil użytkownika
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-300 ${
                          active ? 'bg-gray-700' : ''
                        }`}
                      >
                        Wyloguj się
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="text-sm text-gray-300 hover:text-white">
                  Logowanie
                </Link>
                <Link to="/register" className="text-sm text-gray-300 hover:text-white">
                  Rejestracja
                </Link>
                <Link to="/contact" className="text-sm text-gray-300 hover:text-white">
                  Kontakt
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
