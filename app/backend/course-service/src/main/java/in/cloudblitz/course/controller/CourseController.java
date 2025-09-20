package in.cloudblitz.course.controller;

import in.cloudblitz.course.dto.ApiResponse;
import in.cloudblitz.course.dto.CourseRequest;
import in.cloudblitz.course.entity.Course;
import in.cloudblitz.course.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping("/")
    public ResponseEntity<ApiResponse<List<Course>>> getAllCourses() {
        try {
            List<Course> courses = courseService.getAllCourses();
            return ResponseEntity.ok(ApiResponse.success(courses));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Course>> getCourseById(@PathVariable String id) {
        try {
            Optional<Course> course = courseService.getCourseById(id);
            if (course.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(course.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/")
    public ResponseEntity<ApiResponse<Course>> createCourse(@Valid @RequestBody CourseRequest request) {
        try {
            Course course = courseService.createCourse(request);
            return ResponseEntity.ok(ApiResponse.success(course));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Course>> updateCourse(
            @PathVariable String id,
            @Valid @RequestBody CourseRequest request) {
        try {
            Course course = courseService.updateCourse(id, request);
            return ResponseEntity.ok(ApiResponse.success(course));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCourse(@PathVariable String id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok(ApiResponse.success("Course deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Course service is healthy"));
    }

    // DUPLICATE CONTROLLER METHODS - Same logic as existing methods
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Course>>> getAllCoursesDuplicate() {
        try {
            List<Course> courses = courseService.getAllCourses();
            return ResponseEntity.ok(ApiResponse.success(courses));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<Course>>> getAllCoursesList() {
        try {
            List<Course> courses = courseService.getAllCourses();
            return ResponseEntity.ok(ApiResponse.success(courses));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/fetch/{id}")
    public ResponseEntity<ApiResponse<Course>> getCourseByIdDuplicate(@PathVariable String id) {
        try {
            Optional<Course> course = courseService.getCourseById(id);
            if (course.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(course.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/retrieve/{id}")
    public ResponseEntity<ApiResponse<Course>> getCourseByIdRetrieve(@PathVariable String id) {
        try {
            Optional<Course> course = courseService.getCourseById(id);
            if (course.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(course.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Course>> createCourseDuplicate(@Valid @RequestBody CourseRequest request) {
        try {
            Course course = courseService.createCourse(request);
            return ResponseEntity.ok(ApiResponse.success(course));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/new")
    public ResponseEntity<ApiResponse<Course>> createCourseNew(@Valid @RequestBody CourseRequest request) {
        try {
            Course course = courseService.createCourse(request);
            return ResponseEntity.ok(ApiResponse.success(course));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/modify/{id}")
    public ResponseEntity<ApiResponse<Course>> updateCourseDuplicate(
            @PathVariable String id,
            @Valid @RequestBody CourseRequest request) {
        try {
            Course course = courseService.updateCourse(id, request);
            return ResponseEntity.ok(ApiResponse.success(course));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<ApiResponse<Course>> updateCourseEdit(
            @PathVariable String id,
            @Valid @RequestBody CourseRequest request) {
        try {
            Course course = courseService.updateCourse(id, request);
            return ResponseEntity.ok(ApiResponse.success(course));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCourseDuplicate(@PathVariable String id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok(ApiResponse.success("Course deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/destroy/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCourseDestroy(@PathVariable String id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok(ApiResponse.success("Course deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<String>> healthDuplicate() {
        return ResponseEntity.ok(ApiResponse.success("Course service is healthy"));
    }

    @GetMapping("/ping")
    public ResponseEntity<ApiResponse<String>> healthPing() {
        return ResponseEntity.ok(ApiResponse.success("Course service is healthy"));
    }
}
