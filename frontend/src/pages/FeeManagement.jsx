import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Table from '../components/common/Table';
import DynamicForm from '../components/common/DynamicForm';
import api from '../utils/api';
import { exportFeesPDF } from '../utils/pdfGenerator';
import { Plus, FileText, Trash2, X, AlertCircle } from 'lucide-react';

const FeeManagement = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sort, setSort] = useState('-date');
  const [search, setSearch] = useState('');

  // Form modal triggers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const { isAdmin } = useContext(AuthContext);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/fees', {
        params: { page, sort, search, limit: 10 }
      });
      if (res.data.success) {
        setPayments(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch fee payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/api/students', { params: { limit: 200 } });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch students dropdown:', err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, sort, search]);

  useEffect(() => {
    if (isAdmin()) {
      fetchStudents();
    }
  }, []);

  const handleOpenCreateModal = () => {
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setFormError('');
    try {
      const res = await api.post('/api/fees', formData);
      if (res.data.success) {
        setIsModalOpen(false);
        fetchPayments();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit payment.');
    }
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm('Are you sure you want to revert this payment? This will decrease the student\'s fees paid amount.')) {
      try {
        const res = await api.delete(`/api/fees/${id}`);
        if (res.data.success) {
          fetchPayments();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Revert operation failed.');
      }
    }
  };

  const handleExportPDF = async () => {
    try {
      // Export currently fetched records, or fetch complete list (limit 500) to make comprehensive report
      const res = await api.get('/api/fees', { params: { limit: 500, search } });
      if (res.data.success) {
        exportFeesPDF(res.data.data, search);
      }
    } catch (err) {
      alert('Failed to generate PDF Report.');
    }
  };

  const fields = [
    { 
      name: 'studentId', 
      label: 'Select Student', 
      type: 'select', 
      required: true,
      options: students.map(s => ({ value: s._id, label: `${s.name} (${s.class?.name || 'Unlinked'})` }))
    },
    { name: 'amount', label: 'Payment Amount (₹)', type: 'number', required: true, placeholder: 'e.g. 1500', min: 1 },
    { 
      name: 'paymentMethod', 
      label: 'Payment Method', 
      type: 'select', 
      required: true,
      options: [
        { value: 'Cash', label: 'Cash' },
        { value: 'Card', label: 'Card' },
        { value: 'Bank Transfer', label: 'Bank Transfer' },
        { value: 'UPI', label: 'UPI' }
      ]
    },
    { name: 'date', label: 'Payment Date', type: 'date', required: true },
    { name: 'remarks', label: 'Remarks / Comments', type: 'textarea', placeholder: 'e.g. Term fee payment receipt...', fullWidth: true }
  ];

  const columns = [
    { 
      header: 'Receipt ID', 
      key: '_id', 
      sortable: false,
      render: (row) => row._id.substring(18).toUpperCase() // Display readable snippet
    },
    { 
      header: 'Student Name', 
      key: 'student', 
      sortable: false,
      render: (row) => row.student?.name || <span className="text-slate-400">Deleted Student</span>
    },
    { 
      header: 'Class Name', 
      key: 'class', 
      sortable: false,
      render: (row) => row.student?.class?.name || <span className="text-slate-400">-</span>
    },
    { 
      header: 'Date', 
      key: 'date', 
      sortable: true,
      render: (row) => new Date(row.date).toLocaleDateString()
    },
    { header: 'Payment Method', key: 'paymentMethod', sortable: true },
    { 
      header: 'Amount (₹)', 
      key: 'amount', 
      sortable: true,
      render: (row) => `₹${row.amount}`
    },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          {isAdmin() && (
            <button
              onClick={() => handleDeletePayment(row._id)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-rose-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-rose-400"
              title="Revert Payment"
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
      <Navbar title="Fees Ledger Management" />

      <main className="p-8 flex flex-col gap-6">
        
        {/* Actions bar */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 font-display">Financial Receipts</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Record incoming student tuition fees and export histories</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-semibold text-sm dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
            >
              <FileText size={18} />
              <span>Export PDF Report</span>
            </button>

            {isAdmin() && (
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all font-semibold text-sm dark:shadow-none"
              >
                <Plus size={18} />
                <span>Collect Fees</span>
              </button>
            )}
          </div>
        </div>

        {/* Data Grid */}
        <Table
          columns={columns}
          data={payments}
          loading={loading}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={totalCount}
          onSortChange={setSort}
          searchTerm={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search transactions by student name..."
        />

        {/* Create Payment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-200">
                  Record Student Payment
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
                initialValues={{ date: new Date().toISOString().split('T')[0] }}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsModalOpen(false)}
                submitLabel="Submit Payment"
              />
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default FeeManagement;
