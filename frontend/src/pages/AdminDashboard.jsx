import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    coverImage: null,
    pdf: null,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await axios.get('/api/admin/download-requests');
      setRequests(res.data);
    } catch (error) {
      toast.error('Failed to fetch download requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveUser = async (userId) => {
    const originalUsers = [...users];
    const updatedUsers = users.map(user =>
      user._id === userId ? { ...user, isApproved: true } : user
    );
    setUsers(updatedUsers);

    try {
      await axios.patch(`/api/admin/approve-user/${userId}`);
      toast.success('User approved successfully!');
    } catch (error) {
      toast.error('Failed to approve user');
      setUsers(originalUsers); // Revert on error
    }
  };

  const handleApproveRequest = async (requestId) => {
    const originalRequests = [...requests];
    const updatedRequests = requests.map(req =>
      req._id === requestId ? { ...req, isApproved: true } : req
    );
    setRequests(updatedRequests);

    try {
      await axios.patch(`/api/admin/approve-download/${requestId}`);
      toast.success('Request approved successfully!');
    } catch (error) {
      toast.error('Failed to approve request');
      setRequests(originalRequests); // Revert on error
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUploadBook = async (e) => {
    e.preventDefault();
    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('author', formData.author);
    uploadData.append('description', formData.description);
    uploadData.append('coverImage', formData.coverImage);
    uploadData.append('pdf', formData.pdf);

    try {
      await axios.post('/api/admin/upload-book', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Book uploaded successfully!');
      e.target.reset();
      setFormData({ title: '', author: '', description: '', coverImage: null, pdf: null });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload book');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Upload a New Book</h2>
            <form onSubmit={handleUploadBook}>
              <div className="form-control">
                <label className="label"><span className="label-text">Title</span></label>
                <input type="text" name="title" onChange={handleChange} className="input input-bordered" required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Author</span></label>
                <input type="text" name="author" onChange={handleChange} className="input input-bordered" required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Description</span></label>
                <textarea name="description" onChange={handleChange} className="textarea textarea-bordered" required></textarea>
              </div>
              <div className="form-control mt-4">
                <label className="label"><span className="label-text">Cover Image</span></label>
                <input type="file" name="coverImage" onChange={handleFileChange} className="file-input file-input-bordered w-full" required />
              </div>
              <div className="form-control mt-4">
                <label className="label"><span className="label-text">Book PDF</span></label>
                <input type="file" name="pdf" onChange={handleFileChange} className="file-input file-input-bordered w-full" required />
              </div>
              <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? <span className="loading loading-spinner"></span> : 'Upload Book'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div role="tablist" className="tabs tabs-lifted">
              <input type="radio" name="admin_tabs" role="tab" className="tab" aria-label="Approve Users" defaultChecked />
              <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
                <h2 className="text-xl font-bold mb-4">Approve Users</h2>
                {loadingUsers ? <span className="loading loading-spinner"></span> : (
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user._id}>
                            <td>{user.fullName}</td>
                            <td>{user.email}</td>
                            <td>
                              {user.isApproved ? <span className="badge badge-success">Approved</span> : (
                                <button className="btn btn-sm btn-success" onClick={() => handleApproveUser(user._id)}>Approve</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <input type="radio" name="admin_tabs" role="tab" className="tab" aria-label="Download Requests" />
              <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
                <h2 className="text-xl font-bold mb-4">Download Requests</h2>
                {loadingRequests ? <span className="loading loading-spinner"></span> : (
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>Book</th>
                          <th>User</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map(req => (
                          <tr key={req.requestId}>
                            <td>{req.bookTitle}</td>
                            <td>{req.user.fullName}</td>
                            <td>
                              {req.isApproved ? <span className="badge badge-success">Approved</span> : (
                                <button className="btn btn-sm btn-success" onClick={() => handleApproveRequest(req.requestId)}>Approve</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
