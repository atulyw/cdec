package com.cloudblitz.studentapp.student;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public List<Student> getStudents() {
        return studentService.getAllStudents();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Student createStudent(@Valid @RequestBody StudentRequest request) {
        return studentService.addStudent(request);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteStudent(@PathVariable String id) {
        studentService.deleteStudent(id);
        return Map.of("message", "Student deleted successfully.");
    }
}
