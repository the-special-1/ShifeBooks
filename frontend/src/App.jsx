import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import MyBooks from './pages/MyBooks';
import ForgotPassword from './pages/ForgotPassword';
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

function App() {
  const { authUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={!authUser ? <Login /> : <Navigate to='/' />} />
          <Route path='/signup' element={!authUser ? <SignUp /> : <Navigate to='/' />} />
          <Route path='/my-books' element={authUser ? <MyBooks /> : <Navigate to='/login' />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route 
            path='/admin' 
            element={authUser?.role === 'admin' ? <AdminDashboard /> : <Navigate to='/' />} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
