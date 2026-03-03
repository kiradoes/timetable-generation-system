import { useEffect, useState } from 'react';
import { DepartmentOfficerDashboard } from './components/DepartmentOfficerDashboard';
import { OfficerLoginPage } from './components/OfficerLoginPage';
import { SchoolOfficerDashboard } from './components/SchoolOfficerDashboard';
import { StudentLandingPage } from './components/StudentLandingPage';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { supabase } from './lib/supabase';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('currentView') || 'student';
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('userEmail') || null;
  });
  const [userRole, setUserRole] = useState<string | null>(() => {
    return localStorage.getItem('userRole') || null;
  });
  const [userDepartment, setUserDepartment] = useState<string | null>(() => {
    return localStorage.getItem('userDepartment') || null;
  });

  // Test Supabase connection
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')

      console.log(data, error)
    }

    fetchData()
  }, [])

  const handleOfficerLogin = (email: string, role: string, department: string) => {
    console.log('Login handler called:', { email, role, department });
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userDepartment', department);
    localStorage.setItem('currentView', 'officer-dashboard');
    setUserEmail(email);
    setUserRole(role);
    setUserDepartment(department);
    setCurrentView('officer-dashboard');

    // Show which dashboard is being loaded
    if (role === 'school-officer') {
      console.log('Redirecting to School Officer Dashboard');
    } else if (role === 'department-officer') {
      console.log('Redirecting to Department Officer Dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userDepartment');
    localStorage.removeItem('currentView');
    setCurrentView('student');
    setUserEmail(null);
    setUserRole(null);
    setUserDepartment(null);
  };

  const handleGoToOfficerLogin = () => {
    console.log('handleGoToOfficerLogin called, changing view to officer-login');
    setCurrentView('officer-login');
  };

  const handleBackToStudent = () => {
    setCurrentView('student');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />

      {currentView === 'student' && (
        <StudentLandingPage onOfficerLoginClick={handleGoToOfficerLogin} />
      )}

      {currentView === 'officer-login' && (
        <OfficerLoginPage
          onLogin={handleOfficerLogin}
          onBackToHome={handleBackToStudent}
        />
      )}

      {currentView === 'officer-dashboard' && userRole === 'school-officer' && userEmail && (
        <SchoolOfficerDashboard
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'officer-dashboard' && userRole === 'department-officer' && userEmail && (
        <DepartmentOfficerDashboard
          userEmail={userEmail}
          userDepartment={userDepartment || ''}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'officer-dashboard' && !userRole && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error: No Role Assigned</h2>
            <p className="text-slate-600 mb-4">Unable to determine user role</p>
            <Button onClick={handleLogout}>Back to Login</Button>
          </div>
        </div>
      )}

      {currentView === 'officer-dashboard' && userRole && userRole !== 'school-officer' && userRole !== 'department-officer' && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error: Unknown Role</h2>
            <p className="text-slate-600 mb-4">Role: {userRole}</p>
            <Button onClick={handleLogout}>Back to Login</Button>
          </div>
        </div>
      )}
    </div>
  );
}