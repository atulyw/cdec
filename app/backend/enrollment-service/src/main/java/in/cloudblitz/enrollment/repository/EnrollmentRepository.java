package in.cloudblitz.enrollment.repository;

import in.cloudblitz.enrollment.entity.Enrollment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends MongoRepository<Enrollment, String> {
    List<Enrollment> findByUserId(String userId);
    boolean existsByUserIdAndCourseId(String userId, String courseId);
}
