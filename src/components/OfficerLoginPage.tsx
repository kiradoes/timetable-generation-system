import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ApiService from '../services/api';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function OfficerLoginPage({
  onLogin,
  onBackToHome,
}: {
  onLogin: (email: string, role: string, department: string) => void;
  onBackToHome: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await ApiService.login(email, password);

      if (response.success && response.data) {
        const officer = response.data.officer ?? response.data;
        if (!officer) {
          toast.error('Invalid login response');
          return;
        }
        const department = officer.department ?? officer.department_name ?? '';
        const role = officer.role ?? response.data.role ?? 'school-officer';
        const officerEmail = officer.email ?? response.data.email ?? email;
        const fullName = officer.full_name ?? officer.fullName ?? officer.email ?? email;
        onLogin(officerEmail, role, department);
        toast.success(`Welcome back, ${fullName}!`);
      } else {
        toast.error((response as any)?.error || 'Login failed');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // Prevent vertical scrolling only when login page is active
  useEffect(() => {
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflowY = 'hidden';
    return () => {
      document.body.style.overflowY = '';
      document.documentElement.style.overflowY = '';
    };
  }, []);
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Logo Only */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#0f2044] via-[#1a3a6b] to-[#0f2044] p-12 flex-col items-center justify-center">
        <img src="/bucc-logo-raw.png" alt="School of Computing Logo" className="size-32 object-contain" />
        <h2 className="text-2xl font-semibold text-white mt-4">Timetable Generation System</h2>
        <h1 className="text-4xl font-bold text-white mt-4">School of Computing</h1>
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
              <img src="/bucc-logo-raw.png" alt="School of Computing Logo" className="size-8 object-contain" />
            </div>
            <p className="text-[#0f2044] font-semibold">Timetable Generation System</p>
            <h1 className="text-2xl font-bold text-[#0f2044]">School of Computing</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#0f2044] mb-2">Officer Sign In</h2>
            <p className="text-slate-600">Access the timetable generation portal</p>
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
                  placeholder="Enter your officer email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter your officer email address to sign in
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
            </form>
          </Card>

          <p className="text-center text-sm text-slate-500 mt-6">
            <span>You will receive a secure link to your email • </span>
            <a href="mailto:timetable@babcock.edu.ng" className="text-[#ffb71b] hover:underline">
              Get help
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}