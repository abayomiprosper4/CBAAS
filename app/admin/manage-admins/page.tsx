'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  UserPlus, 
  Search,
  Mail,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function ManageAdminsPage() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load admins from localStorage
  const loadAdmins = () => {
    const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    // Filter for only admin roles
    const adminUsers = allUsers.filter((u: any) => u.role === 'admin' || u.role === 'main_admin');
    setAdmins(adminUsers);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleUpdateStatus = (adminId: string, newStatus: 'approved' | 'rejected') => {
    const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = allUsers.map((u: any) => 
      u.id === adminId ? { ...u, status: newStatus } : u
    );
    
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    loadAdmins();
    toast.success(`Admin account ${newStatus} successfully.`);
  };

  const handleMakeMainAdmin = (adminId: string) => {
    const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = allUsers.map((u: any) => 
      u.id === adminId ? { ...u, role: 'main_admin' } : u
    );
    
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    loadAdmins();
    toast.success('User promoted to Main Administrator.');
  };

  const filteredAdmins = admins.filter(admin => 
    admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Security Check: Only main_admin can manage other admins
  if (currentUser?.role !== 'main_admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <XCircle className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-slate-500">Only Main Administrators can access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Management</h1>
          <p className="text-slate-500">Review and approve administrative access requests.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search admins..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAdmins.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-slate-500">
              No admin requests found matching your criteria.
            </CardContent>
          </Card>
        ) : (
          filteredAdmins.map((admin) => (
            <Card key={admin.id} className="overflow-hidden border-slate-200 hover:border-blue-200 transition-colors">
              <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                {/* Profile Avatar Placeholder */}
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck className={`h-6 w-6 ${admin.status === 'approved' ? 'text-emerald-600' : 'text-amber-500'}`} />
                </div>

                <div className="flex-1 space-y-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h3 className="font-bold text-slate-900">{admin.fullName}</h3>
                    <Badge variant={admin.status === 'approved' ? 'default' : 'secondary'} className={admin.status === 'approved' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-100 text-amber-700'}>
                      {admin.status}
                    </Badge>
                    {admin.role === 'main_admin' && (
                      <Badge className="bg-blue-600">Main Admin</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {admin.email}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Added 2026</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {admin.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:bg-red-50 border-red-200"
                        onClick={() => handleUpdateStatus(admin.id, 'rejected')}
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleUpdateStatus(admin.id, 'approved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    </>
                  )}
                  
                  {admin.status === 'approved' && admin.role !== 'main_admin' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMakeMainAdmin(admin.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" /> Promote to Main
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}