'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  User, 
  Shield, 
  Users, 
  RefreshCcw, 
  ShieldCheck,
  UserCheck,
  UserMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types';

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProfiles = useCallback(() => {
    setLoading(true);
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const profiles: Profile[] = registeredUsers.map((user: any) => ({
        id: user.id,
        email: user.email,
        full_name: user.fullName || 'Unknown User',
        role: user.role,
        status: user.status || 'approved',
        created_at: user.createdAt || new Date().toISOString(),
      }));
      setProfiles(profiles);
    } catch (error) {
      toast.error('Failed to load user profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleStatusUpdate = (profileId: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(profileId);

    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = registeredUsers.map((user: any) =>
        user.id === profileId ? { ...user, status: newStatus } : user
      );
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

      setProfiles(prev =>
        prev.map(profile =>
          profile.id === profileId ? { ...profile, status: newStatus } : profile
        )
      );

      toast.success(`User ${newStatus} successfully!`);
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingAdmins = profiles.filter(p => p.role === 'admin' && p.status === 'pending');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 text-sm animate-pulse">Syncing user database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:items-center sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-muted-foreground">Monitor access levels and verify new administrative staff.</p>
        </div>
        <Button onClick={fetchProfiles} variant="outline" size="sm" className="w-fit">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Pending Approvals Section */}
      {pendingAdmins.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/30 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-orange-100 bg-orange-50/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-orange-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Action Required
                </CardTitle>
                <CardDescription className="text-orange-700/70">
                  {pendingAdmins.length} administrator request(s) awaiting verification.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-orange-100">
              {pendingAdmins.map((profile) => (
                <div key={profile.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={profile.full_name} />
                    <div>
                      <div className="font-semibold text-slate-900">{profile.full_name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {profile.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                      size="sm"
                      className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusUpdate(profile.id, 'approved')}
                      disabled={actionLoading === profile.id}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleStatusUpdate(profile.id, 'rejected')}
                      disabled={actionLoading === profile.id}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Users Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>A complete list of all registered accounts.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-y border-slate-100 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Access Level</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.length > 0 ? (
                  profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={profile.full_name} size="sm" />
                          <div>
                            <div className="font-medium text-slate-900">{profile.full_name}</div>
                            <div className="text-xs text-slate-400">{profile.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={profile.role} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={profile.status} />
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        {new Date(profile.created_at).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Users className="h-10 w-10 text-slate-200" />
                        <div className="text-slate-500 font-medium">No users found</div>
                        <p className="text-xs text-slate-400">Registered users will appear here.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Internal UI Components ---

function UserAvatar({ name, size = 'md' }: { name: string, size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-orange-100 text-orange-700'];
  const colorIndex = name.length % colors.length;

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center font-bold tracking-tighter",
      size === 'sm' ? "h-8 w-8 text-[10px]" : "h-10 w-10 text-xs",
      colors[colorIndex]
    )}>
      {initials}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const configs: Record<string, { label: string, className: string, icon: any }> = {
    main_admin: { label: 'Super Admin', className: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: ShieldCheck },
    admin: { label: 'Admin', className: 'bg-blue-50 text-blue-700 border-blue-100', icon: Shield },
    lecturer: { label: 'Lecturer', className: 'bg-slate-100 text-slate-700 border-slate-200', icon: User },
    student: { label: 'Student', className: 'bg-slate-50 text-slate-500 border-slate-100', icon: User },
  };

  const config = configs[role] || { label: role, className: 'bg-gray-100', icon: User };
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1 font-medium px-2 py-0.5", config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string, className: string, icon: any }> = {
    approved: { label: 'Approved', className: 'text-green-700 bg-green-50 border-green-100', icon: CheckCircle },
    pending: { label: 'Pending', className: 'text-amber-700 bg-amber-50 border-amber-100', icon: Clock },
    rejected: { label: 'Rejected', className: 'text-red-700 bg-red-50 border-red-100', icon: XCircle },
  };

  const config = configs[status] || { label: status, className: 'bg-gray-50', icon: Clock };
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md border w-fit", config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </div>
  );
}