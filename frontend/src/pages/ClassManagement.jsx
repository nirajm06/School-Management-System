import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Table from '../components/common/Table';
import DynamicForm from '../components/common/DynamicForm';
import api from '../utils/api';
import { Plus, Eye, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sort, setSort] = useState('-createdAt');
  const [search, setSearch] = useState('');

  // Form modal triggers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formError, setFormError] = useState('');

  const { isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/classes', {
        params: { page, sort, search, limit: 10 }
      });
      if (res.data.success) {
        setClasses(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      // Fetch all teachers without limit (or large limit) for the dropdown
      const res = await api.get('/api/teachers', { params: { limit: 100 } });
      if (res.data.success) {
        setTeachers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch teachers dropdown:', err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [page, sort, search]);

  useEffect(() => {
    if (isAdmin()) {
      fetchTeachers();
    }
  }, []);

  const handleOpenCreateModal = () => {
    setEditingClass(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cls) => {
    setEditingClass(cls);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setFormError('');
    try {
      let res;
      if (editingClass) {
        // Edit Class
        res = await api.put(`/api/classes/${editingClass._id}`, formData);
      } else {
        // Create Class
        res = await api.post('/api/classes', formData);
      }

      if (res.data.success) {
        setIsModalOpen(false);
        fetchClasses();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit form.');
    }
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm('Are you sure you want to delete this class? This will unlink teachers and students.')) {
      try {
        const res = await api.delete(`/api/classes/${id}`);
        if (res.data.success) {
          fetchClasses();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Delete operation failed.');
      }
    }
  };

  const fields = [
    { name: 'name', label: 'Class Name', type: 'text', required: true, placeholder: 'e.g. Class 10 - Chemistry' },
    { name: 'year', label: 'Academic Year', type: 'number', required: true, placeholder: 'e.g. 2026', min: 2020 },
    { name: 'studentLimit', label: 'Student Limit', type: 'number', required: true, placeholder: 'e.g. 30', min: 1 },
    { name: 'fees', label: 'Monthly Student Fees (₹)', type: 'number', required: true, placeholder: 'e.g. 1500', min: 0 },
    { 
      name: 'teacher', 
      label: 'Assigned Teacher', 
      type: 'select', 
      options: teachers.map(t => ({ value: t._id, label: t.name }))
    }
  ];

  const columns = [
    { header: 'Class Name', key: 'name', sortable: true },
    { header: 'Year', key: 'year', sortable: true },
    { 
      header: 'Assigned Teacher', 
      key: 'teacher', 
      sortable: false,
      render: (row) => row.teacher?.name || <span className="text-slate-400">Unassigned</span>
    },
    { 
      header: 'Roster Count', 
      key: 'students', 
      sortable: false, 
      render: (row) => `${row.students?.length || 0} / ${row.studentLimit}`
    },
    { 
      header: 'Fees (₹)', 
      key: 'fees', 
      sortable: true,
      render: (row) => `₹${row.fees}`
    },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/classes/${row._id}`)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-indigo-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-indigo-400"
            title="View Analytics"
          >
            <Eye size={16} />
          </button>
          
          {isAdmin() && (
            <>
              <button
                onClick={() => handleOpenEditModal(row)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-amber-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-amber-400"
                title="Edit Class"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDeleteClass(row._id)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-rose-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-rose-400"
                title="Delete Class"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen pl-64 pt-20">
      <Sidebar />
      <Navbar title="Class Management" />

      <main className="p-8 flex flex-col gap-6">
        
        {/* Actions bar */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 font-display">School Classes</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Monitor academic programs and student numbers</p>
          </div>
          
          {isAdmin() && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all font-semibold text-sm dark:shadow-none"
            >
              <Plus size={18} />
              <span>Create Class</span>
            </button>
          )}
        </div>

        {/* Data Grid */}
        <Table
          columns={columns}
          data={classes}
          loading={loading}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={totalCount}
          onSortChange={setSort}
          searchTerm={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search classes by name..."
        />

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-200">
                  {editingClass ? 'Edit Class Details' : 'Create Class Record'}
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
                initialValues={editingClass || {}}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsModalOpen(false)}
                submitLabel={editingClass ? 'Save Changes' : 'Create Class'}
              />
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default ClassManagement;
