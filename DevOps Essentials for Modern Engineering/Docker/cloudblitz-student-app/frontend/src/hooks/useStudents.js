import { useCallback, useEffect, useState } from "react";
import { createStudent, deleteStudent, getStudents } from "../services/api";
import { getErrorMessage } from "../utils/getErrorMessage";

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load students."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const addStudent = async (studentData) => {
    try {
      setIsSubmitting(true);
      setError("");

      const newStudent = await createStudent(studentData);
      setStudents((currentStudents) => [newStudent, ...currentStudents]);
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err, "Could not add student.");
      setError(message);
      return { success: false, message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeStudent = async (studentId) => {
    try {
      setError("");
      await deleteStudent(studentId);
      setStudents((currentStudents) =>
        currentStudents.filter((student) => student.id !== studentId)
      );
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete student."));
    }
  };

  return {
    students,
    isLoading,
    isSubmitting,
    error,
    addStudent,
    removeStudent,
    loadStudents,
  };
}
