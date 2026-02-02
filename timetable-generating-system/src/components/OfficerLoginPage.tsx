import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GraduationCap, Calendar, Users, BookOpen, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';

export function OfficerLoginPage({ onLogin, onBackToHome }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // School Officer Login
      if (email === 'school.officer@babcock.edu.ng' && password === 'schooladmin123') {
        onLogin(email, 'school-officer');
      } 
      // Department Officer Logins - All 5 Departments
      else if (
        (email === 'department.cs@babcock.edu.ng' && password === 'dept123') ||
        (email === 'department.se@babcock.edu.ng' && password === 'dept123') ||
        (email === 'department.it@babcock.edu.ng' && password === 'dept123') ||
        (email === 'department.is@babcock.edu.ng' && password === 'dept123') ||
        (email === 'department.cyber@babcock.edu.ng' && password === 'dept123')
      ) {
        onLogin(email, 'department-officer');
      }
      // Legacy support - any email with 'school' goes to school officer, others go to department
      else if (email.includes('school') || email.includes('timetable')) {
        onLogin(email, 'school-officer');
      } else {
        onLogin(email, 'department-officer');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#0f2044] via-[#1a3a6b] to-[#0f2044] p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#ffb71b] rounded-lg p-3">
              <GraduationCap className="size-8 text-[#0f2044]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">BUCC</h1>
              <p className="text-slate-300 text-sm">Timetable Management System</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold mb-4">
                Officer Portal
              </h2>
              <p className="text-slate-300 text-lg">
                Smart scheduling for School of Computing with conflict detection and automated optimization
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Users className="size-8 text-[#ffb71b] mb-2" />
                <h3 className="font-semibold mb-1">5 Departments</h3>
                <p className="text-sm text-slate-300">CS, SE, IT, IS, Cyber Security</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Calendar className="size-8 text-[#ffb71b] mb-2" />
                <h3 className="font-semibold mb-1">Smart Scheduling</h3>
                <p className="text-sm text-slate-300">Conflict-free timetables</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <BookOpen className="size-8 text-[#ffb71b] mb-2" />
                <h3 className="font-semibold mb-1">200+ Courses</h3>
                <p className="text-sm text-slate-300">Computing & General courses</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <GraduationCap className="size-8 text-[#ffb71b] mb-2" />
                <h3 className="font-semibold mb-1">Real-time Validation</h3>
                <p className="text-sm text-slate-300">Instant clash detection</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-400">
          © 2026 Babcock University Computer Club. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onBackToHome}
            className="mb-6 text-[#0f2044] hover:bg-[#0f2044]/5"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Home
          </Button>

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="bg-[#0f2044] rounded-lg p-2">
                <GraduationCap className="size-6 text-[#ffb71b]" />
              </div>
              <h1 className="text-2xl font-bold text-[#0f2044]">BUCC</h1>
            </div>
            <p className="text-slate-600">Timetable Management System</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#0f2044] mb-2">Officer Sign In</h2>
            <p className="text-slate-600">Access the timetable management portal</p>
          </div>

          <Card className="shadow-lg border-slate-200">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#0f2044] font-semibold">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="school.timetable@babcock.edu.ng or department.cs@babcock.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Use school email for full access, or department email for department-specific access
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#0f2044] font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b] pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#0f2044] hover:bg-[#0f2044]/90 text-white font-semibold text-base"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 size-5" />
                    Sign In
                  </>
                )}
              </Button>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 text-center mb-2">
                  Demo Credentials:
                </p>
                <div className="mt-2 space-y-2 text-xs text-slate-500">
                  <div>
                    <p className="font-semibold text-slate-700 mb-1">School Officer:</p>
                    <p>Email: <span className="font-mono">school.officer@babcock.edu.ng</span></p>
                    <p>Password: <span className="font-mono">schooladmin123</span></p>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="font-semibold text-slate-700 mb-1">Department Officers (All use password: <span className="font-mono">dept123</span>):</p>
                    <div className="space-y-0.5 pl-2">
                      <p>• Computer Science: <span className="font-mono">department.cs@babcock.edu.ng</span></p>
                      <p>• Software Engineering: <span className="font-mono">department.se@babcock.edu.ng</span></p>
                      <p>• Information Technology: <span className="font-mono">department.it@babcock.edu.ng</span></p>
                      <p>• Information Systems: <span className="font-mono">department.is@babcock.edu.ng</span></p>
                      <p>• Cyber Security: <span className="font-mono">department.cyber@babcock.edu.ng</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Card>

          <p className="text-center text-sm text-slate-500 mt-6">
            Need help? Contact{' '}
            <a href="mailto:timetable@babcock.edu.ng" className="text-[#ffb71b] hover:underline">
              timetable@babcock.edu.ng
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}