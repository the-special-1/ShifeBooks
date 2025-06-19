import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await axios.put(`/api/auth/reset-password/${token}`, { password });
      toast.success('Password has been reset successfully. Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="card w-96 bg-base-100 shadow-xl glass">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center">Reset Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm New Password</span>
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="input input-bordered"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="loading loading-spinner"></span> : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
