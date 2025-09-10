import React, { useState, useEffect } from 'react';
import { enrollApi } from '../utils/api';

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'cancelled';
}

export const EnrollmentsTable: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await enrollApi.get<Enrollment[]>('/');
      if (response.success && response.data) {
        setEnrollments(response.data);
      } else {
        setError(response.error || 'Failed to fetch enrollments');
      }
    } catch (error) {
      setError('Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'completed':
        return 'badge-primary';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'badge-warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCourseIcon = (title: string) => {
    if (title.toLowerCase().includes('aws')) return '☁️';
    if (title.toLowerCase().includes('docker')) return '🐳';
    if (title.toLowerCase().includes('kubernetes')) return '⚙️';
    return '📚';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your enrollments...</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load enrollments</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchEnrollments}
            className="btn btn-primary btn-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="card p-12 max-w-md mx-auto">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No enrollments yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't enrolled in any courses yet. Browse our available courses and start your learning journey!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary btn-md"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {enrollments.filter(e => e.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {enrollments.filter(e => e.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments List */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Course Enrollments</h3>
          <p className="text-sm text-gray-600 mt-1">Track your learning progress and course status</p>
        </div>
        <div className="divide-y divide-gray-200">
          {enrollments.map((enrollment, index) => (
            <div key={enrollment.id} className="p-6 hover:bg-gray-50 transition-colors animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center text-xl">
                    {getCourseIcon(enrollment.courseTitle)}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{enrollment.courseTitle}</h4>
                    <p className="text-sm text-gray-600">Enrolled on {formatDate(enrollment.enrolledAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`badge ${getStatusBadge(enrollment.status)} flex items-center space-x-1`}>
                    {getStatusIcon(enrollment.status)}
                    <span>{enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
