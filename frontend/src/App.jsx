import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import MyBooks from './pages/MyBooks';
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

function App() {
  const { authUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-violet-400 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-violet-200 text-lg font-light">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 animate-fadeIn">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={!authUser ? <Login /> : <Navigate to='/' />} />
          <Route path='/signup' element={!authUser ? <SignUp /> : <Navigate to='/' />} />
          <Route 
            path='/admin-dashboard' 
            element={authUser?.role === 'admin' ? <AdminDashboard /> : <Navigate to='/' />} 
          />
          <Route 
            path='/my-books' 
            element={authUser ? <MyBooks /> : <Navigate to='/login' />} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
