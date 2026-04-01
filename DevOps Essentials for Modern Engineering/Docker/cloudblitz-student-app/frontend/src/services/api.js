import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export async function getStudents() {
  const response = await apiClient.get("/students");
  return response.data;
}

export async function createStudent(studentData) {
  const response = await apiClient.post("/students", studentData);
  return response.data;
}

export async function deleteStudent(studentId) {
  const response = await apiClient.delete(`/students/${studentId}`);
  return response.data;
}
