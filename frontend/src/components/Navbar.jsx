import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const Navbar = () => {
  const { authUser, setAuthUser } = useAuth();

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setAuthUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Logout failed');
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          E-Book Store
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1 items-center">
          <li>
            <Link to="/">Home</Link>
          </li>
          {authUser ? (
            <>
              {authUser.role === 'admin' && (
                <li>
                  <Link to="/admin-dashboard">Admin Dashboard</Link>
                </li>
              )}
              <li>
                <Link to="/my-books">My Books</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
              </li>
              <li className="ml-4">
                <span className="font-semibold">Welcome, {authUser.fullName}</span>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
