import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiBook, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiLayout, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const { authUser, setAuthUser } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setAuthUser(null);
      setIsOpen(false);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Logout failed');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <FiHome className="mr-2" /> },
    ...(authUser?.role === 'admin' 
      ? [{ to: '/admin', label: 'Admin', icon: <FiLayout className="mr-2" /> }] 
      : []),
    ...(authUser ? [{ to: '/my-books', label: 'My Books', icon: <FiBook className="mr-2" /> }] : []),
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      scrolled ? 'bg-black/70 backdrop-blur-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <FiBook className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              ShifeBooks
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === link.to
                    ? 'text-white bg-gradient-to-r from-cyan-500/20 to-blue-500/20'
                    : 'text-black hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center">
                  {link.icon}
                  {link.label}
                </span>
              </Link>
            ))}

            {authUser ? (
              <div className="relative group ml-2">
                <div className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all">
                  <span className="text-cyan-300">{authUser.fullName}</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white">
                    {authUser.fullName?.charAt(0) || <FiUser />}
                  </div>
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-xl py-1 z-50 hidden group-hover:block">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-cyan-100 hover:bg-cyan-800/50 transition-colors flex items-center space-x-2"
                  >
                    <FiLogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-cyan-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="ml-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-cyan-300 hover:text-white focus:outline-none"
            >
              {isOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 bg-gray-900/95 backdrop-blur-md rounded-lg p-4"
            >
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      location.pathname === link.to
                        ? 'text-white bg-cyan-500/20'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center">
                      {link.icon}
                      {link.label}
                    </span>
                  </Link>
                ))}

                {authUser ? (
                  <>
                    <div className="border-t border-gray-700 my-2"></div>
                    <div className="px-4 py-2 text-cyan-300 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white mr-2">
                        {authUser.fullName?.charAt(0) || <FiUser />}
                      </div>
                      {authUser.fullName}
                    </div>
                    <Link to="/admin" className={location.pathname === '/admin' ? 'text-cyan-400' : ''}>Admin</Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-cyan-300 hover:bg-cyan-800/30 rounded-lg transition-colors flex items-center"
                    >
                      <FiLogOut className="mr-2" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-cyan-300 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
