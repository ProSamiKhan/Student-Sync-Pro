export interface Payment {
  amount: string;
  date: string;
  reference: string; // UTR or Received By
}

export interface Student {
  id?: number; // Row number in sheet
  admissionId: string;
  fullName: string;
  qualification: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  age: string;
  country: string;
  medium: string;
  contactNo: string;
  whatsappNo: string;
  state: string;
  city: string;
  status: 'Confirm' | 'Pending' | 'Cancelled' | '';
  payments: string[]; // Flattened array of 30 values (10 payments * 3 fields)
  totalFees: string;
  discount: string;
  balanceDue: string;
}

export interface AnalyticsData {
  totalStudents: number;
  totalRevenue: number;
  pendingBalance: number;
  genderDistribution: { name: string; value: number }[];
  statusDistribution: { name: string; value: number }[];
  stateWiseDistribution: { name: string; value: number }[];
}
