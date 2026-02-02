import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { UserPlus, User, Mail, Building2, Lock } from 'lucide-react';
import { toast } from 'sonner';

export function RegisterOfficerModal({ isOpen, onClose, onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onRegister({ email, name, role, password });
    toast.success('Department Officer registered successfully!');
    
    // Reset form
    setName('');
    setEmail('');
    setRole('');
    setPassword('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setRole('');
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg border-t-4 border-t-[#ffb71b]">
        <DialogHeader className="space-y-3">
          <div className="mx-auto bg-[#0f2044] rounded-full p-3">
            <UserPlus className="size-8 text-[#ffb71b]" />
          </div>
          <DialogTitle className="text-2xl text-center text-[#0f2044]">
            Register Department Officer
          </DialogTitle>
          <DialogDescription className="text-center">
            Create a new account for a department timetable officer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullname" className="text-[#0f2044] font-semibold">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                id="fullname"
                type="text"
                placeholder="e.g., Dr. John Adeyemi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#0f2044] font-semibold">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="officer@babcock.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-[#0f2044] font-semibold">
              Role <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 z-10" />
              <Select 
                value={role} 
                onValueChange={(value) => setRole(value)}
              >
                <SelectTrigger 
                  id="role" 
                  className="pl-10"
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Information Systems">Information Systems</SelectItem>
                  <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#0f2044] font-semibold">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="bg-blue-500 rounded-full p-1.5 h-fit">
                <svg className="size-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p className="text-xs text-blue-800">
                The officer will receive an email with login credentials to access the Department Officer Dashboard.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#0f2044] hover:bg-[#0f2044]/90 text-white font-semibold"
            >
              <UserPlus className="mr-2 size-4" />
              Register Officer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}