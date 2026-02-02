import { GraduationCap } from 'lucide-react';
import { Button } from './ui/button';

export function Navbar({ onOfficerLogin }) {
  return (
    <nav className="bg-[#0f2044] border-b border-[#0f2044]/20 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="bg-[#ffb71b] rounded-full p-2.5">
              <GraduationCap className="size-7 text-[#0f2044]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Babcock University</h1>
              <p className="text-sm text-[#ffb71b]">Timetable System</p>
            </div>
          </div>

          {/* Officer Login Button */}
          <Button 
            onClick={onOfficerLogin}
            className="bg-[#ffb71b] text-[#0f2044] hover:bg-[#ffb71b]/90 font-semibold"
          >
            Officer Login
          </Button>
        </div>
      </div>
    </nav>
  );
}