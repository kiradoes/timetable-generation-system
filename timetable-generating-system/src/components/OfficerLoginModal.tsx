import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { LogIn, Mail, Lock } from 'lucide-react';

export function OfficerLoginModal({ isOpen, onClose, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    onLogin(email);
    // Reset form
    setEmail('');
    setPassword('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-t-4 border-t-[#ffb71b]">
        <DialogHeader className="space-y-3">
          <div className="mx-auto bg-[#0f2044] rounded-full p-3">
            <LogIn className="size-8 text-[#ffb71b]" />
          </div>
          <DialogTitle className="text-2xl text-center text-[#0f2044]">
            Timetable Officer Login
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter your credentials to access the administrative dashboard
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="officer-email" className="text-[#0f2044] font-semibold">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                id="officer-email"
                type="email"
                placeholder="officer@babcock.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="officer-password" className="text-[#0f2044] font-semibold">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                id="officer-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]"
              />
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full bg-[#0f2044] hover:bg-[#0f2044]/90 text-white py-6 text-base font-semibold"
          >
            <Lock className="mr-2 size-4" />
            Login to Dashboard
          </Button>
        </form>

        {/* Footer Note */}
        <p className="text-xs text-center text-slate-500 mt-4">
          This area is restricted to authorized timetable officers only
        </p>
      </DialogContent>
    </Dialog>
  );
}