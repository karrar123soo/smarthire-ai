package com.smarthire.config;

import com.smarthire.model.entity.*;
import com.smarthire.model.enums.*;
import com.smarthire.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final HRProfileRepository hrProfileRepository;
    private final SkillRepository skillRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ResumeRepository resumeRepository;
    private final InterviewRepository interviewRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void run(String... args) {
        seedSkills();
        seedDemoUsersAndJobs();
        seedDemoApplications();
        seedDemoResumesAndInterviews();
    }

    private void seedSkills() {
        if (skillRepository.count() == 0) {
            log.info("Seeding initial skills catalog...");
            List<Skill> defaultSkills = List.of(
                    Skill.builder().name("Java").category("Backend").build(),
                    Skill.builder().name("Spring Boot").category("Backend").build(),
                    Skill.builder().name("Hibernate / JPA").category("Backend").build(),
                    Skill.builder().name("Python").category("Backend & AI").build(),
                    Skill.builder().name("Node.js").category("Backend").build(),
                    Skill.builder().name("React").category("Frontend").build(),
                    Skill.builder().name("TypeScript").category("Frontend").build(),
                    Skill.builder().name("JavaScript").category("Frontend").build(),
                    Skill.builder().name("Tailwind CSS").category("Frontend").build(),
                    Skill.builder().name("Next.js").category("Frontend").build(),
                    Skill.builder().name("MySQL").category("Database").build(),
                    Skill.builder().name("PostgreSQL").category("Database").build(),
                    Skill.builder().name("MongoDB").category("Database").build(),
                    Skill.builder().name("Redis").category("Database & Cache").build(),
                    Skill.builder().name("Docker").category("DevOps & Cloud").build(),
                    Skill.builder().name("Kubernetes").category("DevOps & Cloud").build(),
                    Skill.builder().name("AWS").category("DevOps & Cloud").build(),
                    Skill.builder().name("CI/CD Pipelines").category("DevOps & Cloud").build(),
                    Skill.builder().name("RESTful APIs").category("API & Architecture").build(),
                    Skill.builder().name("Microservices").category("API & Architecture").build(),
                    Skill.builder().name("Machine Learning").category("AI & Data Science").build(),
                    Skill.builder().name("Natural Language Processing").category("AI & Data Science").build(),
                    Skill.builder().name("TensorFlow / PyTorch").category("AI & Data Science").build(),
                    Skill.builder().name("Git / GitHub").category("Tools").build(),
                    Skill.builder().name("Agile / Scrum").category("Management").build()
            );
            skillRepository.saveAll(defaultSkills);
            log.info("Successfully seeded {} skills", defaultSkills.size());
        }
    }

    private void seedDemoUsersAndJobs() {
        // 1. Seed Demo HR Recruiter
        User hrUser = userRepository.findByEmail("hr@smarthire.ai").orElseGet(() -> {
            log.info("Creating demo HR recruiter account (hr@smarthire.ai)...");
            User user = User.builder()
                    .email("hr@smarthire.ai")
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Sarah Jenkins")
                    .phoneNumber("+1-555-0199")
                    .role(Role.ROLE_HR)
                    .active(true)
                    .build();
            User savedHr = userRepository.save(user);

            HRProfile hrProfile = HRProfile.builder()
                    .user(savedHr)
                    .companyName("TechNova Solutions")
                    .companyWebsite("https://technova.example.com")
                    .companyDescription("Global leader in enterprise cloud architecture and AI innovations.")
                    .department("Engineering Talent Acquisition")
                    .designation("Senior Talent Lead")
                    .build();
            hrProfileRepository.save(hrProfile);
            return savedHr;
        });

        // 2. Seed Demo Candidate
        if (!userRepository.existsByEmail("candidate@smarthire.ai")) {
            log.info("Creating demo candidate account (candidate@smarthire.ai)...");
            User candidateUser = User.builder()
                    .email("candidate@smarthire.ai")
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Alex Morgan")
                    .phoneNumber("+1-555-0144")
                    .role(Role.ROLE_CANDIDATE)
                    .active(true)
                    .build();
            User savedCandidate = userRepository.save(candidateUser);

            Set<Skill> candidateSkills = new HashSet<>();
            for (String sName : List.of("Java", "Spring Boot", "React", "MySQL", "Docker", "RESTful APIs", "Hibernate / JPA")) {
                skillRepository.findByNameIgnoreCase(sName).ifPresent(candidateSkills::add);
            }

            CandidateProfile candidateProfile = CandidateProfile.builder()
                    .user(savedCandidate)
                    .headline("Senior Full-Stack Java & Cloud Engineer")
                    .summary("Experienced full-stack engineer with 5+ years building scalable microservices and modern React applications.")
                    .yearsOfExperience(5)
                    .location("San Francisco, CA (Remote)")
                    .education("B.S. in Computer Science - University of California")
                    .linkedinUrl("https://linkedin.com/in/alex-morgan-dev")
                    .githubUrl("https://github.com/alex-morgan-dev")
                    .skills(candidateSkills)
                    .build();
            candidateProfileRepository.save(candidateProfile);
        }

        // 3. Seed Demo Job Requisitions under HR Recruiter
        if (jobRepository.count() == 0) {
            log.info("Seeding initial tech job requisitions under TechNova Solutions...");

            List<JobSeedItem> seedList = List.of(
                    new JobSeedItem(
                            "Senior Full-Stack Java Engineer",
                            "Join TechNova Solutions to architect scalable microservices backend with Spring Boot 3 and responsive React frontends. You will lead technical design, optimize database transactions, and collaborate in an agile environment.",
                            "Backend Engineering",
                            "San Francisco, CA (Remote)",
                            JobType.FULL_TIME,
                            5,
                            new BigDecimal("135000"),
                            new BigDecimal("170000"),
                            JobStatus.OPEN,
                            List.of("Java", "Spring Boot", "React", "MySQL", "Docker", "RESTful APIs", "Hibernate / JPA")
                    ),
                    new JobSeedItem(
                            "Cloud DevOps & Kubernetes Architect",
                            "We are seeking a senior Cloud Architect to maintain high-availability infrastructure on AWS with automated CI/CD pipelines, Kubernetes orchestration, Terraform IaC, and zero-downtime deployments.",
                            "Cloud & Infrastructure",
                            "Austin, TX (Hybrid)",
                            JobType.FULL_TIME,
                            6,
                            new BigDecimal("145000"),
                            new BigDecimal("185000"),
                            JobStatus.OPEN,
                            List.of("AWS", "Docker", "Kubernetes", "CI/CD Pipelines", "Microservices")
                    ),
                    new JobSeedItem(
                            "Lead React & TypeScript Developer",
                            "Drive the evolution of our customer-facing web applications. Implement modern UI/UX design systems, optimize Core Web Vitals, and build maintainable state architectures using React 18, TypeScript, and Tailwind CSS.",
                            "Frontend Engineering",
                            "New York, NY (Remote)",
                            JobType.FULL_TIME,
                            4,
                            new BigDecimal("125000"),
                            new BigDecimal("155000"),
                            JobStatus.OPEN,
                            List.of("React", "TypeScript", "JavaScript", "Tailwind CSS", "RESTful APIs")
                    ),
                    new JobSeedItem(
                            "AI & Natural Language Processing Engineer",
                            "Design and deploy domain-specific NLP models for automated document understanding, entity recognition, and semantic search integration. Experience with Python, PyTorch, Hugging Face, and Vector DBs preferred.",
                            "Artificial Intelligence",
                            "San Francisco, CA",
                            JobType.FULL_TIME,
                            4,
                            new BigDecimal("155000"),
                            new BigDecimal("195000"),
                            JobStatus.OPEN,
                            List.of("Python", "Machine Learning", "Natural Language Processing", "TensorFlow / PyTorch")
                    ),
                    new JobSeedItem(
                            "Backend Python & Microservices Developer",
                            "Build high-throughput REST APIs and asynchronous worker pipelines using Python, FastAPI, MongoDB, and Redis caching. Support event-driven communication and third-party API integrations.",
                            "Backend Engineering",
                            "Seattle, WA (Remote)",
                            JobType.CONTRACT,
                            3,
                            new BigDecimal("115000"),
                            new BigDecimal("145000"),
                            JobStatus.OPEN,
                            List.of("Python", "RESTful APIs", "Microservices", "MongoDB", "Redis")
                    ),
                    new JobSeedItem(
                            "Associate Java Backend Developer",
                            "Great opportunity for early-career developers looking to grow. Develop clean RESTful microservices in Java 17 and Spring Boot, write unit and integration tests, and collaborate with experienced engineering mentors.",
                            "Software Engineering",
                            "Denver, CO",
                            JobType.FULL_TIME,
                            2,
                            new BigDecimal("85000"),
                            new BigDecimal("110000"),
                            JobStatus.OPEN,
                            List.of("Java", "Spring Boot", "MySQL", "Git / GitHub")
                    )
            );

            for (JobSeedItem item : seedList) {
                Set<Skill> skills = new HashSet<>();
                for (String s : item.skills) {
                    skillRepository.findByNameIgnoreCase(s).ifPresent(skills::add);
                }

                Job job = Job.builder()
                        .title(item.title)
                        .description(item.description)
                        .department(item.department)
                        .location(item.location)
                        .jobType(item.jobType)
                        .experienceYearsRequired(item.experienceYears)
                        .minSalary(item.minSalary)
                        .maxSalary(item.maxSalary)
                        .status(item.status)
                        .postedBy(hrUser)
                        .requiredSkills(skills)
                        .build();

                jobRepository.save(job);
            }
            log.info("Successfully seeded 6 tech job requisitions under TechNova Solutions");
        }
    }

    private void seedDemoApplications() {
        if (applicationRepository.count() == 0) {
            log.info("Seeding demo applications for candidate Alex Morgan...");
            User candidate = userRepository.findByEmail("candidate@smarthire.ai").orElse(null);
            if (candidate == null) return;

            List<Job> allJobs = jobRepository.findAll();
            if (allJobs.isEmpty()) return;

            // Application 1: Senior Full-Stack Java Engineer -> SHORTLISTED
            Job javaJob = allJobs.stream()
                    .filter(j -> j.getTitle().contains("Java"))
                    .findFirst()
                    .orElse(allJobs.get(0));

            Application app1 = Application.builder()
                    .job(javaJob)
                    .candidate(candidate)
                    .status(ApplicationStatus.SHORTLISTED)
                    .matchScore(100.0)
                    .candidateNotes("Excited to apply! I have 5+ years of experience building Spring Boot microservices and React frontends.")
                    .hrNotes("Strong technical alignment. Resume matches all core stack requirements.")
                    .matchDetailsJson("{\"matchedSkills\":[\"Java\",\"Spring Boot\",\"React\",\"MySQL\",\"Docker\",\"RESTful APIs\",\"Hibernate / JPA\"],\"missingSkills\":[],\"matchPercentage\":100.0}")
                    .build();
            applicationRepository.save(app1);

            // Application 2: Cloud DevOps & Kubernetes Architect -> UNDER_REVIEW
            if (allJobs.size() > 1) {
                Job devOpsJob = allJobs.get(1);
                Application app2 = Application.builder()
                        .job(devOpsJob)
                        .candidate(candidate)
                        .status(ApplicationStatus.UNDER_REVIEW)
                        .matchScore(40.0)
                        .candidateNotes("Applying with strong containerization and cloud experience.")
                        .hrNotes("Reviewing cloud architecture portfolio.")
                        .matchDetailsJson("{\"matchedSkills\":[\"Docker\"],\"missingSkills\":[\"AWS\",\"Kubernetes\",\"CI/CD Pipelines\",\"Microservices\"],\"matchPercentage\":40.0}")
                        .build();
                applicationRepository.save(app2);
            }

            log.info("Successfully seeded demo applications in recruitment pipeline");
        }
    }

    private void seedDemoResumesAndInterviews() {
        User candidate = userRepository.findByEmail("candidate@smarthire.ai").orElse(null);
        User hrUser = userRepository.findByEmail("hr@smarthire.ai").orElse(null);

        if (candidate != null && resumeRepository.count() == 0) {
            log.info("Seeding demo parsed resume for Alex Morgan...");
            String resumeText = "ALEX MORGAN\n" +
                    "San Francisco, CA | alex.morgan@example.com | +1-555-0144\n" +
                    "Senior Full-Stack Java & Cloud Engineer\n\n" +
                    "PROFESSIONAL SUMMARY\n" +
                    "Results-oriented Senior Software Engineer with 5+ years of experience in enterprise backend systems with Spring Boot, Java 17, React, Hibernate JPA, MySQL, Docker, and RESTful APIs.\n\n" +
                    "SKILLS\n" +
                    "Java, Spring Boot, Hibernate / JPA, React, TypeScript, MySQL, Docker, RESTful APIs, Git / GitHub, Microservices\n\n" +
                    "EDUCATION\n" +
                    "B.S. in Computer Science - University of California (2018 - 2022)";

            Resume demoResume = Resume.builder()
                    .candidate(candidate)
                    .fileName("Alex_Morgan_Senior_FullStack_Resume.pdf")
                    .fileType("application/pdf")
                    .fileSize(142500L)
                    .filePath("uploads/resumes/demo_alex_morgan_resume.pdf")
                    .rawText(resumeText)
                    .extractedSummary("Experienced Senior Full-Stack Java & Cloud Engineer with 5+ years building scalable microservices and React frontends.")
                    .build();
            resumeRepository.save(demoResume);
        }

        if (candidate != null && hrUser != null && interviewRepository.count() == 0) {
            List<Application> apps = applicationRepository.findAll();
            if (!apps.isEmpty()) {
                Application firstApp = apps.get(0);
                log.info("Seeding scheduled interview for application #{}...", firstApp.getId());

                Interview demoInterview = Interview.builder()
                        .application(firstApp)
                        .interviewer(hrUser)
                        .interviewDateTime(LocalDateTime.now().plusDays(2).withHour(14).withMinute(0))
                        .durationMinutes(45)
                        .interviewType(InterviewType.TECHNICAL)
                        .meetingLink("https://meet.google.com/smh-tech-arch")
                        .status(InterviewStatus.SCHEDULED)
                        .feedback("Initial screening cleared. Technical system design round scheduled.")
                        .build();
                interviewRepository.save(demoInterview);

                // Notification
                Notification notif1 = Notification.builder()
                        .recipient(candidate)
                        .title("Interview Scheduled: " + firstApp.getJob().getTitle())
                        .message("Your Technical System Design interview is scheduled for Friday at 2:00 PM. Meeting Link: https://meet.google.com/smh-tech-arch")
                        .type(NotificationType.INTERVIEW_SCHEDULED)
                        .isRead(false)
                        .build();
                notificationRepository.save(notif1);

                Notification notif2 = Notification.builder()
                        .recipient(hrUser)
                        .title("Interview Confirmed")
                        .message("Technical interview with Alex Morgan for " + firstApp.getJob().getTitle() + " has been added to your calendar.")
                        .type(NotificationType.SYSTEM_NOTICE)
                        .isRead(false)
                        .build();
                notificationRepository.save(notif2);
            }
        }
    }

    private record JobSeedItem(
            String title,
            String description,
            String department,
            String location,
            JobType jobType,
            int experienceYears,
            BigDecimal minSalary,
            BigDecimal maxSalary,
            JobStatus status,
            List<String> skills
    ) {}
}
