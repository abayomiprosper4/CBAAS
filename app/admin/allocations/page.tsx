import { useState, useEffect } from 'react';
import { Play, Download, Edit2, CheckCircle, Trash2, Eye, History, BookOpen, Users, Search } from 'lucide-react';
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
import { runAllocation } from '@/lib/allocation-logic';
import type { Course, Lecturer, Assignment, Allocation } from '@/types';
import * as XLSX from 'xlsx';

export default function AdminAllocations() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedCourses = localStorage.getItem('courses');
    const storedLecturers = localStorage.getItem('lecturers');
    const storedAllocations = localStorage.getItem('allocations');

    if (storedCourses) setCourses(JSON.parse(storedCourses));
    if (storedLecturers) setLecturers(JSON.parse(storedLecturers));
    if (storedAllocations) setAllocations(JSON.parse(storedAllocations));
  }, []);

  const saveAllocations = (updatedAllocations: Allocation[]) => {
    localStorage.setItem('allocations', JSON.stringify(updatedAllocations));
    setAllocations(updatedAllocations);
  };

  const handleRunAllocation = async () => {
    if (courses.length === 0 || lecturers.length === 0) {
      toast.error('Cannot run allocation: Courses or lecturers are missing.');
      return;
    }

    setIsRunning(true);

    try {
      const result = await runAllocation(courses, lecturers);

      if (result.success) {
        const newAllocation: Allocation = {
          id: `allocation-${Date.now()}`,
          date: new Date().toISOString(),
          assignments: result.assignments,
        };

        const updatedAllocations = [newAllocation, ...allocations];
        saveAllocations(updatedAllocations);

        toast.success(result.message || 'Allocation completed successfully!');
        setSelectedAllocation(newAllocation);
        setIsModalOpen(true);
      } else {
        toast.error(result.message || 'Allocation failed');
      }
    } catch (error) {
      console.error('Allocation error:', error);
      toast.error('An error occurred during allocation.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleViewAllocation = (allocation: Allocation) => {
    setSelectedAllocation(allocation);
    setIsModalOpen(true);
  };

  const handleDeleteAllocation = (id: string) => {
    if (confirm('Are you sure you want to delete this allocation?')) {
      const updatedAllocations = allocations.filter(allocation => allocation.id !== id);
      saveAllocations(updatedAllocations);
      toast.success('Allocation deleted successfully!');
    }
  };

  const handleSaveChanges = (updatedAssignments: Assignment[]) => {
    if (selectedAllocation) {
      const updatedAllocation: Allocation = {
        ...selectedAllocation,
        assignments: updatedAssignments,
        modifiedDate: new Date().toISOString(),
        isModified: true,
      };

      const updatedAllocations = allocations.map(allocation =>
        allocation.id === updatedAllocation.id ? updatedAllocation : allocation
      );

      saveAllocations(updatedAllocations);
      setSelectedAllocation(updatedAllocation);
      toast.success('Allocation updated successfully!');
    }
  };

  const downloadAllocation = (allocation: Allocation) => {
    const rows = allocation.assignments.map(assignment => {
      const course = courses.find(c => c.id === assignment.courseId);
      const lecturer = lecturers.find(l => l.id === assignment.lecturerId);

      return {
        'Course Code': course?.code || 'Unknown',
        'Course Title': course?.title || 'Unknown',
        'Units': course?.units || 0,
        'Lecturer': lecturer?.fullName || 'Unknown',
        'Lecturer Rank': lecturer?.rank || 'Unknown',
        'Assigned Hours': assignment.hours,
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Allocation');

    const date = new Date(allocation.date);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    XLSX.writeFile(wb, `course-allocation-${formattedDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bells-dark-blue">Course Allocations</h1>
          <p className="text-gray-500">Run and manage course allocations</p>
        </div>
        <Button
          onClick={handleRunAllocation}
          disabled={isRunning}
        >
          <Play className="h-4 w-4 mr-2" />
          {isRunning ? 'Running...' : 'Run Allocation'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-bells-blue mr-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Available Courses</p>
                <h3 className="text-2xl font-bold text-bells-blue">{courses.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Registered Lecturers</p>
                <h3 className="text-2xl font-bold text-green-600">{lecturers.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <History className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Allocation History</p>
                <h3 className="text-2xl font-bold text-purple-600">{allocations.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocation History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Allocation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 hidden sm:table-cell">Assignments</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 hidden md:table-cell">Last Modified</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.length > 0 ? (
                  allocations.map((allocation) => (
                    <tr key={allocation.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(allocation.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {allocation.isModified ? (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Edit2 className="h-3 w-3 mr-1" />
                            Modified
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Original
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        {allocation.assignments.length} assignments
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {allocation.modifiedDate
                          ? new Date(allocation.modifiedDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewAllocation(allocation)}
                          >
                            <Eye className="h-4 w-4 text-bells-blue" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadAllocation(allocation)}
                          >
                            <Download className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAllocation(allocation.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      <History className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>No allocation history available.</p>
                      <p className="text-sm">Run an allocation to get started.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Results Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Allocation Results</DialogTitle>
          </DialogHeader>
          {selectedAllocation && (
            <AllocationResults
              allocation={selectedAllocation}
              courses={courses}
              lecturers={lecturers}
              onSave={handleSaveChanges}
              onDownload={() => downloadAllocation(selectedAllocation)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Allocation Results Component
interface AllocationResultsProps {
  allocation: Allocation;
  courses: Course[];
  lecturers: Lecturer[];
  onSave: (assignments: Assignment[]) => void;
  onDownload: () => void;
}

function AllocationResults({ allocation, courses, lecturers, onSave, onDownload }: AllocationResultsProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([...allocation.assignments]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setAssignments([...allocation.assignments]);
  }, [allocation]);

  const handleHoursChange = (index: number, hours: number) => {
    const newAssignments = [...assignments];
    newAssignments[index].hours = hours;
    setAssignments(newAssignments);
  };

  const handleSave = () => {
    onSave(assignments);
    setIsEditing(false);
  };

  // Calculate lecturer workloads
  const lecturerWorkloads: Record<string, { name: string; workload: number; hours: number }> = {};
  assignments.forEach(assignment => {
    const course = courses.find(c => c.id === assignment.courseId);
    const lecturer = lecturers.find(l => l.id === assignment.lecturerId);
    if (lecturer && course) {
      if (!lecturerWorkloads[lecturer.id]) {
        lecturerWorkloads[lecturer.id] = { name: lecturer.fullName, workload: 0, hours: 0 };
      }
      lecturerWorkloads[lecturer.id].workload += course.units;
      lecturerWorkloads[lecturer.id].hours += assignment.hours;
    }
  });

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const course = courses.find(c => c.id === assignment.courseId);
    const lecturer = lecturers.find(l => l.id === assignment.lecturerId);
    return (
      !searchQuery ||
      course?.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecturer?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <p className="text-sm text-gray-500">Allocation Date</p>
          <p className="font-medium">{new Date(allocation.date).toLocaleString()}</p>
        </div>
        {allocation.isModified && (
          <div>
            <p className="text-sm text-gray-500">Modified Date</p>
            <p className="font-medium">{new Date(allocation.modifiedDate!).toLocaleString()}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-gray-500">Total Assignments</p>
          <p className="font-medium">{assignments.length}</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by course or lecturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <Button onClick={handleSave}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Assignments Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Course</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Lecturer</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Hours</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Units</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssignments.map((assignment) => {
              const course = courses.find(c => c.id === assignment.courseId);
              const lecturer = lecturers.find(l => l.id === assignment.lecturerId);

              return (
                <tr key={`${assignment.courseId}-${assignment.lecturerId}`} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{course?.code}</div>
                    <div className="text-sm text-gray-500">{course?.title}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{lecturer?.fullName}</div>
                    <div className="text-sm text-gray-500">{lecturer?.rank}</div>
                  </td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <Input
                        type="number"
                        min={1}
                        value={assignment.hours}
                        onChange={(e) => handleHoursChange(
                          assignments.findIndex(a =>
                            a.courseId === assignment.courseId &&
                            a.lecturerId === assignment.lecturerId
                          ),
                          parseInt(e.target.value) || 0
                        )}
                        className="w-20"
                      />
                    ) : (
                      <span>{assignment.hours}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">{course?.units}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Lecturer Workload Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-4">Lecturer Workload Summary</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(lecturerWorkloads)
            .sort((a, b) => b[1].workload - a[1].workload)
            .map(([lecturerId, data]) => (
              <div key={lecturerId} className="bg-white p-3 rounded-md shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{data.name}</span>
                  <Badge variant="secondary">{data.workload} units</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">{data.hours} contact hours</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
