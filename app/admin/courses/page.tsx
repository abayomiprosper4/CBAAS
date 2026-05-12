"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, BookOpen } from 'lucide-react';
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
import type { Course } from '@/types';

const SPECIALIZATION_AREAS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Software Engineering',
  'Database Systems',
  'Computer Networks',
  'Cybersecurity',
  'Web Development',
  'Mobile Development',
  'Cloud Computing',
  'Operating Systems',
  'Computer Architecture',
  'Theory of Computation',
  'Algorithms',
  'Programming',
];

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterUnits, setFilterUnits] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    const storedCourses = localStorage.getItem('courses');
    if (storedCourses) {
      setCourses(JSON.parse(storedCourses));
    }
  }, []);

  const saveCourses = (updatedCourses: Course[]) => {
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    setCourses(updatedCourses);
  };

  const handleAddCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
    };
    const updatedCourses = [...courses, newCourse];
    saveCourses(updatedCourses);
    toast.success('Course added successfully!');
    setIsModalOpen(false);
  };

  const handleEditCourse = (courseData: Course) => {
    const updatedCourses = courses.map(course =>
      course.id === courseData.id ? courseData : course
    );
    saveCourses(updatedCourses);
    toast.success('Course updated successfully!');
    setEditingCourse(null);
    setIsModalOpen(false);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      const updatedCourses = courses.filter(course => course.id !== id);
      saveCourses(updatedCourses);
      toast.success('Course deleted successfully!');
    }
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'C':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Compulsory</Badge>;
      case 'R':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Required</Badge>;
      case 'E':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Elective</Badge>;
      default:
        return null;
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment = !filterDepartment || course.department === filterDepartment;
    const matchesUnits = !filterUnits || course.units === filterUnits;
    const matchesStatus = !filterStatus || course.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesUnits && matchesStatus;
  });

  const clearFilters = () => {
    setFilterDepartment('');
    setFilterUnits('');
    setFilterStatus('');
    setSearchQuery('');
  };

  const hasFilters = filterDepartment || filterUnits || filterStatus || searchQuery;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bells-dark-blue">Courses Management</h1>
          <p className="text-gray-500">Manage courses and their requirements</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Course
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Depts</option>
                <option value="CSC">CSC</option>
                <option value="IT">IT</option>
              </select>

              <select
                value={filterUnits}
                onChange={(e) => setFilterUnits(e.target.value ? parseInt(e.target.value) : '')}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Units</option>
                <option value="1">1 Unit</option>
                <option value="2">2 Units</option>
                <option value="3">3 Units</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Status</option>
                <option value="C">Compulsory</option>
                <option value="R">Required</option>
                <option value="E">Elective</option>
              </select>

              {hasFilters && (
                <Button variant="outline" onClick={clearFilters} className="text-sm">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            All Courses ({filteredCourses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Code</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Units</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 hidden sm:table-cell">Hours</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 hidden md:table-cell">Dept</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{course.code}</td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate">{course.title}</div>
                      </td>
                      <td className="py-3 px-4">{course.units}</td>
                      <td className="py-3 px-4 hidden sm:table-cell">{course.requiredHours}</td>
                      <td className="py-3 px-4">{getStatusBadge(course.status)}</td>
                      <td className="py-3 px-4 hidden md:table-cell">{course.department}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(course)}
                          >
                            <Edit2 className="h-4 w-4 text-bells-blue" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      {courses.length === 0 ? (
                        <div>
                          <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p>No courses available.</p>
                          <p className="text-sm">Add a course to get started.</p>
                        </div>
                      ) : (
                        <p>No courses match your filters.</p>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Course Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          </DialogHeader>
          <CourseForm
            initialData={editingCourse}
            onSubmit={editingCourse ? handleEditCourse : handleAddCourse}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingCourse(null);
            }}
            existingCourses={courses}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Course Form Component
interface CourseFormProps {
  initialData: Course | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  existingCourses: Course[];
}

function CourseForm({ initialData, onSubmit, onCancel, existingCourses }: CourseFormProps) {
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    title: initialData?.title || '',
    units: initialData?.units || 3,
    requiredHours: initialData?.requiredHours || 3,
    status: initialData?.status || 'C',
    department: initialData?.department || 'CSC',
    prerequisites: initialData?.prerequisites || [],
    specializationAreas: initialData?.specializationAreas || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for duplicate course code
    const duplicate = existingCourses.find(
      c => c.code.toLowerCase() === formData.code.toLowerCase() && c.id !== initialData?.id
    );
    if (duplicate) {
      toast.error('Course code already exists');
      return;
    }

    if (initialData) {
      onSubmit({ ...formData, id: initialData.id });
    } else {
      onSubmit(formData);
    }
  };

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializationAreas: prev.specializationAreas.includes(spec)
        ? prev.specializationAreas.filter(s => s !== spec)
        : [...prev.specializationAreas, spec]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Course Code</label>
          <Input
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="CSC 401"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Units</label>
          <select
            value={formData.units}
            onChange={(e) => {
              const units = parseInt(e.target.value);
              setFormData({ ...formData, units, requiredHours: units });
            }}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value={1}>1 Unit</option>
            <option value={2}>2 Units</option>
            <option value={3}>3 Units</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Course Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter course title"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'C' | 'R' | 'E' })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="C">Compulsory</option>
            <option value="R">Required</option>
            <option value="E">Elective</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Department</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="CSC">Computer Science</option>
            <option value="IT">Information Technology</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Required Hours per Week</label>
        <Input
          type="number"
          min={1}
          max={10}
          value={formData.requiredHours}
          onChange={(e) => setFormData({ ...formData, requiredHours: parseInt(e.target.value) })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Specialization Areas</label>
        <p className="text-xs text-gray-500">Select all relevant specializations</p>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
          {SPECIALIZATION_AREAS.map((spec) => (
            <label key={spec} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.specializationAreas.includes(spec)}
                onChange={() => toggleSpecialization(spec)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{spec}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update Course' : 'Add Course'}
        </Button>
      </div>
    </form>
  );
}
