import { useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const Table = ({
  columns,
  data = [],
  loading = false,
  // Server-side Pagination controls
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalCount = 0,
  // Sorting controls
  onSortChange,
  // Search bar
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Search records...'
}) => {
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const handleSort = (key) => {
    if (!onSortChange) return;

    let newOrder = 'asc';
    if (sortKey === key) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    setSortKey(key);
    setSortOrder(newOrder);

    // Call external sort handler (e.g. passing 'name' or '-name')
    const sortParam = newOrder === 'desc' ? `-${key}` : key;
    onSortChange(sortParam);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters */}
      {onSearchChange !== undefined && (
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="bg-slate-50/75 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-medium">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-6 py-4 font-semibold ${col.sortable ? 'cursor-pointer select-none hover:text-indigo-600 dark:hover:text-indigo-400' : ''}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <ArrowUpDown size={14} className="text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    No records found
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr
                    key={row._id || idx}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {col.render ? col.render(row) : row[col.key] || '-'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {onPageChange && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/10">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{data.length}</span> of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{totalCount}</span> records
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-50 disabled:hover:bg-transparent dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-400"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      currentPage === p
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-500 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-50 disabled:hover:bg-transparent dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-400"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
