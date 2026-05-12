"use client";

import { useEffect, useState } from 'react';
import { BookOpen, Search, Mail, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Course, Lecturer, Allocation, Assignment } from '@/types';

interface CourseWithLecturer {
  course: Course;
  lecturer: Lecturer | null;
  hours: number;
}

export default function StudentCourses() {
  const [coursesWithLecturers, setCoursesWithLecturers] = useState<CourseWithLecturer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    const courses: Course[] = JSON.parse(localStorage.getItem('courses') || '[]');
    const lecturers: Lecturer[] = JSON.parse(localStorage.getItem('lecturers') || '[]');
    const allocations: Allocation[] = JSON.parse(localStorage.getItem('allocations') || '[]');

    const studentCourses: CourseWithLecturer[] = courses.map((course: Course) => {
      let assignedLecturer: Lecturer | null = null;
      let hours = 0;

      if (allocations.length > 0) {
        const latestAllocation = allocations[0];
        const assignment = latestAllocation.assignments.find(
          (a: Assignment) => a.courseId === course.id
        );
        if (assignment) {
          assignedLecturer = lecturers.find((l: Lecturer) => l.id === assignment.lecturerId) || null;
          hours = assignment.hours;
        }
      }

      return {
        course,
        lecturer: assignedLecturer,
        hours,
      };
    });

    setCoursesWithLecturers(studentCourses);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'C':
        return <Badge className="bg-red-100 text-red-800">Compulsory</Badge>;
      case 'R':
        return <Badge className="bg-blue-100 text-blue-800">Required</Badge>;
      case 'E':
        return <Badge className="bg-green-100 text-green-800">Elective</Badge>;
      default:
        return null;
    }
  };

  const filteredCourses = coursesWithLecturers.filter(({ course }) => {
    const matchesSearch =
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !filterStatus || course.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-bells-dark-blue">All Courses</h1>
        <p className="text-gray-500">Browse all available courses and their assigned lecturers</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(({ course, lecturer, hours }) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{course.code}</h3>
                      {getStatusBadge(course.status)}
                    </div>
                    <p className="text-gray-600">{course.title}</p>
                  </div>
                  <Badge variant="outline">{course.units} units</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {course.department} Department
                  </div>

                  {hours > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="w-4 mr-2 text-center">{hours}</span>
                      hours/week
                    </div>
                  )}

                  {lecturer ? (
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-bells-blue/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-bells-blue" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{lecturer.fullName}</p>
                          <p className="text-xs text-gray-500">{lecturer.rank}</p>
                        </div>
                      </div>
                      <a
                        href={`mailto:${lecturer.email}`}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Email lecturer"
                      >
                        <Mail className="h-4 w-4 text-gray-400" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-3 border-t">
                      <p className="text-sm text-gray-400 italic">Lecturer not yet assigned</p>
                    </div>
                  )}
                </div>

                {course.specializationAreas.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">Specializations:</p>
                    <div className="flex flex-wrap gap-1">
                      {course.specializationAreas.slice(0, 3).map((spec) => (
                        <span
                          key={spec}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                      {course.specializationAreas.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          +{course.specializationAreas.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No courses found.</p>
            <p className="text-sm text-gray-400">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
