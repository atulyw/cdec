import React, { useState, useEffect } from 'react';
import { courseApi, enrollApi } from '../utils/api';

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

  const getCourseIcon = (title: string) => {
    if (title.toLowerCase().includes('aws')) return '☁️';
    if (title.toLowerCase().includes('docker')) return '🐳';
    if (title.toLowerCase().includes('kubernetes')) return '⚙️';
    return '📚';
  };

  const getCourseGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600'
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load courses</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCourses}
            className="btn btn-primary btn-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course, index) => (
        <div key={course.id} className="card-hover p-6 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          {/* Course Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={`h-12 w-12 bg-gradient-to-r ${getCourseGradient(index)} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
              {getCourseIcon(course.title)}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">${course.price}</div>
              <div className="text-sm text-gray-500">One-time</div>
            </div>
          </div>

          {/* Course Content */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{course.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{course.description}</p>
            
            {/* Course Details */}
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Instructor:</span>
                <span className="ml-1">{course.instructor}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Duration:</span>
                <span className="ml-1">{course.duration} hours</span>
              </div>
            </div>
          </div>

          {/* Enroll Button */}
          <button
            onClick={() => handleEnroll(course.id)}
            disabled={enrolling === course.id}
            className="btn btn-primary btn-lg w-full"
          >
            {enrolling === course.id ? (
              <div className="flex items-center justify-center">
                <div className="spinner h-4 w-4 mr-2"></div>
                Enrolling...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Enroll Now
              </div>
            )}
          </button>
        </div>
      ))}
    </div>
  );
};
