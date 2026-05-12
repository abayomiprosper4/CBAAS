'use client';

import { useState, useEffect } from 'react';
import { Save, Info, Settings2, Weight, ShieldAlert, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import type { AllocationSettings } from '@/types';
import { cn } from '@/lib/utils';

const defaultSettings: AllocationSettings = {
  maxLecturerWorkload: 15,
  minLecturerWorkload: 3,
  expertiseWeight: 60,
  preferenceWeight: 40,
  allowOverloading: false,
  enforceAvailability: true,
  maxLecturersPerCourse: 3,
  max3UnitCoursesPerLecturer: 1,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AllocationSettings>(defaultSettings);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedSettings = localStorage.getItem('allocationSettings');
    if (storedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value),
    }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const expertiseWeight = parseInt(e.target.value);
    setSettings(prev => ({
      ...prev,
      expertiseWeight,
      preferenceWeight: 100 - expertiseWeight,
    }));
  };

  const handleSave = () => {
    if (settings.minLecturerWorkload >= settings.maxLecturerWorkload) {
      toast.error('Minimum workload must be less than maximum workload');
      return;
    }

    localStorage.setItem('allocationSettings', JSON.stringify(settings));
    setIsEditing(false);
    toast.success('Algorithm parameters updated');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Algorithm Settings</h1>
          <p className="text-muted-foreground">Fine-tune how courses are distributed across faculty.</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-slate-900">
              <Settings2 className="h-4 w-4 mr-2" />
              Edit Configuration
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Workload Constraints */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-600" />
                Workload Constraints
              </CardTitle>
              <CardDescription>Define the boundaries for unit distribution.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingInput
                label="Min Workload (Units)"
                name="minLecturerWorkload"
                value={settings.minLecturerWorkload}
                onChange={handleChange}
                disabled={!isEditing}
                helper="Minimum units per lecturer."
              />
              <SettingInput
                label="Max Workload (Units)"
                name="maxLecturerWorkload"
                value={settings.maxLecturerWorkload}
                onChange={handleChange}
                disabled={!isEditing}
                helper="Maximum units per lecturer."
              />
              <SettingInput
                label="Max Lecturers per Course"
                name="maxLecturersPerCourse"
                value={settings.maxLecturersPerCourse}
                onChange={handleChange}
                disabled={!isEditing}
                helper="Cap on co-instructors."
              />
              <SettingInput
                label="Max Sole 3-Unit Courses"
                name="max3UnitCoursesPerLecturer"
                value={settings.max3UnitCoursesPerLecturer}
                onChange={handleChange}
                disabled={!isEditing}
                helper="Limit on heavy sole assignments."
              />
            </CardContent>
          </Card>

          {/* Weight Distribution */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Weight className="h-5 w-5 text-purple-600" />
                Optimization Priority
              </CardTitle>
              <CardDescription>Balance between competency and preference.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-blue-600">{settings.expertiseWeight}%</span>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Expertise</p>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-purple-600">{settings.preferenceWeight}%</span>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Preference</p>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.expertiseWeight}
                  onChange={handleSliderChange}
                  disabled={!isEditing}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                />
                <p className="text-xs text-center text-muted-foreground italic">
                  Higher expertise weight prioritizes lecturers with higher competency ratings for specific courses.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Options & Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-50">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleOption
                id="allowOverloading"
                label="Allow Overloading"
                checked={settings.allowOverloading}
                onChange={handleChange}
                disabled={!isEditing}
                description="Exceed max units if needed."
              />
              <Separator className="bg-slate-200" />
              <ToggleOption
                id="enforceAvailability"
                label="Strict Availability"
                checked={settings.enforceAvailability}
                onChange={handleChange}
                disabled={!isEditing}
                description="Respect day-off selections."
              />
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-blue-600 text-white">
            <CardContent className="p-6 space-y-4">
              <div className="p-3 bg-white/10 rounded-xl w-fit">
                <Info className="h-5 w-5 text-blue-100" />
              </div>
              <h3 className="font-bold text-lg leading-tight">System Logic</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                The allocation engine uses a weighted scoring system. By adjusting the sliders, you change the internal cost-function that determines "optimal" matches.
              </p>
              <ul className="text-xs text-blue-200 space-y-2 list-disc pl-4">
                <li>Changes persist in your local browser session.</li>
                <li>Ensure weights total 100%.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Internal Helper: Input Field
function SettingInput({ label, name, value, onChange, disabled, helper }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <Input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
      />
      <p className="text-[11px] text-slate-500">{helper}</p>
    </div>
  );
}

// Internal Helper: Toggle Wrapper
function ToggleOption({ id, label, checked, onChange, disabled, description }: any) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id={id}
        name={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 accent-blue-600"
      />
      <div className="grid gap-1.5 leading-none">
        <label htmlFor={id} className="text-sm font-bold text-slate-900 cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}