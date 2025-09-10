package in.cloudblitz.course.config;

import in.cloudblitz.course.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CourseService courseService;

    @Override
    public void run(String... args) throws Exception {
        courseService.seedDemoCourses();
    }
}
