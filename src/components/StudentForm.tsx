import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, CreditCard, Calendar, Hash } from 'lucide-react';
import { Student } from '../types';

interface StudentFormProps {
  student: Student | null;
  onClose: () => void;
  onSuccess: () => void;
}

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", 
  "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", 
  "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad"
];

export default function StudentForm({ student, onClose, onSuccess }: StudentFormProps) {
  const [formData, setFormData] = useState<Student>({
    admissionId: '',
    fullName: '',
    qualification: '',
    gender: '',
    age: '',
    country: 'India (+91)',
    medium: 'English',
    contactNo: '',
    whatsappNo: '',
    state: '',
    city: '',
    status: 'Confirm',
    payments: Array(40).fill(''), // 10 payments * 4 fields (Amount, Date, Ref, Method)
    totalFees: '20000',
    discount: '0',
    balanceDue: '20000',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData(student);
    }
  }, [student]);

  useEffect(() => {
    // Calculate balance due
    const total = parseFloat(formData.totalFees) || 0;
    const disc = parseFloat(formData.discount) || 0;
    let paid = 0;
    for (let i = 0; i < 10; i++) {
      paid += parseFloat(formData.payments[i * 4]) || 0;
    }
    const balance = total - disc - paid;
    setFormData(prev => ({ ...prev, balanceDue: balance.toString() }));
  }, [formData.totalFees, formData.discount, formData.payments]);

  const handlePaymentChange = (index: number, field: 0 | 1 | 2 | 3, value: string) => {
    const newPayments = [...formData.payments];
    newPayments[index * 4 + field] = value;
    
    // If method changes, clear the reference field
    if (field === 3) {
      newPayments[index * 4 + 2] = '';
    }
    
    setFormData({ ...formData, payments: newPayments });
  };

  const handlePhoneChange = (field: 'contactNo' | 'whatsappNo', value: string) => {
    if (formData.country === 'India (+91)') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [field]: cleaned });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = student ? `/api/students/${student.id}` : '/api/students';
      const method = student ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
          <div>
            <h2 className="text-xl font-bold">{student ? 'Edit Registration' : 'New Registration'}</h2>
            <p className="text-indigo-100 text-sm">Base Fees: ₹{formData.totalFees}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Student Profile */}
            <div className="space-y-8">
              <SectionTitle title="Student Profile" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputGroup label="Admission ID">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="EHA-3HC-" 
                    value={formData.admissionId}
                    onChange={e => setFormData({ ...formData, admissionId: e.target.value })}
                  />
                </InputGroup>
                <InputGroup label="Full Name">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Student Name" 
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </InputGroup>
                <InputGroup label="Qualification">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 10th, Graduate" 
                    value={formData.qualification}
                    onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                  />
                </InputGroup>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Gender">
                    <select 
                      className="form-select"
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </InputGroup>
                  <InputGroup label="Age">
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                    />
                  </InputGroup>
                </div>
                <InputGroup label="Country">
                  <select 
                    className="form-select"
                    value={formData.country}
                    onChange={e => {
                      const newCountry = e.target.value;
                      let contact = formData.contactNo;
                      let whatsapp = formData.whatsappNo;
                      if (newCountry === 'India (+91)') {
                        contact = contact.replace(/\D/g, '').slice(0, 10);
                        whatsapp = whatsapp.replace(/\D/g, '').slice(0, 10);
                      }
                      setFormData({ ...formData, country: newCountry, contactNo: contact, whatsappNo: whatsapp });
                    }}
                  >
                    <option value="India (+91)">India (+91)</option>
                    <option value="Other">Other</option>
                  </select>
                </InputGroup>
                <InputGroup label="Medium">
                  <select 
                    className="form-select"
                    value={formData.medium}
                    onChange={e => setFormData({ ...formData, medium: e.target.value })}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Urdu">Urdu</option>
                    <option value="Other">Other</option>
                  </select>
                </InputGroup>
                <InputGroup label="Contact No">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder={formData.country === 'India (+91)' ? "10 Digits" : "Contact No"} 
                    value={formData.contactNo}
                    onChange={e => handlePhoneChange('contactNo', e.target.value)}
                  />
                </InputGroup>
                <InputGroup label="WhatsApp No">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder={formData.country === 'India (+91)' ? "10 Digits" : "WhatsApp No"} 
                    value={formData.whatsappNo}
                    onChange={e => handlePhoneChange('whatsappNo', e.target.value)}
                  />
                </InputGroup>
                <InputGroup label="State / UT">
                  <select 
                    className="form-select"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                  >
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </InputGroup>
                <InputGroup label="City">
                  <input 
                    list="city-list"
                    className="form-input"
                    placeholder="Select or Type City"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  />
                  <datalist id="city-list">
                    {CITIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </InputGroup>
                <div className="sm:col-span-2">
                  <InputGroup label="Registration Status">
                    <select 
                      className="form-select"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="Confirm">Confirm</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </InputGroup>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Schedule */}
            <div className="space-y-8">
              <SectionTitle title="Payment Schedule" />
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                        Payment {i + 1} {i === 0 && '(Initial)'}
                      </span>
                      <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                        <button 
                          type="button" 
                          onClick={() => handlePaymentChange(i, 3, 'Account')}
                          className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                            formData.payments[i * 4 + 3] === 'Account' 
                              ? 'bg-indigo-600 text-white' 
                              : 'text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          ACCOUNT
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handlePaymentChange(i, 3, 'Cash')}
                          className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                            formData.payments[i * 4 + 3] === 'Cash' 
                              ? 'bg-indigo-600 text-white' 
                              : 'text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          CASH
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          className="payment-input pl-3" 
                          value={formData.payments[i * 4]}
                          onChange={e => handlePaymentChange(i, 0, e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <input 
                          type="date" 
                          className="payment-input" 
                          value={formData.payments[i * 4 + 1]}
                          onChange={e => handlePaymentChange(i, 1, e.target.value)}
                        />
                      </div>
                    </div>
                    {formData.payments[i * 4 + 3] === 'Account' && (
                      <input 
                        type="text" 
                        placeholder="UTR Number (Alphanumeric)" 
                        className="payment-input w-full border-indigo-200 bg-indigo-50/30" 
                        value={formData.payments[i * 4 + 2]}
                        onChange={e => handlePaymentChange(i, 2, e.target.value)}
                      />
                    )}
                    {formData.payments[i * 4 + 3] === 'Cash' && (
                      <input 
                        type="text" 
                        placeholder="Received By (Name)" 
                        className="payment-input w-full border-emerald-200 bg-emerald-50/30" 
                        value={formData.payments[i * 4 + 2]}
                        onChange={e => handlePaymentChange(i, 2, e.target.value)}
                      />
                    )}
                    {!formData.payments[i * 4 + 3] && (
                      <p className="text-[10px] text-slate-400 italic text-center py-1">Select payment method above</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <InputGroup label="Total Fees">
                  <input 
                    type="number" 
                    className="form-input font-bold text-lg" 
                    value={formData.totalFees}
                    onChange={e => setFormData({ ...formData, totalFees: e.target.value })}
                  />
                </InputGroup>
                <InputGroup label="Discount">
                  <input 
                    type="number" 
                    className="form-input font-bold text-lg" 
                    value={formData.discount}
                    onChange={e => setFormData({ ...formData, discount: e.target.value })}
                  />
                </InputGroup>
              </div>
              
              <div className="bg-indigo-600 p-6 rounded-2xl flex items-center justify-between text-white shadow-lg shadow-indigo-100">
                <span className="font-bold uppercase tracking-widest text-xs opacity-80">Balance Due</span>
                <span className="text-3xl font-bold">₹{parseFloat(formData.balanceDue).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50">
          <button 
            type="button"
            onClick={onClose}
            className="px-8 py-3 text-slate-500 font-semibold hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-12 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'SUBMIT ENTRY'}
          </button>
        </div>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .form-input:focus {
          outline: none;
          background: white;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        .form-select {
          width: 100%;
          padding: 12px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
        }
        .payment-input {
          width: 100%;
          padding: 8px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4">
      <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] whitespace-nowrap">{title}</h3>
      <div className="h-px bg-slate-100 w-full"></div>
    </div>
  );
}

function InputGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      {children}
    </div>
  );
}
