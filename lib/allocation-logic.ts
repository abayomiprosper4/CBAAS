import type { Course, Lecturer, Assignment, AllocationResult, AllocationSettings } from '@/types';

/**
 * Improved Allocation Algorithm for Course Allocation System
 * Based on Linear Programming optimization principles from the research paper
 * 
 * Key Features:
 * 1. Suitability Score calculation (Expertise + Preference weights)
 * 2. Workload constraints (min/max)
 * 3. Course coverage constraints (1-3 lecturers per course)
 * 4. Specialization matching
 * 5. Load balancing
 * 6. 3-unit course sole instructor restriction
 */


// Default allocation settings
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

/**
 * Calculate suitability score for lecturer-course pairing
 * Based on expertise and preference ratings with configurable weights
 */
function calculateSuitabilityScore(
  lecturer: Lecturer,
  course: Course,
  settings: AllocationSettings
): number {
  // Get matching specializations
  const matchingSpecs = course.specializationAreas?.filter(
    spec => lecturer.specializations.includes(spec)
  ) || [];

  if (matchingSpecs.length === 0) {
    return 0; // No specialization match
  }

  // Calculate average expertise score for matching specializations
  const expertiseScores = matchingSpecs.map(
    spec => lecturer.expertiseRatings[spec] || 50
  );
  const avgExpertise = expertiseScores.reduce((sum, score) => sum + score, 0) / expertiseScores.length;

  // Calculate average preference score for matching specializations
  const preferenceScores = matchingSpecs.map(
    spec => lecturer.preferenceRatings[spec] || 50
  );
  const avgPreference = preferenceScores.reduce((sum, score) => sum + score, 0) / preferenceScores.length;

  // Normalize scores to 0-1 range
  const normalizedExpertise = avgExpertise / 100;
  const normalizedPreference = avgPreference / 100;

  // Calculate weighted suitability score
  const suitabilityScore = 
    (normalizedExpertise * settings.expertiseWeight / 100) +
    (normalizedPreference * settings.preferenceWeight / 100);

  return suitabilityScore;
}

/**
 * Apply load balancing penalty to prefer lecturers with lower current workload
 */
function applyLoadBalancingPenalty(
  baseScore: number,
  currentWorkload: number,
  maxWorkload: number
): number {
  const workloadRatio = currentWorkload / maxWorkload;
  // Penalty increases as workload approaches max
  const penalty = workloadRatio * 0.25;
  return baseScore - penalty;
}

/**
 * Apply rank-based bonus (senior lecturers get slight preference for complex courses)
 */
function applyRankBonus(
  baseScore: number,
  lecturer: Lecturer,
  course: Course
): number {
  const rankBonusMap: Record<string, number> = {
    'Professor': 0.08,
    'Associate Professor': 0.06,
    'Senior Lecturer': 0.04,
    'Lecturer I': 0.02,
    'Lecturer II': 0.01,
    'Assistant Lecturer': 0,
  };

  const bonus = rankBonusMap[lecturer.rank] || 0;
  
  // Higher bonus for 3-unit courses (more complex)
  if (course.units === 3) {
    return baseScore + (bonus * 1.5);
  }
  
  return baseScore + bonus;
}

/**
 * Check if lecturer can be assigned as sole instructor for a 3-unit course
 */
function canBeSoleInstructorFor3Unit(
  lecturer: Lecturer,
  current3UnitCount: Record<string, number>
): boolean {
  return (current3UnitCount[lecturer.id] || 0) < 1;
}

/**
 * Main allocation algorithm using greedy approach with LP-inspired optimization
 */
export async function runAllocation(
  courses: Course[],
  lecturers: Lecturer[],
  customSettings?: Partial<AllocationSettings>
): Promise<AllocationResult> {
  try {
    // 1. Merge custom settings with defaults
    const settings = { ...defaultSettings, ...customSettings };
    
    // 2. Fix: Check for window before accessing localStorage
    // This prevents "localStorage is not defined" errors on the server
    if (typeof window !== 'undefined') {
      const storedSettings = localStorage.getItem('allocationSettings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        Object.assign(settings, parsed);
      }
    }

    // Validate input data
    if (courses.length === 0) {
      return {
        success: false,
        message: "No courses available for allocation.",
        assignments: []
      };
    }

    if (lecturers.length === 0) {
      return {
        success: false,
        message: "No lecturers available for allocation.",
        assignments: []
      };
    }

    const assignments: Assignment[] = [];
    const lecturerWorkloads: Record<string, number> = {};
    const lecturer3UnitCount: Record<string, number> = {};
    const courseLecturerCount: Record<string, number> = {};
    const allocatedCourses = new Set<string>();
    const courseAssignments: Record<string, string[]> = {};

    // Initialize tracking structures
    lecturers.forEach(lecturer => {
      lecturerWorkloads[lecturer.id] = 0;
      lecturer3UnitCount[lecturer.id] = 0;
    });

    courses.forEach(course => {
      courseLecturerCount[course.id] = 0;
      courseAssignments[course.id] = [];
    });

    // Sort courses by priority:
    // 1. Higher unit courses first (3-unit > 2-unit > 1-unit)
    // 2. Compulsory courses before required and elective
    // 3. Courses with fewer eligible lecturers first
    const sortedCourses = [...courses].sort((a, b) => {
      // Priority by status: C (Compulsory) > R (Required) > E (Elective)
      const statusPriority = { 'C': 3, 'R': 2, 'E': 1 };
      const statusDiff = (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0);
      if (statusDiff !== 0) return statusDiff;

      // Priority by units (higher first)
      if (b.units !== a.units) {
        return b.units - a.units;
      }

      // Count eligible lecturers for each course
      const eligibleLecturersA = lecturers.filter(l => 
        l.specializations.some(s => a.specializationAreas?.includes(s))
      ).length;
      const eligibleLecturersB = lecturers.filter(l => 
        l.specializations.some(s => b.specializationAreas?.includes(s))
      ).length;

      return eligibleLecturersA - eligibleLecturersB;
    });

    // Phase 1: Primary allocation - assign each course to best lecturer
    for (const course of sortedCourses) {
      let bestLecturer: Lecturer | null = null;
      let bestScore = -1;

      // Find the best lecturer for this course
      for (const lecturer of lecturers) {
        // Skip if lecturer already assigned to this course
        if (courseAssignments[course.id]?.includes(lecturer.id)) {
          continue;
        }

        // Check workload capacity
        const newWorkload = lecturerWorkloads[lecturer.id] + course.units;
        if (!settings.allowOverloading && newWorkload > lecturer.maxWorkload) {
          continue;
        }

        // Check if lecturer has matching specializations
        const suitabilityScore = calculateSuitabilityScore(lecturer, course, settings);
        if (suitabilityScore === 0) {
          continue; // No specialization match
        }

        // For 3-unit courses, check sole instructor restriction
        if (course.units === 3) {
          const wouldBeSoleInstructor = !courseAssignments[course.id]?.length;
          if (wouldBeSoleInstructor && !canBeSoleInstructorFor3Unit(lecturer, lecturer3UnitCount)) {
            continue;
          }
        }

        // Apply load balancing penalty
        let adjustedScore = applyLoadBalancingPenalty(
          suitabilityScore,
          lecturerWorkloads[lecturer.id],
          lecturer.maxWorkload
        );

        // Apply rank bonus
        adjustedScore = applyRankBonus(adjustedScore, lecturer, course);

        // Prefer lecturers who haven't reached minimum workload
        if (lecturerWorkloads[lecturer.id] < lecturer.minWorkload) {
          adjustedScore += 0.1;
        }

        if (adjustedScore > bestScore) {
          bestScore = adjustedScore;
          bestLecturer = lecturer;
        }
      }

      // Assign course to best lecturer
      if (bestLecturer) {
        assignments.push({
          lecturerId: bestLecturer.id,
          courseId: course.id,
          hours: course.requiredHours
        });

        // Update tracking
        lecturerWorkloads[bestLecturer.id] += course.units;
        courseLecturerCount[course.id]++;
        allocatedCourses.add(course.id);
        
        if (!courseAssignments[course.id]) {
          courseAssignments[course.id] = [];
        }
        courseAssignments[course.id].push(bestLecturer.id);

        // Track 3-unit course assignments
        if (course.units === 3 && courseAssignments[course.id].length === 1) {
          lecturer3UnitCount[bestLecturer.id] = (lecturer3UnitCount[bestLecturer.id] || 0) + 1;
        }
      }
    }

    // Phase 2: Secondary allocation - ensure minimum workload for lecturers
    const underutilizedLecturers = lecturers.filter(
      l => lecturerWorkloads[l.id] < l.minWorkload
    );

    for (const lecturer of underutilizedLecturers) {
      // Find additional courses for this lecturer
      const availableCourses = sortedCourses.filter(course => {
        // Skip if already assigned to this lecturer
        if (courseAssignments[course.id]?.includes(lecturer.id)) {
          return false;
        }

        // Check if course needs more lecturers
        if (courseLecturerCount[course.id] >= settings.maxLecturersPerCourse) {
          return false;
        }

        // Check workload capacity
        const newWorkload = lecturerWorkloads[lecturer.id] + course.units;
        if (!settings.allowOverloading && newWorkload > lecturer.maxWorkload) {
          return false;
        }

        // Check specialization match
        const suitabilityScore = calculateSuitabilityScore(lecturer, course, settings);
        return suitabilityScore > 0;
      });

      // Sort by suitability and assign
      availableCourses.sort((a, b) => {
        const scoreA = calculateSuitabilityScore(lecturer, a, settings);
        const scoreB = calculateSuitabilityScore(lecturer, b, settings);
        return scoreB - scoreA;
      });

      for (const course of availableCourses) {
        if (lecturerWorkloads[lecturer.id] >= lecturer.minWorkload) {
          break;
        }

        // Check workload again
        const newWorkload = lecturerWorkloads[lecturer.id] + course.units;
        if (!settings.allowOverloading && newWorkload > lecturer.maxWorkload) {
          continue;
        }

        assignments.push({
          lecturerId: lecturer.id,
          courseId: course.id,
          hours: course.requiredHours
        });

        lecturerWorkloads[lecturer.id] += course.units;
        courseLecturerCount[course.id]++;
        allocatedCourses.add(course.id);
        
        if (!courseAssignments[course.id]) {
          courseAssignments[course.id] = [];
        }
        courseAssignments[course.id].push(lecturer.id);
      }
    }

    // Calculate metrics
    const unallocatedCourseList = courses.filter(c => !allocatedCourses.has(c.id));
    
    // Calculate workload fairness (coefficient of variation)
    const workloads = Object.values(lecturerWorkloads);
    const avgWorkload = workloads.reduce((a, b) => a + b, 0) / workloads.length;
    const variance = workloads.reduce((sum, w) => sum + Math.pow(w - avgWorkload, 2), 0) / workloads.length;
    const stdDev = Math.sqrt(variance);
    const workloadFairness = avgWorkload > 0 ? 1 - (stdDev / avgWorkload) : 0;

    // Calculate expertise alignment
    let expertiseAlignment = 0;
    if (assignments.length > 0) {
      const totalSuitability = assignments.reduce((sum, assignment) => {
        const lecturer = lecturers.find(l => l.id === assignment.lecturerId);
        const course = courses.find(c => c.id === assignment.courseId);
        if (lecturer && course) {
          return sum + calculateSuitabilityScore(lecturer, course, settings);
        }
        return sum;
      }, 0);
      expertiseAlignment = totalSuitability / assignments.length;
    }

    // Calculate constraint adherence
    let constraintViolations = 0;
    lecturers.forEach(lecturer => {
      const workload = lecturerWorkloads[lecturer.id];
      if (workload > lecturer.maxWorkload) constraintViolations++;
    });
    courses.forEach(course => {
      if (!allocatedCourses.has(course.id)) constraintViolations++;
    });
    const constraintAdherence = 1 - (constraintViolations / (lecturers.length + courses.length));

    // Calculate accuracy
    const accuracy = courses.length > 0 ? (allocatedCourses.size / courses.length) : 0;

    // Prepare result message
    let message = `Successfully allocated ${allocatedCourses.size} out of ${courses.length} courses.`;
    
    if (unallocatedCourseList.length > 0) {
      message += ` ${unallocatedCourseList.length} courses could not be allocated due to capacity or specialization constraints.`;
    }

    const underutilizedCount = lecturers.filter(
      l => lecturerWorkloads[l.id] < l.minWorkload && lecturerWorkloads[l.id] > 0
    ).length;

    if (underutilizedCount > 0) {
      message += ` ${underutilizedCount} lecturers are below minimum workload.`;
    }

    return {
      success: assignments.length > 0,
      message,
      assignments,
      unallocatedCourses: unallocatedCourseList,
      unallocatedLecturers: lecturers.filter(l => lecturerWorkloads[l.id] === 0),
      metrics: {
        accuracy: Math.round(accuracy * 100),
        workloadFairness: Math.round(Math.max(0, workloadFairness) * 100),
        expertiseAlignment: Math.round(expertiseAlignment * 100),
        constraintAdherence: Math.round(constraintAdherence * 100),
      }
    };

  } catch (error) {
    console.error('Error in allocation algorithm:', error);
    return {
      success: false,
      message: `Allocation failed: ${(error as Error).message}`,
      assignments: []
    };
  }
}

/**
 * Validate allocation against constraints
 */
export function validateAllocation(
  assignments: Assignment[],
  courses: Course[],
  lecturers: Lecturer[],
  settings: AllocationSettings
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  
  const lecturerWorkloads: Record<string, number> = {};
  const courseLecturerCount: Record<string, number> = {};
  const lecturer3UnitCount: Record<string, number> = {};
  const courseAssignments: Record<string, string[]> = {};

  // Initialize
  lecturers.forEach(l => {
    lecturerWorkloads[l.id] = 0;
    lecturer3UnitCount[l.id] = 0;
  });
  courses.forEach(c => {
    courseLecturerCount[c.id] = 0;
    courseAssignments[c.id] = [];
  });

  // Process assignments
  assignments.forEach(assignment => {
    const course = courses.find(c => c.id === assignment.courseId);
    const lecturer = lecturers.find(l => l.id === assignment.lecturerId);
    
    if (!course || !lecturer) return;

    lecturerWorkloads[lecturer.id] += course.units;
    courseLecturerCount[course.id]++;
    
    if (!courseAssignments[course.id]) {
      courseAssignments[course.id] = [];
    }
    courseAssignments[course.id].push(lecturer.id);

    if (course.units === 3 && courseAssignments[course.id].length === 1) {
      lecturer3UnitCount[lecturer.id]++;
    }
  });

  // Check workload constraints
  lecturers.forEach(lecturer => {
    const workload = lecturerWorkloads[lecturer.id];
    if (!settings.allowOverloading && workload > lecturer.maxWorkload) {
      violations.push(`${lecturer.fullName} exceeds maximum workload (${workload} > ${lecturer.maxWorkload})`);
    }
  });

  // Check course coverage
  courses.forEach(course => {
    const count = courseLecturerCount[course.id];
    if (count === 0) {
      violations.push(`${course.code} has no assigned lecturers`);
    } else if (count > settings.maxLecturersPerCourse) {
      violations.push(`${course.code} has too many lecturers (${count} > ${settings.maxLecturersPerCourse})`);
    }
  });

  // Check 3-unit course restriction
  lecturers.forEach(lecturer => {
    if (lecturer3UnitCount[lecturer.id] > settings.max3UnitCoursesPerLecturer) {
      violations.push(`${lecturer.fullName} is sole instructor for too many 3-unit courses`);
    }
  });

  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Generate allocation report
 */
export function generateAllocationReport(
  assignments: Assignment[],
  courses: Course[],
  lecturers: Lecturer[]
): string {
  const lecturerWorkloads: Record<string, { name: string; workload: number; courses: string[] }> = {};

  assignments.forEach(assignment => {
    const course = courses.find(c => c.id === assignment.courseId);
    const lecturer = lecturers.find(l => l.id === assignment.lecturerId);
    
    if (!lecturer || !course) return;

    if (!lecturerWorkloads[lecturer.id]) {
      lecturerWorkloads[lecturer.id] = {
        name: lecturer.fullName,
        workload: 0,
        courses: []
      };
    }

    lecturerWorkloads[lecturer.id].workload += course.units;
    lecturerWorkloads[lecturer.id].courses.push(`${course.code} (${course.units} units)`);
  });

  let report = 'COURSE ALLOCATION REPORT\n';
  report += '========================\n\n';
  report += `Total Courses: ${courses.length}\n`;
  report += `Total Lecturers: ${lecturers.length}\n`;
  report += `Total Assignments: ${assignments.length}\n\n`;

  report += 'LECTURER WORKLOADS:\n';
  report += '-------------------\n';
  
  Object.values(lecturerWorkloads)
    .sort((a, b) => b.workload - a.workload)
    .forEach(l => {
      report += `\n${l.name}\n`;
      report += `  Total Workload: ${l.workload} units\n`;
      report += `  Courses: ${l.courses.join(', ')}\n`;
    });

  return report;
}
