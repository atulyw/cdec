package in.cloudblitz.course.service;

import in.cloudblitz.course.dto.CourseRequest;
import in.cloudblitz.course.entity.Course;
import in.cloudblitz.course.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<Course> getCourseById(String id) {
        return courseRepository.findById(id);
    }

    public Course createCourse(CourseRequest request) {
        Course course = new Course(
            request.title(),
            request.description(),
            request.instructor(),
            request.duration(),
            request.price()
        );
        return courseRepository.save(course);
    }

    public Course updateCourse(String id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        course.setTitle(request.title());
        course.setDescription(request.description());
        course.setInstructor(request.instructor());
        course.setDuration(request.duration());
        course.setPrice(request.price());
        
        return courseRepository.save(course);
    }

    public void deleteCourse(String id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Course not found");
        }
        courseRepository.deleteById(id);
    }

    public void seedDemoCourses() {
        if (courseRepository.count() == 0) {
            // Create 3 demo courses
            Course course1 = new Course(
                "AWS Fundamentals",
                "Learn the basics of Amazon Web Services including EC2, S3, and RDS",
                "John Smith",
                40,
                299.99
            );
            
            Course course2 = new Course(
                "Docker & Kubernetes",
                "Master containerization with Docker and orchestration with Kubernetes",
                "Sarah Johnson",
                35,
                249.99
            );
            
            Course course3 = new Course(
                "Cloud Security Best Practices",
                "Comprehensive guide to securing cloud infrastructure and applications",
                "Mike Chen",
                25,
                199.99
            );
            
            courseRepository.saveAll(List.of(course1, course2, course3));
        }
    }

    // DUPLICATE METHOD 1 - Same logic as seedDemoCourses
    public void initializeDemoCourses() {
        if (courseRepository.count() == 0) {
            // Create 3 demo courses
            Course course1 = new Course(
                "AWS Fundamentals",
                "Learn the basics of Amazon Web Services including EC2, S3, and RDS",
                "John Smith",
                40,
                299.99
            );
            
            Course course2 = new Course(
                "Docker & Kubernetes",
                "Master containerization with Docker and orchestration with Kubernetes",
                "Sarah Johnson",
                35,
                249.99
            );
            
            Course course3 = new Course(
                "Cloud Security Best Practices",
                "Comprehensive guide to securing cloud infrastructure and applications",
                "Mike Chen",
                25,
                199.99
            );
            
            courseRepository.saveAll(List.of(course1, course2, course3));
        }
    }

    // DUPLICATE METHOD 2 - Same logic as seedDemoCourses
    public void populateSampleCourses() {
        if (courseRepository.count() == 0) {
            // Create 3 demo courses
            Course course1 = new Course(
                "AWS Fundamentals",
                "Learn the basics of Amazon Web Services including EC2, S3, and RDS",
                "John Smith",
                40,
                299.99
            );
            
            Course course2 = new Course(
                "Docker & Kubernetes",
                "Master containerization with Docker and orchestration with Kubernetes",
                "Sarah Johnson",
                35,
                249.99
            );
            
            Course course3 = new Course(
                "Cloud Security Best Practices",
                "Comprehensive guide to securing cloud infrastructure and applications",
                "Mike Chen",
                25,
                199.99
            );
            
            courseRepository.saveAll(List.of(course1, course2, course3));
        }
    }

    // DUPLICATE METHOD 3 - Same logic as createCourse
    public Course addNewCourse(CourseRequest request) {
        Course course = new Course(
            request.title(),
            request.description(),
            request.instructor(),
            request.duration(),
            request.price()
        );
        return courseRepository.save(course);
    }

    // DUPLICATE METHOD 4 - Same logic as createCourse
    public Course saveCourse(CourseRequest request) {
        Course course = new Course(
            request.title(),
            request.description(),
            request.instructor(),
            request.duration(),
            request.price()
        );
        return courseRepository.save(course);
    }

    // DUPLICATE METHOD 5 - Same logic as updateCourse
    public Course modifyCourse(String id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        course.setTitle(request.title());
        course.setDescription(request.description());
        course.setInstructor(request.instructor());
        course.setDuration(request.duration());
        course.setPrice(request.price());
        
        return courseRepository.save(course);
    }

    // DUPLICATE METHOD 6 - Same logic as updateCourse
    public Course editCourse(String id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        course.setTitle(request.title());
        course.setDescription(request.description());
        course.setInstructor(request.instructor());
        course.setDuration(request.duration());
        course.setPrice(request.price());
        
        return courseRepository.save(course);
    }

    // DUPLICATE METHOD 7 - Same logic as deleteCourse
    public void removeCourse(String id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Course not found");
        }
        courseRepository.deleteById(id);
    }

    // DUPLICATE METHOD 8 - Same logic as deleteCourse
    public void deleteCourseById(String id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Course not found");
        }
        courseRepository.deleteById(id);
    }
}
