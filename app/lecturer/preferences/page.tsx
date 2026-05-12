'use client';

import { useState, useEffect } from 'react';
import { Star, Save, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { Lecturer } from '@/types';

const SPECIALIZATION_AREAS = [
  'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Software Engineering',
  'Database Systems', 'Computer Networks', 'Cybersecurity', 'Web Development',
  'Mobile Development', 'Cloud Computing', 'Operating Systems', 'Computer Architecture',
  'Theory of Computation', 'Algorithms', 'Programming',
];

export default function LecturerPreferencesPage() {
  const { user } = useAuth();
  const [lecturer, setLecturer] = useState<Lecturer | null>(null);
  const [expertiseRatings, setExpertiseRatings] = useState<Record<string, number>>({});
  const [preferenceRatings, setPreferenceRatings] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const lecturers: Lecturer[] = JSON.parse(localStorage.getItem('lecturers') || '[]');
    const found = lecturers.find(l => l.id === user.id);
    if (found) {
      setLecturer(found);
      setExpertiseRatings(found.expertiseRatings || {});
      setPreferenceRatings(found.preferenceRatings || {});
    }
  }, [user]);

  const handleSave = () => {
    if (!lecturer || !user) return;
    const lecturers: Lecturer[] = JSON.parse(localStorage.getItem('lecturers') || '[]');
    const updated = lecturers.map(l => l.id === user.id ? { ...l, expertiseRatings, preferenceRatings } : l);
    localStorage.setItem('lecturers', JSON.stringify(updated));
    setLecturer({ ...lecturer, expertiseRatings, preferenceRatings });
    setIsEditing(false);
    toast.success('Preferences updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Preferences</h1>
          <p className="text-slate-500 text-sm">Align your skills with the curriculum</p>
        </div>
        <Button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={isEditing ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
          {isEditing ? <><Save className="h-4 w-4 mr-2" /> Save</> : "Edit Preferences"}
        </Button>
      </div>

      <Card className="border-emerald-100 bg-emerald-50/30">
        <CardContent className="p-4 flex gap-3">
          <Info className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-xs text-slate-600 leading-relaxed">
            Ratings help the allocation algorithm match you with courses. <strong>Expertise</strong> reflects knowledge, while <strong>Preference</strong> reflects interest.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> Expertise</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {SPECIALIZATION_AREAS.map(area => (
              <div key={area} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter text-slate-500">
                  <span>{area}</span>
                  <span>{expertiseRatings[area] || 50}%</span>
                </div>
                <input 
                  type="range" disabled={!isEditing} value={expertiseRatings[area] || 50}
                  onChange={(e) => setExpertiseRatings({...expertiseRatings, [area]: parseInt(e.target.value)})}
                  className="w-full accent-emerald-600" 
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><Star className="h-4 w-4 text-emerald-500" /> Interest</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {SPECIALIZATION_AREAS.map(area => (
              <div key={area} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter text-slate-500">
                  <span>{area}</span>
                  <span>{preferenceRatings[area] || 50}%</span>
                </div>
                <input 
                  type="range" disabled={!isEditing} value={preferenceRatings[area] || 50}
                  onChange={(e) => setPreferenceRatings({...preferenceRatings, [area]: parseInt(e.target.value)})}
                  className="w-full accent-emerald-600" 
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}