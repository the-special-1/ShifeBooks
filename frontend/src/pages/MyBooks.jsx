import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MyBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }

    const fetchMyBooks = async () => {
      try {
        const res = await axios.get('/api/books/my-books');
        setBooks(res.data);
      } catch (error) {
        toast.error('Failed to fetch your books');
      } finally {
        setLoading(false);
      }
    };

    fetchMyBooks();
  }, [authUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Approved Books</h1>
      
      {books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg">You don't have any approved books yet.</p>
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-primary mt-4"
          >
            Browse Books
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book._id} className="card bg-base-100 shadow-xl">
              <figure className="px-4 pt-4">
                <img 
                  src={book.coverImage} 
                  alt={`Cover of ${book.title}`} 
                  className="rounded-xl h-64 w-full object-cover" 
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{book.title}</h2>
                <p className="text-gray-600">By {book.author}</p>
                <p className="mt-2">{book.description}</p>
                <div className="card-actions justify-end mt-4">
                  <a 
                    href={book.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    download
                  >
                    Download Book
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBooks;
