import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  CreditCard, 
  AlertCircle, 
  TrendingUp,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { Student } from '../types';

interface DashboardProps {
  students: Student[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard({ students }: DashboardProps) {
  // Calculate Analytics
  const totalStudents = students.length;
  const totalRevenue = students.reduce((acc, s) => acc + (parseFloat(s.totalFees) || 0) - (parseFloat(s.balanceDue) || 0), 0);
  const pendingBalance = students.reduce((acc, s) => acc + (parseFloat(s.balanceDue) || 0), 0);
  const confirmedStudents = students.filter(s => s.status === 'Confirm').length;

  // Gender Distribution
  const genderData = [
    { name: 'Male', value: students.filter(s => s.gender === 'Male').length },
    { name: 'Female', value: students.filter(s => s.gender === 'Female').length },
    { name: 'Other', value: students.filter(s => s.gender === 'Other').length },
  ].filter(d => d.value > 0);

  // Status Distribution
  const statusData = [
    { name: 'Confirm', value: confirmedStudents },
    { name: 'Pending', value: students.filter(s => s.status === 'Pending').length },
    { name: 'Cancelled', value: students.filter(s => s.status === 'Cancelled').length },
  ].filter(d => d.value > 0);

  // State Distribution
  const stateCounts: Record<string, number> = {};
  students.forEach(s => {
    if (s.state) stateCounts[s.state] = (stateCounts[s.state] || 0) + 1;
  });
  const stateData = Object.entries(stateCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">Analytics Overview</h1>
        <p className="text-slate-500 text-sm">Real-time insights from your student database.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={totalStudents.toString()} 
          icon={<Users className="text-indigo-600" />} 
          trend="+12% from last month"
          color="indigo"
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString()}`} 
          icon={<CreditCard className="text-emerald-600" />} 
          trend="+8% from last month"
          color="emerald"
        />
        <StatCard 
          title="Pending Balance" 
          value={`₹${pendingBalance.toLocaleString()}`} 
          icon={<AlertCircle className="text-amber-600" />} 
          trend="-5% from last month"
          color="amber"
        />
        <StatCard 
          title="Confirmed" 
          value={confirmedStudents.toString()} 
          icon={<CheckCircle2 className="text-sky-600" />} 
          trend="+15% from last month"
          color="sky"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend (Mocked) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Registration Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distributions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Gender</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  const colorClasses: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          {trend.split(' ')[0]}
        </span>
      </div>
      <h4 className="text-slate-500 text-sm font-medium">{title}</h4>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-xs text-slate-400 mt-2">{trend}</p>
    </div>
  );
}
