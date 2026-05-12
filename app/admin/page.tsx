'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dices, BookOpen, Users, Clock, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Course, Lecturer, Allocation } from '@/types';

interface DashboardStats {
  totalCourses: number;
  totalLecturers: number;
  allocatedCourses: number;
  pendingCourses: number;
  totalAllocations: number;
  averageWorkload: number;
}

export default function AdminHome() {
  const router = useRouter(); // Changed from useNavigate
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalLecturers: 0,
    allocatedCourses: 0,
    pendingCourses: 0,
    totalAllocations: 0,
    averageWorkload: 0,
  });

  useEffect(() => {
    // Load data from localStorage
    const courses: Course[] = JSON.parse(localStorage.getItem('courses') || '[]');
    const lecturers: Lecturer[] = JSON.parse(localStorage.getItem('lecturers') || '[]');
    const allocations: Allocation[] = JSON.parse(localStorage.getItem('allocations') || '[]');

    const totalCourses = courses.length;
    const totalLecturers = lecturers.length;
    const totalAllocations = allocations.length;

    let allocatedCourses = 0;
    let averageWorkload = 0;
    
    if (allocations.length > 0) {
      const latestAllocation = allocations[0];
      const allocatedCourseIds = new Set(latestAllocation.assignments.map(a => a.courseId));
      allocatedCourses = allocatedCourseIds.size;

      const lecturerWorkloads: Record<string, number> = {};
      latestAllocation.assignments.forEach(assignment => {
        const course = courses.find(c => c.id === assignment.courseId);
        if (course) {
          lecturerWorkloads[assignment.lecturerId] = (lecturerWorkloads[assignment.lecturerId] || 0) + course.units;
        }
      });
      
      const workloads = Object.values(lecturerWorkloads);
      if (workloads.length > 0) {
        averageWorkload = workloads.reduce((a, b) => a + b, 0) / workloads.length;
      }
    }

    setStats({
      totalCourses,
      totalLecturers,
      allocatedCourses,
      pendingCourses: totalCourses - allocatedCourses,
      totalAllocations,
      averageWorkload: Math.round(averageWorkload * 10) / 10,
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bells-dark-blue">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome to the Course Allocation System</p>
        </div>
        <Button onClick={() => router.push('/admin/allocations')}>
          <Dices className="h-4 w-4 mr-2" />
          Run Allocation
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={<BookOpen className="h-6 w-6 text-bells-blue" />}
          color="bg-blue-50"
          textColor="text-bells-blue"
        />
        <StatCard
          title="Total Lecturers"
          value={stats.totalLecturers}
          icon={<Users className="h-6 w-6 text-purple-600" />}
          color="bg-purple-50"
          textColor="text-purple-600"
        />
        <StatCard
          title="Allocated Courses"
          value={stats.allocatedCourses}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          color="bg-green-50"
          textColor="text-green-600"
        />
        <StatCard
          title="Pending Courses"
          value={stats.pendingCourses}
          icon={<Clock className="h-6 w-6 text-orange-500" />}
          color="bg-orange-50"
          textColor="text-orange-500"
        />
        <StatCard
          title="Total Allocations"
          value={stats.totalAllocations}
          icon={<TrendingUp className="h-6 w-6 text-bells-brown" />}
          color="bg-amber-50"
          textColor="text-bells-brown"
        />
        <StatCard
          title="Avg Workload"
          value={`${stats.averageWorkload} units`}
          icon={<AlertCircle className="h-6 w-6 text-bells-gold" />}
          color="bg-yellow-50"
          textColor="text-bells-gold"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickActionCard
              title="Manage Courses"
              description="Add, edit, or remove courses from the system"
              icon={<BookOpen className="h-5 w-5" />}
              onClick={() => router.push('/admin/courses')}
              color="bg-blue-50 text-bells-blue"
            />
            <QuickActionCard
              title="View Lecturers"
              description="Browse and manage lecturer profiles"
              icon={<Users className="h-5 w-5" />}
              onClick={() => router.push('/admin/lecturers')}
              color="bg-purple-50 text-purple-600"
            />
            <QuickActionCard
              title="Run Allocation"
              description="Perform course allocation using the optimizer"
              icon={<Dices className="h-5 w-5" />}
              onClick={() => router.push('/admin/allocations')}
              color="bg-green-50 text-green-600"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">System is running properly</h4>
              <p className="text-sm text-gray-500">All components are operational</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <GettingStartedStep number={1} title="Add Courses" description="Start by adding courses with their units and specializations" />
            <GettingStartedStep number={2} title="Register Lecturers" description="Lecturers can register or be added by admins" />
            <GettingStartedStep number={3} title="Configure Settings" description="Adjust allocation parameters to your needs" />
            <GettingStartedStep number={4} title="Run Allocation" description="Execute the algorithm and review results" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, color, textColor }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${color} mr-4`}>{icon}</div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className={`text-2xl font-bold ${textColor}`}>{value}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ title, description, icon, onClick, color }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-start p-4 bg-slate-50 rounded-lg transition-all duration-300 hover:bg-slate-100 text-left w-full"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-bells-dark-blue">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </button>
  );
}

function GettingStartedStep({ number, title, description }: any) {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
        {number}
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}