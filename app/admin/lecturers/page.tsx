'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Mail, X, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Lecturer } from '@/types';
import { cn } from '@/lib/utils';

export default function AdminLecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterRank, setFilterRank] = useState<string>('');

  useEffect(() => {
    const storedLecturers = localStorage.getItem('lecturers');
    if (storedLecturers) {
      setLecturers(JSON.parse(storedLecturers));
    }
  }, []);

  const saveLecturers = (updatedLecturers: Lecturer[]) => {
    localStorage.setItem('lecturers', JSON.stringify(updatedLecturers));
    setLecturers(updatedLecturers);
  };

  const handleViewDetails = (lecturer: Lecturer) => {
    setSelectedLecturer(lecturer);
    setIsModalOpen(true);
  };

  const handleDeleteLecturer = (id: string) => {
    // In a production Next.js app, you'd use a custom Alert Dialog component here
    if (window.confirm('Are you sure you want to delete this lecturer? This action cannot be undone.')) {
      const updatedLecturers = lecturers.filter(lecturer => lecturer.id !== id);
      saveLecturers(updatedLecturers);
      toast.success('Lecturer removed successfully');
    }
  };

  const filteredLecturers = lecturers.filter(lecturer => {
    const matchesSearch =
      lecturer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecturer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment = !filterDepartment || lecturer.departments.includes(filterDepartment);
    const matchesRank = !filterRank || lecturer.rank === filterRank;

    return matchesSearch && matchesDepartment && matchesRank;
  });

  const clearFilters = () => {
    setFilterDepartment('');
    setFilterRank('');
    setSearchQuery('');
  };

  const hasFilters = filterDepartment || filterRank || searchQuery;
  const uniqueRanks = Array.from(new Set(lecturers.map(l => l.rank)));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lecturers Management</h1>
        <p className="text-muted-foreground">View and manage faculty profiles and specializations.</p>
      </div>

      {/* Filters Card */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                <option value="CSC">CSC</option>
                <option value="IT">IT</option>
              </select>

              <select
                value={filterRank}
                onChange={(e) => setFilterRank(e.target.value)}
                className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Ranks</option>
                {uniqueRanks.map(rank => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>

              {hasFilters && (
                <Button variant="ghost" onClick={clearFilters} className="text-slate-500 hover:text-slate-900">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Faculty Members ({filteredLecturers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Lecturer</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">Rank</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Dept.</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">Units Range</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLecturers.length > 0 ? (
                  filteredLecturers.map((lecturer) => (
                    <tr key={lecturer.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-blue-700 font-bold text-xs">
                              {lecturer.fullName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="font-semibold text-slate-900">{lecturer.fullName}</div>
                            <div className="text-xs text-slate-500">{lecturer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 hidden sm:table-cell">
                        <Badge variant="outline" className="bg-white font-medium text-slate-600">{lecturer.rank}</Badge>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell text-sm text-slate-600 font-medium">
                        {lecturer.departments.join(', ')}
                      </td>
                      <td className="py-4 px-6 hidden lg:table-cell text-sm text-slate-600 font-medium">
                        {lecturer.minWorkload} - {lecturer.maxWorkload}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(lecturer)} className="hover:text-blue-600">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`mailto:${lecturer.email}`} className="hover:text-amber-600">
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteLecturer(lecturer.id)} className="hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="h-10 w-10 text-slate-200 mb-4" />
                        <p className="text-slate-500 font-medium">No lecturers found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Lecturer Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Lecturer Profile</DialogTitle>
          </DialogHeader>
          {selectedLecturer && <LecturerDetails lecturer={selectedLecturer} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LecturerDetails({ lecturer }: { lecturer: Lecturer }) {
  return (
    <div className="space-y-8 pt-4">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
          <span className="text-white font-bold text-2xl">
            {lecturer.fullName.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{lecturer.fullName}</h3>
          <p className="text-slate-500 font-medium">{lecturer.email}</p>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100">{lecturer.rank}</Badge>
            <Badge variant="outline" className="text-slate-500">{lecturer.departments.join(' / ')}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Workload</span>
          <p className="text-lg font-bold text-slate-900 mt-1">{lecturer.minWorkload} - {lecturer.maxWorkload} Units</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Main Departments</span>
          <p className="text-lg font-bold text-slate-900 mt-1">{lecturer.departments.join(', ')}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          Specializations & Skills
        </h4>
        <div className="flex flex-wrap gap-2">
          {lecturer.specializations.map((spec) => (
            <Badge key={spec} variant="secondary" className="bg-white border-slate-200 text-slate-600 px-3 py-1">
              {spec}
            </Badge>
          ))}
        </div>
      </div>

      {/* Expertise Ratings */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900">Competency Ratings</h4>
        <div className="grid gap-3">
          {Object.entries(lecturer.expertiseRatings).map(([area, rating]) => (
            <div key={area} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">{area}</span>
                <span className="text-blue-600">{rating}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${rating}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3">Teaching Availability</h4>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(lecturer.availability).map(([day, available]) => (
            <div
              key={day}
              className={cn(
                "p-3 rounded-xl text-center text-xs font-bold transition-colors",
                available 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-slate-50 text-slate-300 border border-slate-100 line-through'
              )}
            >
              {day.substring(0, 3).toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}