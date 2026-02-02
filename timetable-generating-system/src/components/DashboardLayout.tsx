import { useState } from 'react';
import { Button } from './ui/button';
import { 
  Menu, 
  X, 
  GraduationCap, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';

export function DashboardLayout({ 
  children, 
  userEmail, 
  userRole,
  onLogout, 
  navigation 
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const roleTitle = userRole === 'school-officer' 
    ? 'School Timetable Officer' 
    : 'Department Timetable Officer';

  const initials = userEmail.split('@')[0].slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="bg-[#0f2044] border-b border-[#0f2044]/20 shadow-lg sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-white/10"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="bg-[#ffb71b] rounded-full p-2">
                  <GraduationCap className="size-6 text-[#0f2044]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Babcock University</h1>
                  <p className="text-xs text-[#ffb71b]">Timetable System</p>
                </div>
              </div>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <Avatar className="size-9 border-2 border-[#ffb71b]">
                  <AvatarFallback className="bg-[#ffb71b] text-[#0f2044] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{userEmail}</p>
                  <p className="text-xs text-slate-300">{roleTitle}</p>
                </div>
              </div>
              <Button
                onClick={onLogout}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <LogOut className="size-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside 
          className={`
            fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-white border-r border-slate-200 
            transform transition-transform duration-200 ease-in-out z-30
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Navigation
            </h2>
          </div>
          
          <nav className="p-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    item.onClick();
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
                    ${item.active 
                      ? 'bg-[#0f2044] text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100'
                    }
                  `}
                >
                  <Icon className={`size-5 ${item.active ? 'text-[#ffb71b]' : 'text-slate-500'}`} />
                  <span className="font-medium flex-1">{item.name}</span>
                  {item.active && <ChevronRight className="size-4 text-[#ffb71b]" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden top-[57px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}