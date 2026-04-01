package com.cloudblitz.studentapp.student;

import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Student::getId).reversed())
                .toList();
    }

    public Student addStudent(StudentRequest request) {
        Student student = new Student(
                null,
                request.getName().trim(),
                request.getEmail().trim(),
                request.getCourse().trim()
        );

        return studentRepository.save(student);
    }

    public void deleteStudent(String id) {
        if (!studentRepository.existsById(id)) {
            throw new StudentNotFoundException("Student not found with id: " + id);
        }

        studentRepository.deleteById(id);
    }
}
