import React, { useState, useEffect } from 'react';
import { courseApi, enrollApi } from '../utils/api';
import type { ApiResponse } from '../utils/api';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number; // in hours
  price: number;
}

export const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseApi.get<Course[]>('/');
      if (response.success && response.data) {
        setCourses(response.data);
      } else {
        setError(response.error || 'Failed to fetch courses');
      }
    } catch (error) {
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      const response = await enrollApi.post<{ message: string }>('/', { courseId });
      if (response.success) {
        alert('Successfully enrolled in the course!');
      } else {
        alert(response.error || 'Failed to enroll in the course');
      }
    } catch (error) {
      alert('Failed to enroll in the course');
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchCourses}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Instructor:</span> {course.instructor}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Duration:</span> {course.duration} hours
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Price:</span> ${course.price}
            </p>
          </div>
          <button
            onClick={() => handleEnroll(course.id)}
            disabled={enrolling === course.id}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
          </button>
        </div>
      ))}
    </div>
  );
};
