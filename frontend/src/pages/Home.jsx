import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiClock, FiCheckCircle, FiSearch } from 'react-icons/fi';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState({});
  const { authUser } = useAuth();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get('/api/books');
        setBooks(res.data);
      } catch (error) {
        toast.error('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleRequestDownload = async (bookId) => {
    if (!authUser) {
      toast.error('You must be logged in to request a download.');
      return;
    }

    setRequesting(prev => ({ ...prev, [bookId]: true }));

    try {
      const response = await axios.post(`/api/books/${bookId}/request-download`);
      
      // Update the book's download requests in the local state
      setBooks(prevBooks => 
        prevBooks.map(book => {
          if (book._id === bookId) {
            const hasExistingRequest = book.downloadRequests?.some(
              req => req.userId === authUser._id
            );
            
            const newRequest = {
              userId: authUser._id,
              status: response.data.status,
              _id: response.data.requestId || Date.now().toString()
            };
            
            return {
              ...book,
              downloadRequests: hasExistingRequest 
                ? book.downloadRequests.map(req => 
                    req.userId === authUser._id ? { ...req, ...newRequest } : req
                  )
                : [...(book.downloadRequests || []), newRequest]
            };
          }
          return book;
        })
      );
      
      toast.success('Download request submitted for approval');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send request');
    } finally {
      setRequesting(prev => ({ ...prev, [bookId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
            Discover Your Next Read
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore our curated collection of e-books. Download your favorites instantly after approval.
          </p>
          
          <div className="relative max-w-2xl mx-auto mt-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search books by title or author..."
              className="block w-full pl-10 pr-3 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              // Add search functionality here
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4">
                <div className="h-6 w-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-400">Loading books...</p>
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Books Available</h2>
            <p className="text-gray-400 mb-6">Our collection is currently empty. Check back soon for new additions!</p>
            {authUser?.isAdmin && (
              <Link 
                to="/admin" 
                className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                <span>Add New Book</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </Link>
            )}
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <motion.div 
                  key={book._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group relative"
                >
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300 h-full flex flex-col">
                    <div className="relative overflow-hidden">
                      <img 
                        src={book.coverImage || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'} 
                        alt={book.title}
                        className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div className="text-sm text-gray-300">
                          {book.genre && (
                            <span className="inline-block bg-cyan-500/20 text-cyan-400 text-xs px-2.5 py-1 rounded-full mr-2 mb-2">
                              {book.genre}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{book.title}</h3>
                        <p className="text-cyan-400 mb-3">{book.author}</p>
                        {book.description && (
                          <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                            {book.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-700/50">
                        {!authUser ? (
                          <Link 
                            to="/login" 
                            className="w-full block text-center px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02]"
                          >
                            Login to Download
                          </Link>
                        ) : book.downloadRequests?.some(req => 
                          req.userId === authUser._id && req.status === 'approved'
                        ) ? (
                          <a
                            href={book.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02]"
                          >
                            <FiDownload className="mr-2" />
                            <span>Download Now</span>
                          </a>
                        ) : book.downloadRequests?.some(req => 
                          req.userId === authUser._id && req.status === 'pending'
                        ) ? (
                          <button 
                            disabled
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 cursor-not-allowed"
                          >
                            <FiClock className="mr-2" />
                            <span>Pending Approval</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleRequestDownload(book._id)}
                            disabled={requesting[book._id]}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {requesting[book._id] ? (
                              <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                              <>
                                <FiDownload className="mr-2" />
                                <span>Request Download</span>
                              </>
                            )}
                          </button>
                        )}
                        
                        {book.downloadCount > 0 && (
                          <div className="mt-2 text-xs text-gray-400 flex items-center justify-center">
                            <FiCheckCircle className="mr-1 text-emerald-400" />
                            {book.downloadCount} downloads
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default Home;
