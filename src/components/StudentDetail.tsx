import { useRef } from 'react';
import { X, Printer, Download, Mail, Phone, MapPin, Calendar, CreditCard, User } from 'lucide-react';
import { Student } from '../types';
import html2canvas from 'html2canvas';
import { useReactToPrint } from 'react-to-print';

interface StudentDetailProps {
  student: Student;
  onClose: () => void;
}

export default function StudentDetail({ student, onClose }: StudentDetailProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Student_${student.admissionId}`,
  });

  const handleDownloadImage = async () => {
    if (contentRef.current) {
      try {
        // Temporarily set overflow to visible to capture full content
        const originalStyle = contentRef.current.style.overflow;
        contentRef.current.style.overflow = 'visible';
        
        const canvas = await html2canvas(contentRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: true,
          logging: false,
          onclone: (clonedDoc) => {
            const el = clonedDoc.getElementById('printable-content');
            if (el) el.style.overflow = 'visible';
          }
        });
        
        contentRef.current.style.overflow = originalStyle;
        
        const link = document.createElement('a');
        link.download = `Student_${student.admissionId}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      } catch (err) {
        console.error('Failed to download image:', err);
        alert('Failed to generate image. Please try printing instead.');
      }
    }
  };

  const paidAmount = [...Array(10)].reduce((sum, _, i) => {
    return sum + (parseFloat(student.payments[i * 4]) || 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Actions */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium shadow-sm"
            >
              <Printer size={16} /> Print
            </button>
            <button 
              onClick={handleDownloadImage}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium shadow-sm"
            >
              <Download size={16} /> Download Image
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Printable Content */}
        <div className="flex-1 overflow-y-auto p-8" ref={contentRef} id="printable-content">
          <div className="max-w-3xl mx-auto space-y-10">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-8 border-b border-slate-100 pb-10">
              <div className="w-32 h-32 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-5xl font-bold shadow-xl shadow-indigo-100">
                {student.fullName.charAt(0)}
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-900">{student.fullName}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    student.status === 'Confirm' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {student.status}
                  </span>
                </div>
                <p className="text-indigo-600 font-semibold tracking-widest text-sm uppercase mb-4">{student.admissionId}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-500 text-sm">
                  <div className="flex items-center gap-2"><User size={16} /> {student.gender}, {student.age} yrs</div>
                  <div className="flex items-center gap-2"><MapPin size={16} /> {student.city}, {student.state}</div>
                  <div className="flex items-center gap-2"><Calendar size={16} /> Registered 2026</div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personal Information</h3>
                <div className="space-y-4">
                  <DetailItem label="Qualification" value={student.qualification} />
                  <DetailItem label="Medium" value={student.medium} />
                  <DetailItem label="Contact Number" value={student.contactNo} />
                  <DetailItem label="WhatsApp Number" value={student.whatsappNo} />
                  <DetailItem label="Country" value={student.country} />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Financial Summary</h3>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Total Course Fees</span>
                    <span className="font-bold text-slate-900">₹{parseFloat(student.totalFees).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Scholarship/Discount</span>
                    <span className="font-bold text-emerald-600">- ₹{parseFloat(student.discount).toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-200"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Total Paid</span>
                    <span className="font-bold text-indigo-600">₹{paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-900 font-bold">Balance Due</span>
                    <span className="text-2xl font-black text-red-600">₹{parseFloat(student.balanceDue).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Schedule</h3>
              <div className="border border-slate-100 rounded-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Installment</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Reference/UTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...Array(10)].map((_, i) => {
                      const amount = student.payments[i * 4];
                      const date = student.payments[i * 4 + 1];
                      const ref = student.payments[i * 4 + 2];
                      const method = student.payments[i * 4 + 3];
                      
                      if (!amount) return null;
                      return (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">Payment {i + 1}</td>
                          <td className="px-6 py-4 text-sm font-bold text-indigo-600">₹{parseFloat(amount).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{date}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            <div className="flex flex-col">
                              <span className="font-mono">{ref}</span>
                              <span className="text-[10px] uppercase font-bold text-slate-400">{method}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-10 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-widest">Generated by Student Sync Pro • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value || 'N/A'}</span>
    </div>
  );
}
