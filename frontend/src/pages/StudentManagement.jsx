import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Table from '../components/common/Table';
import DynamicForm from '../components/common/DynamicForm';
import api from '../utils/api';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sort, setSort] = useState('-createdAt');
  const [search, setSearch] = useState('');

  // Form modal triggers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formError, setFormError] = useState('');

  const { isAdmin, user } = useContext(AuthContext);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/students', {
        params: { page, sort, search, limit: 10 }
      });
      if (res.data.success) {
        setStudents(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/api/classes', { params: { limit: 100 } });
      if (res.data.success) {
        setClasses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch classes dropdown:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, sort, search]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setFormError('');
    try {
      let res;
      if (editingStudent) {
        res = await api.put(`/api/students/${editingStudent._id}`, formData);
      } else {
        res = await api.post('/api/students', formData);
      }

      if (res.data.success) {
        setIsModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit form.');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student? This will delete their class roster link.')) {
      try {
        const res = await api.delete(`/api/students/${id}`);
        if (res.data.success) {
          fetchStudents();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Delete operation failed.');
      }
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Alice Smith' },
    { 
      name: 'gender', 
      label: 'Gender', 
      type: 'select', 
      required: true,
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' }
      ]
    },
    { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
    { name: 'phone', label: 'Contact Phone', type: 'text', required: true, placeholder: 'e.g. 555-0101' },
    { 
      name: 'email', 
      label: 'Email Address (Optional)', 
      type: 'email', 
      placeholder: 'student@example.com',
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      errorMessage: 'Please enter a valid email address'
    },
    { 
      name: 'class', 
      label: 'Enrolled Class', 
      type: 'select', 
      options: classes.map(c => ({ value: c._id, label: `${c.name} (${c.year})` }))
    },
    { name: 'address', label: 'Permanent Address', type: 'textarea', required: true, placeholder: 'Enter residential address...', fullWidth: true }
  ];

  const columns = [
    { header: 'Name', key: 'name', sortable: true },
    { header: 'Gender', key: 'gender', sortable: true },
    { 
      header: 'Age', 
      key: 'dob', 
      sortable: true,
      render: (row) => {
        const age = new Date().getFullYear() - new Date(row.dob).getFullYear();
        return `${age} years`;
      }
    },
    { 
      header: 'Assigned Class', 
      key: 'class', 
      sortable: false,
      render: (row) => row.class?.name || <span className="text-slate-400">Unassigned</span>
    },
    { header: 'Phone', key: 'phone', sortable: false },
    { 
      header: 'Fees Paid (₹)', 
      key: 'feesPaid', 
      sortable: true,
      render: (row) => `₹${row.feesPaid || 0}`
    },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-amber-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-amber-400"
            title="Edit Student"
          >
            <Edit2 size={16} />
          </button>
          
          {isAdmin() && (
            <button
              onClick={() => handleDeleteStudent(row._id)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-rose-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-rose-400"
              title="Delete Student"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen pl-64 pt-20">
      <Sidebar />
      <Navbar title="Student Management" />

      <main className="p-8 flex flex-col gap-6">
        
        {/* Actions bar */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 font-display">Student Directory</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Manage student records, addresses, and tuition statuses</p>
          </div>
          
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all font-semibold text-sm dark:shadow-none"
          >
            <Plus size={18} />
            <span>Enroll Student</span>
          </button>
        </div>

        {/* Data Grid */}
        <Table
          columns={columns}
          data={students}
          loading={loading}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={totalCount}
          onSortChange={setSort}
          searchTerm={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search students by name, email, or phone..."
        />

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-200">
                  {editingStudent ? 'Edit Student Details' : 'Enroll Student'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              {formError && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                  <AlertCircle size={18} />
                  <span>{formError}</span>
                </div>
              )}

              <DynamicForm
                fields={fields}
                initialValues={editingStudent || {}}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsModalOpen(false)}
                submitLabel={editingStudent ? 'Save Changes' : 'Enroll Student'}
              />
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentManagement;
