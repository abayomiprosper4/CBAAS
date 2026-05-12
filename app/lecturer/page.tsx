"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, Award, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import type { Course, Allocation, Assignment } from "@/types";

interface AssignedCourse {
  course: Course;
  hours: number;
}

export default function LecturerHome() {
  const { user } = useAuth();
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [totalWorkload, setTotalWorkload] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    if (!user) return;

    const courses: Course[] = JSON.parse(
      localStorage.getItem("courses") || "[]",
    );
    const allocations: Allocation[] = JSON.parse(
      localStorage.getItem("allocations") || "[]",
    );

    if (allocations.length > 0) {
      const latestAllocation = allocations[0];
      const myAssignments = latestAllocation.assignments.filter(
        (a: Assignment) => a.lecturerId === user.id,
      );

      const myCourses: AssignedCourse[] = myAssignments
        .map((assignment: Assignment) => ({
          course: courses.find((c: Course) => c.id === assignment.courseId)!,
          hours: assignment.hours,
        }))
        .filter((ac: AssignedCourse) => ac.course);

      setAssignedCourses(myCourses);

      const workload = myCourses.reduce((sum, ac) => sum + ac.course.units, 0);
      const hours = myCourses.reduce((sum, ac) => sum + ac.hours, 0);

      setTotalWorkload(workload);
      setTotalHours(hours);
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "C":
        return <Badge className="bg-red-100 text-red-800">Compulsory</Badge>;
      case "R":
        return <Badge className="bg-blue-100 text-blue-800">Required</Badge>;
      case "E":
        return <Badge className="bg-green-100 text-green-800">Elective</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {user?.fullName ? user.fullName.split(" ")[0] : "Lecturer"}!
        </h1>
        <p className="text-emerald-600 font-medium text-sm">
          {user?.rank || "Lecturer"}
        </p>
        <p className="text-slate-500 text-sm mt-1">
          Here&apos;s your course allocation overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 mr-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Assigned Courses
                </p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {assignedCourses.length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 mr-4">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Total Workload
                </p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {totalWorkload}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    units
                  </span>
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 mr-4">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Contact Hours
                </p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {totalHours}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    hrs
                  </span>
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-base flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
            My Assigned Courses
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {assignedCourses.length > 0 ? (
            <div className="space-y-4">
              {assignedCourses.map(({ course, hours }) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900">
                        {course.code}
                      </h4>
                      {getStatusBadge(course.status)}
                    </div>
                    <p className="text-slate-600 text-sm font-medium">
                      {course.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {course.department} Department
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-white">
                      {course.units} units
                    </Badge>
                    <p className="text-xs font-bold text-slate-500 mt-2">
                      {hours} HRS/WEEK
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">
                No courses assigned yet.
              </p>
              <p className="text-sm text-slate-400 max-w-xs mx-auto mt-1">
                Your assignments will appear here once the admin runs the
                allocation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
