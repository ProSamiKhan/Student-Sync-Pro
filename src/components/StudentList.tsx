import { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  Download, 
  Printer,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Student } from '../types';
import StudentDetail from './StudentDetail';
import html2canvas from 'html2canvas';
import { useReactToPrint } from 'react-to-print';

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: () => void;
}

export default function StudentList({ students, onEdit, onDelete }: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    status: '',
    state: '',
    paymentStatus: '' // 'Fully Paid', 'Pending'
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const tableRef = useRef<HTMLDivElement>(null);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = 
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactNo.includes(searchTerm);
      
      const matchesGender = !filters.gender || s.gender === filters.gender;
      const matchesStatus = !filters.status || s.status === filters.status;
      const matchesState = !filters.state || s.state === filters.state;
      
      const isFullyPaid = parseFloat(s.balanceDue) <= 0;
      const matchesPayment = !filters.paymentStatus || 
        (filters.paymentStatus === 'Fully Paid' ? isFullyPaid : !isFullyPaid);

      return matchesSearch && matchesGender && matchesStatus && matchesState && matchesPayment;
    });
  }, [students, searchTerm, filters]);

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this student?')) {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) onDelete();
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: tableRef,
    documentTitle: 'Student List',
  });

  const handleDownloadImage = async () => {
    if (tableRef.current) {
      try {
        const canvas = await html2canvas(tableRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: true,
          logging: false,
          onclone: (clonedDoc) => {
            const el = clonedDoc.getElementById('student-table-container');
            if (el) {
              el.style.overflow = 'visible';
              el.style.height = 'auto';
            }
          }
        });
        const link = document.createElement('a');
        link.download = 'student-list.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error('Failed to download image:', err);
        alert('Failed to generate image. Please try printing instead.');
      }
    }
  };

  const states = Array.from(new Set(students.map(s => s.state))).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
          <p className="text-slate-500 text-sm">Manage and monitor all student registrations.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">Print Master View</span>
          </button>
          <button 
            onClick={handleDownloadImage}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Download Image</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID or contact..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            className="bg-slate-50 border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500"
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <select 
            className="bg-slate-50 border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="Confirm">Confirm</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select 
            className="bg-slate-50 border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500"
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          >
            <option value="">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="bg-slate-50 border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500"
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
          >
            <option value="">Payment Status</option>
            <option value="Fully Paid">Fully Paid</option>
            <option value="Pending">Pending Payment</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" ref={tableRef} id="student-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Financials</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                        {student.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{student.fullName}</p>
                        <p className="text-xs text-slate-500">{student.admissionId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{student.contactNo}</p>
                    <p className="text-xs text-slate-500">{student.whatsappNo}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{student.city}</p>
                    <p className="text-xs text-slate-500">{student.state}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.status === 'Confirm' ? 'bg-emerald-100 text-emerald-800' :
                      student.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">₹{parseFloat(student.totalFees).toLocaleString()}</p>
                    <p className={`text-xs ${parseFloat(student.balanceDue) > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      Due: ₹{parseFloat(student.balanceDue).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedStudent(student)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => onEdit(student)}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id!)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {Math.min(filteredStudents.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredStudents.length, currentPage * itemsPerPage)} of {filteredStudents.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-lg disabled:opacity-50 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-slate-700 px-2">Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-lg disabled:opacity-50 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {selectedStudent && (
        <StudentDetail 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
}
