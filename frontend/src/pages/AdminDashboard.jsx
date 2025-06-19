import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [books, setBooks] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [editingBook, setEditingBook] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    author: '',
    description: '',
    summary: '',
  });
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    summary: '',
    coverImage: null,
    pdf: null,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchBooks();
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

  const fetchBooks = async () => {
    setLoadingBooks(true);
    try {
      const res = await axios.get('/api/books');
      setBooks(res.data);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/books/${bookId}`);
        toast.success('Book deleted successfully!');
        fetchBooks(); // Refresh the book list
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete book');
      }
    }
  };

  const handleEditClick = (book) => {
    setEditingBook(book);
    setEditFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      summary: book.summary || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingBook(null);
    setIsEditModalOpen(false);
    setEditFormData({ title: '', author: '', description: '', summary: '' });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    if (!editingBook) return;
    try {
      await axios.put(`/api/books/${editingBook._id}`, editFormData);
      toast.success('Book updated successfully!');
      handleCloseModal();
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update book');
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
      req._id === requestId ? { ...req, status: 'approved' } : req
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
    uploadData.append('summary', formData.summary);
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
      setFormData({ title: '', author: '', description: '', summary: '', coverImage: null, pdf: null });
      fetchBooks(); // Refresh book list
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
              <div className="form-control">
                <label className="label"><span className="label-text">Summary</span></label>
                <textarea name="summary" onChange={handleChange} className="textarea textarea-bordered" required></textarea>
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

              <input type="radio" name="admin_tabs" role="tab" className="tab" aria-label="Manage Books" />
              <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
                <h2 className="text-xl font-bold mb-4">Manage Books</h2>
                {loadingBooks ? (
                  <div className="flex justify-center items-center"><span className="loading loading-spinner"></span></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>Cover</th>
                          <th>Title</th>
                          <th>Author</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map((book) => (
                          <tr key={book._id}>
                            <td>
                              <div className="avatar">
                                <div className="w-12 h-16 rounded">
                                  <img src={`/${book.coverImage.replace(/\\/g, '/')}`} alt={book.title} />
                                </div>
                              </div>
                            </td>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>
                              <button onClick={() => handleEditClick(book)} className="btn btn-sm btn-info mr-2">Edit</button>
                              <button onClick={() => handleDeleteBook(book._id)} className="btn btn-sm btn-error">Delete</button>
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
                          <tr key={req._id}>
                            <td>{req.bookTitle}</td>
                            <td>{req.user.fullName}</td>
                            <td>
                              {req.status === 'approved' ? <span className="badge badge-success">Approved</span> : (
                                <button className="btn btn-sm btn-success" onClick={() => handleApproveRequest(req._id)}>Approve</button>
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

      {isEditModalOpen && editingBook && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl">
            <h3 className="font-bold text-lg mb-4">Edit: {editingBook.title}</h3>
            <form onSubmit={handleUpdateBook}>
              <div className="form-control">
                <label className="label"><span className="label-text">Title</span></label>
                <input type="text" name="title" value={editFormData.title} onChange={handleEditChange} className="input input-bordered" required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Author</span></label>
                <input type="text" name="author" value={editFormData.author} onChange={handleEditChange} className="input input-bordered" required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Description</span></label>
                <textarea name="description" value={editFormData.description} onChange={handleEditChange} className="textarea textarea-bordered" required></textarea>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Summary</span></label>
                <textarea name="summary" value={editFormData.summary} onChange={handleEditChange} className="textarea textarea-bordered" required></textarea>
              </div>
              <div className="modal-action mt-6">
                <button type="button" onClick={handleCloseModal} className="btn">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
