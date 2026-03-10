import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  LogOut, 
  Settings,
  Menu,
  X,
  Lock
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import Login from './components/Login';
import { Student } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    localStorage.getItem('isLoggedIn') === 'true'
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAdminAuthenticated) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && isAdminAuthenticated) {
      fetchStudents();
    }
  }, [isAuthenticated, isAdminAuthenticated]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsAuthenticated(data.isAuthenticated);
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  const handleLogin = async () => {
    const res = await fetch('/api/auth/url');
    const { url } = await res.json();
    const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700');
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsAuthenticated(true);
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
  };

  if (!isAdminAuthenticated) {
    return <Login onLogin={() => setIsAdminAuthenticated(true)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Student Sync Pro</h1>
          <p className="text-slate-500 mb-8">Please connect your Google account to access the student management system.</p>
          <button
            onClick={handleLogin}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200"
          >
            Connect Google Sheets
          </button>
          <p className="mt-6 text-xs text-slate-400">
            Requires Google Sheets API permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-full z-20`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex-shrink-0 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && <span className="font-bold text-slate-900 text-lg">SyncPro</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Students" 
            active={activeTab === 'students'} 
            collapsed={!isSidebarOpen}
            onClick={() => setActiveTab('students')}
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => {
              setEditingStudent(null);
              setIsFormOpen(true);
            }}
            className={`w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md ${!isSidebarOpen && 'px-0'}`}
          >
            <UserPlus size={20} />
            {isSidebarOpen && <span>New Student</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-4 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">Admin User</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' ? (
            <Dashboard students={students} />
          ) : (
            <StudentList 
              students={students} 
              onEdit={(s) => {
                setEditingStudent(s);
                setIsFormOpen(true);
              }}
              onDelete={fetchStudents}
            />
          )}
        </div>
      </main>

      {isFormOpen && (
        <StudentForm 
          student={editingStudent} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => {
            setIsFormOpen(false);
            fetchStudents();
          }}
        />
      )}
    </div>
  );
}

function NavItem({ icon, label, active, collapsed, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-indigo-50 text-indigo-600 font-medium' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </button>
  );
}
