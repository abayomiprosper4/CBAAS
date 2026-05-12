'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Award, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { Lecturer } from '@/types';

const RANKS = ['Professor', 'Associate Professor', 'Senior Lecturer', 'Lecturer I', 'Lecturer II', 'Assistant Lecturer'];

export default function LecturerProfilePage() {
  const { user } = useAuth();
  const [lecturer, setLecturer] = useState<Lecturer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Lecturer>>({});

useEffect(() => {
  if (!user) return;

  const lecturers: Lecturer[] = JSON.parse(localStorage.getItem('lecturers') || '[]');
  let found = lecturers.find(l => l.id === user.id);

  if (!found) {
    found = {
      id: user.id,
      fullName: user.fullName || 'New Lecturer',
      email: user.email || '',
      role: 'lecturer',
      rank: user.rank || 'Lecturer I',
      departments: [],
      specializations: [],
      // ADD THIS: Default availability to satisfy the Lecturer interface
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true
      },
      minWorkload: 3,
      maxWorkload: 12,
      expertiseRatings: {},
      preferenceRatings: {},
    } as Lecturer;

    const updatedLecturers = [...lecturers, found];
    localStorage.setItem('lecturers', JSON.stringify(updatedLecturers));
  }

  setLecturer(found);
  setFormData(found);
}, [user]);

  const handleSave = () => {
    if (!lecturer || !user) return;
    const lecturers: Lecturer[] = JSON.parse(localStorage.getItem('lecturers') || '[]');
    
    const updatedLecturer = { ...lecturer, ...formData };
    const updatedList = lecturers.map(l => l.id === user.id ? updatedLecturer : l);
    
    localStorage.setItem('lecturers', JSON.stringify(updatedList));
    setLecturer(updatedLecturer as Lecturer);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  if (!lecturer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
        <p className="text-slate-400">Loading academic profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personal Profile</h1>
          <p className="text-slate-500 text-sm">Update your academic credentials</p>
        </div>
        <Button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={isEditing ? "bg-emerald-600" : ""}>
          {isEditing ? "Save Profile" : "Edit Profile"}
        </Button>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-24 bg-gradient-to-r from-emerald-600 to-teal-500" />
        <CardContent className="relative pt-12">
          <div className="absolute -top-12 left-6 w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-3xl font-bold text-emerald-600">
            {formData.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          
          <div className="space-y-6 mt-4">
            <div className="grid gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                  <Input 
                    className="pl-10"
                    value={formData.fullName || ''} 
                    disabled={!isEditing} 
                    onChange={e => setFormData({...formData, fullName: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Email Address</label>
                <div className="px-3 py-2 bg-slate-50 border rounded-md text-sm text-slate-500 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {lecturer.email}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Academic Rank</label>
                {isEditing ? (
                  <div className="relative">
                    <Award className="absolute left-3 top-3 h-4 w-4 text-slate-300 z-10" />
                    <select 
                      className="w-full pl-10 p-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                      value={formData.rank} 
                      onChange={e => setFormData({...formData, rank: e.target.value})}
                    >
                      {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="px-3 py-2 bg-slate-50 border rounded-md text-sm text-slate-700 flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-600" /> {lecturer.rank}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}