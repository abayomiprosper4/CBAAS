'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Calendar, Users, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import type { Course, Lecturer, Allocation, Assignment } from '@/types';

interface CourseWithLecturer {
  course: Course;
  lecturer: Lecturer | null;
  hours: number;
}

export default function StudentHome() {
  const { user } = useAuth();
  const [coursesWithLecturers, setCoursesWithLecturers] = useState<CourseWithLecturer[]>([]);
  const [totalUnits, setTotalUnits] = useState(0);

  useEffect(() => {
    if (!user) return;

    const courses: Course[] = JSON.parse(localStorage.getItem('courses') || '[]');
    const lecturers: Lecturer[] = JSON.parse(localStorage.getItem('lecturers') || '[]');
    const allocations: Allocation[] = JSON.parse(localStorage.getItem('allocations') || '[]');

    // For demo purposes, show all courses
    // In a real system, you'd filter by student's registered courses
    const studentCourses: CourseWithLecturer[] = courses.map((course: Course) => {
      // Find assigned lecturer from latest allocation
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
    setTotalUnits(courses.reduce((sum, c) => sum + c.units, 0));
  }, [user]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-bells-dark-blue">
          Welcome, {user?.name?.split(' ')[0] || 'Student'}!
        </h1>
        <p className="text-gray-500">View your courses and assigned lecturers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-bells-blue mr-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Courses</p>
                <h3 className="text-2xl font-bold text-bells-blue">{coursesWithLecturers.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Units</p>
                <h3 className="text-2xl font-bold text-green-600">{totalUnits}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Lecturers</p>
                <h3 className="text-2xl font-bold text-purple-600">
                  {new Set(coursesWithLecturers.filter(c => c.lecturer).map(c => c.lecturer?.id)).size}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            My Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coursesWithLecturers.length > 0 ? (
            <div className="space-y-4">
              {coursesWithLecturers.map(({ course, lecturer, hours }) => (
                <div
                  key={course.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{course.code}</h4>
                      {getStatusBadge(course.status)}
                    </div>
                    <p className="text-gray-600">{course.title}</p>
                    <p className="text-sm text-gray-500">{course.department} Department</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="secondary">{course.units} units</Badge>
                      {hours > 0 && (
                        <p className="text-sm text-gray-500 mt-1">{hours} hrs/week</p>
                      )}
                    </div>

                    {lecturer ? (
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                        <div className="w-8 h-8 rounded-full bg-bells-blue/20 flex items-center justify-center">
                          <span className="text-bells-blue font-medium text-xs">
                            {lecturer.fullName.split(' ').map(name => name[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{lecturer.fullName}</p>
                          <p className="text-xs text-gray-500">{lecturer.rank}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">
                        Not yet assigned
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No courses available.</p>
              <p className="text-sm text-gray-400">
                Course information will appear here once courses are added.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
