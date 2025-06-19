import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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

  if (loading) {
    return <div className="flex justify-center items-center h-full"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Available Books</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {books.map((book) => (
          <div key={book._id} className="card bg-base-100 shadow-xl">
            <figure className="px-10 pt-10">
              <img src={book.coverImage} alt={`Cover of ${book.title}`} className="rounded-xl h-64 w-full object-cover" />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title">{book.title}</h2>
              <p className="text-gray-500">by {book.author}</p>
              <p className="mt-2 text-sm">{book.description}</p>
              <div className="card-actions mt-4">
                {authUser && (
                  <button 
                    className={`btn ${
                      book.downloadRequests?.some(req => 
                        req.userId === authUser._id && req.status === 'approved'
                      ) ? 'btn-success' : 'btn-primary'
                    }`}
                    onClick={() => {
                      const userRequest = book.downloadRequests?.find(
                        req => req.userId === authUser._id
                      );
                      
                      if (userRequest?.status === 'approved') {
                        // Handle download
                        window.open(book.pdfUrl, '_blank');
                      } else {
                        handleRequestDownload(book._id);
                      }
                    }}
                    disabled={!authUser.isApproved || requesting[book._id]}
                  >
                    {requesting[book._id] ? (
                      <span className="loading loading-spinner"></span>
                    ) : book.downloadRequests?.some(req => 
                      req.userId === authUser._id && req.status === 'approved'
                    ) ? (
                      'Download Now'
                    ) : book.downloadRequests?.some(req => 
                      req.userId === authUser._id && req.status === 'pending'
                    ) ? (
                      'Request Pending'
                    ) : authUser.isApproved ? (
                      'Request Download'
                    ) : (
                      'Approval Pending'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
