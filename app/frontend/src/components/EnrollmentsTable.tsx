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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
          onClick={fetchEnrollments}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No enrollments found.</p>
        <p className="text-gray-400 text-sm mt-2">
          Browse courses and enroll to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">My Enrollments</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Your course enrollments and their current status.
        </p>
      </div>
      <ul className="divide-y divide-gray-200">
        {enrollments.map((enrollment) => (
          <li key={enrollment.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {enrollment.courseTitle}
                  </p>
                  <p className="text-sm text-gray-500">
                    Enrolled on {formatDate(enrollment.enrolledAt)}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      enrollment.status
                    )}`}
                  >
                    {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
