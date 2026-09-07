# SmartHire AI – AI-Powered Enterprise Recruitment Management System

[![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-6.x-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-46%20Passed%20(100%25)-brightgreen?style=for-the-badge&logo=junit5&logoColor=white)](https://junit.org/junit5/)

> **SmartHire AI** is a modern, enterprise-grade AI-powered Recruitment Management System built with a **Java 17 / Spring Boot 3.3.3** backend and a **React 18 / Vite** frontend. It streamlines the end-to-end recruitment lifecycle: intelligent PDF resume parsing, candidate skill vectorization, deterministic match scoring, multi-stage application pipeline progression, interview coordination with scorecards, real-time in-app notification alerts, and executive hiring analytics.

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
  - [1. Role-Based Portals (HR Recruiter & Candidate)](#1-role-based-portals-hr-recruiter--candidate)
  - [2. AI PDF Resume Parsing & Extraction Engine](#2-ai-pdf-resume-parsing--extraction-engine)
  - [3. Deterministic Skill Vector Match Scoring](#3-deterministic-skill-vector-match-scoring)
  - [4. Interview Scheduling & Multi-Factor Scorecards](#4-interview-scheduling--multi-factor-scorecards)
  - [5. Real-Time In-App Notification Drawer](#5-real-time-in-app-notification-drawer)
  - [6. Executive Recruitment Analytics Dashboard](#6-executive-recruitment-analytics-dashboard)
- [Technology Stack](#-technology-stack)
- [Database Schema & Relational Model](#-database-schema--relational-model)
- [Quick Start & Local Development](#-quick-start--local-development)
  - [Prerequisites](#prerequisites)
  - [One-Click Windows Scripts](#one-click-windows-scripts)
  - [Manual Execution](#manual-execution)
- [Docker Compose Deployment](#-docker-compose-deployment)
- [Demo Credentials](#-demo-credentials)
- [REST API Catalog & Swagger Documentation](#-rest-api-catalog--swagger-documentation)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Project Roadmap (Phases 1–5 Completed)](#-project-roadmap-phases-15-completed)
- [Author & Acknowledgments](#-author--acknowledgments)

---

## 🏛️ System Architecture

`
                                      +---------------------------------------------+
                                      |          React 18 + Vite Frontend           |
                                      |   Tailwind CSS | Lucide Icons | Axios Client  |
                                      +----------------------+----------------------+
                                                             |
                                                 REST API (JSON) / Port 5173
                                                             |
                                                             v
+-------------------------------------------------------------------------------------------------------------------+
|                                        Spring Boot 3.3.3 (Java 17) Backend                                        |
|                                                                                                                   |
|  +---------------------------+  +-------------------------------+  +-------------------------------------------+  |
|  |   Security & Identity     |  |       Core REST Controllers   |  |            AI & Extraction Engine         |  |
|  | - Spring Security 6       |  | - Auth, User & Profile APIs   |  | - Apache PDFBox Text Extraction           |  |
|  | - Stateless JWT Filter    |  | - Job Requisitions API        |  | - Skill Vectorization & Tokenizer         |  |
|  | - BCrypt Password Hashing |  | - Application Pipeline API    |  | - Deterministic Match Scoring (0-100%)    |  |
|  | - Method-level RBAC       |  | - Interview & Scorecard APIs  |  | - Gap Analysis (Matched / Missing Skills) |  |
|  | - Global Exception Advice |  | - Notification & Analytics API|  |                                           |  |
|  +---------------------------+  +-------------------------------+  +-------------------------------------------+  |
|                                                                                                                   |
|  +-------------------------------------------------------------------------------------------------------------+  |
|  |                                      Hibernate 6 / Spring Data JPA Layer                                    |  |
|  |              (10 Entities: User, Profiles, Skills, Jobs, Resumes, Applications, Interviews, Notifications)   |  |
|  +-------------------------------------------------------------------------------------------------------------+  |
+----------------------------------------------------------+--------------------------------------------------------+
                                                           |
                                               JDBC Pool (HikariCP)
                                                           |
                                                           v
                                        +--------------------------------------+
                                        |          MySQL 8.0 Database          |
                                        |    (smarthire_ai_db, 10 Entities)    |
                                        +--------------------------------------+
`

---

## ⚡ Key Features

### 1. Role-Based Portals (HR Recruiter & Candidate)
- **Dynamic Role Switcher**: Instant switching between HR Recruiter and Candidate contexts with pre-populated demo logins.
- **Candidate Portal**: Browse curated jobs with real-time multi-criteria filtering (keyword, department, location, experience, salary), one-click application submission with customized pitch notes, and live pipeline status tracking.
- **HR Recruiter Portal**: Create and manage job postings, review applicants with AI score breakdowns, advance application stages (Applied $\rightarrow$ Review $\rightarrow$ Shortlisted $\rightarrow$ Interview $\rightarrow$ Offer $\rightarrow$ Rejected), schedule interviews, and evaluate candidate scorecards.

### 2. AI PDF Resume Parsing & Extraction Engine
- Powered by **Apache PDFBox 3.0.2**, the backend securely ingests PDF resumes up to 15MB, strips formatting artifacts, and extracts raw textual tokens.
- Automatically vectorizes candidate skills against a 25+ standardized technology catalog (Java, Spring Boot, React, AWS, Docker, Kubernetes, NLP, etc.).
- Produces clean professional summaries and candidate profiles on the fly.

### 3. Deterministic Skill Vector Match Scoring
- Compares job requirements with candidate skill vectors and resume content.
- Computes an exact match percentage (0–100%) with weighted skill relevance.
- Returns comprehensive JSON match analytics detailing:
  - **Matched Skills**: Highlights strengths matching the job requisition.
  - **Missing Skills**: Explicitly identifies skill gaps to guide recruiter evaluation.
  - **Match Tier Badges**: Visually categorizes applicants into *Top Match (80-100%)*, *Good Match (50-79%)*, and *Low Match (<50%)*.

### 4. Interview Scheduling & Multi-Factor Scorecards
- **Interview Coordination**: Schedule Technical, HR, Behavioral, or System Design interviews with date-time picker, duration, and auto-generated meeting links (Google Meet / Zoom).
- **Candidate Calendar**: Candidates view scheduled interview agendas, dates, meeting links, and interviewer details.
- **Multi-Factor Scorecards**: Recruiters submit comprehensive evaluations with a 1–10 rating, pass/fail recommendations, and structured qualitative feedback.

### 5. Real-Time In-App Notification Drawer
- Header bell icon with dynamic unread badge counter.
- Slide-out notification drawer with tabbed filtering (*All* vs *Unread*).
- Instant triggers upon:
  - Application status updates (Shortlisted, Under Review, Interview Scheduled).
  - New interview calendar invites.
  - Recruiter scorecard submissions.
- One-click "Mark All as Read" action.

### 6. Executive Recruitment Analytics Dashboard
- High-level KPI summary cards: Total Applications, Active Requisitions, Interviews Scheduled, Offers Extended, and Average Match Score.
- Pipeline conversion funnel tracking candidate distribution across all recruitment stages.
- Visual breakdown of top required skills across open company requisitions.

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Backend Framework** | **Spring Boot 3.3.3** | Java 17 enterprise framework providing Web, Data JPA, Security, Actuator |
| **Security & Auth** | **Spring Security 6 + JJWT** | Stateless JWT authentication, role authorization, BCrypt hashing |
| **Database & ORM** | **MySQL 8.0 + Hibernate 6** | Relational schema, HikariCP connection pooling, indexes, constraints |
| **PDF Extraction** | **Apache PDFBox 3.0.2** | Industrial PDF text extraction and parsing engine |
| **API Documentation** | **Springdoc OpenAPI 3 (Swagger)** | Interactive Swagger UI and OpenAPI 3.0 schema generation |
| **Frontend Framework**| **React 18.3** | Component-driven UI library with hooks, portals, and context API |
| **Build Tooling** | **Vite 5.4** | Ultra-fast build tool and local development HMR server |
| **Styling & Icons** | **Tailwind CSS 3.4 + Lucide** | Modern utility-first styling and iconography |
| **HTTP Client** | **Axios 1.7** | Promise-based HTTP client with Bearer token interceptors |
| **DevOps & Containers**| **Docker & Docker Compose** | Multi-stage Dockerfiles, Nginx Alpine reverse proxy, Alpine JRE |
| **Testing** | **JUnit 5 + MockMvc** | 46 Automated unit & integration tests |

---

## 💾 Database Schema & Relational Model

The database (smarthire_ai_db) comprises **10 interconnected entities**:

1. users: Core identity (email, password hash, role: ROLE_HR, ROLE_CANDIDATE, ROLE_ADMIN, active state).
2. candidate_profiles: Candidate bio, experience years, location, education, LinkedIn, and GitHub links.
3. hr_profiles: Recruiter company profile, department, designation, and company URL.
4. skills: Standardized skills dictionary with categorized domains (Backend, Frontend, Database, DevOps, AI).
5. candidate_skills: Many-to-Many junction mapping candidate profiles to verified skills.
6. jobs: Requisition postings with salary bands, required experience, status (OPEN, CLOSED, DRAFT), and recruiter ownership.
7. job_required_skills: Many-to-Many junction mapping job requisitions to required skills.
8. 
esumes: File metadata, storage path, raw extracted text, and generated resume summary.
9. pplications: Candidate job applications with lifecycle stage, match percentage, and gap rationale.
10. interviews: Scheduled rounds with interview type, meeting link, status, 1-10 rating, and feedback notes.
11. 
otifications: In-app alerts with recipient mapping, notification type, and read timestamp.

---

## 🚀 Quick Start & Local Development

### Prerequisites
- **Java 17+** (JDK 17)
- **Maven 3.8+**
- **Node.js 18+** & **npm**
- **MySQL 8.0** running on localhost:3306

### One-Click Windows Scripts
The repository includes automated batch scripts for Windows development:
- **Start All Services**: Double-click start-servers.bat (Starts MySQL connection, Spring Boot backend on :8080, and Vite frontend on :5173).
- **Stop All Services**: Double-click stop-servers.bat.

### Manual Execution

#### 1. Configure Database
`sql
CREATE DATABASE IF NOT EXISTS smarthire_ai_db;
`

#### 2. Run Backend
`ash
cd backend
mvn clean spring-boot:run
`
*Backend runs on http://localhost:8080 and seeds demo data automatically on first launch.*

#### 3. Run Frontend
`ash
cd frontend
npm install
npm run dev
`
*Frontend runs on http://localhost:5173.*

---

## 🐳 Docker Compose Deployment

To build and run the entire multi-container production stack in a single command:

`ash
# 1. Clone the repository
git clone https://github.com/karrar123soosoo/smarthire-ai.git
cd smarthire-ai

# 2. Copy the environment configuration
cp .env.example .env

# 3. Build and launch all containers
docker compose up --build -d
`

### Access Ports:
- **Frontend Web Portal**: [http://localhost:5173](http://localhost:5173) (or http://localhost:80)
- **Backend REST API**: [http://localhost:8080](http://localhost:8080)
- **Swagger UI Documentation**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Actuator Health Diagnostics**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

---

## 🔑 Demo Credentials

The database automatically seeds two pre-configured enterprise accounts on startup:

| Portal Role | Demo Email | Password | Preloaded Sample Data |
| :--- | :--- | :--- | :--- |
| **🏢 HR Recruiter** | hr@smarthire.ai | password123 | TechNova Solutions profile, 6 published job requisitions, 2 candidate applications in pipeline, scheduled technical interviews, hiring analytics. |
| **👤 Candidate** | candidate@smarthire.ai | password123 | Alex Morgan profile (5 YOE Full-Stack Java), parsed PDF resume, submitted applications with 100% and 40% match scores, scheduled interview calendar. |

---

## 📖 REST API Catalog & Swagger Documentation

Interactive OpenAPI 3.0 documentation is accessible at **http://localhost:8080/swagger-ui.html**.

### Core API Endpoints

#### 🔐 Authentication & Identity
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | /api/v1/auth/register | Register new HR or Candidate user | Public |
| POST | /api/v1/auth/login | Authenticate and obtain JWT Bearer Token | Public |
| GET | /api/v1/auth/me | Fetch authenticated user details | Authenticated |

#### 💼 Job Requisitions
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | /api/v1/jobs | Search and filter jobs with pagination | Public |
| GET | /api/v1/jobs/{id} | Get detailed job posting with skill requirements | Public |
| POST | /api/v1/jobs | Create new job requisition | HR Only |
| PUT | /api/v1/jobs/{id} | Update existing job requisition | HR Only |
| DELETE | /api/v1/jobs/{id} | Close / Delete job requisition | HR Only |

#### 📄 AI Resume Parsing & Applications
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | /api/v1/resumes/upload | Upload PDF resume, extract text & extract skills | Candidate |
| POST | /api/v1/applications/apply | Submit job application with computed match score | Candidate |
| GET | /api/v1/applications/my-applications | List candidate's submitted applications | Candidate |
| GET | /api/v1/applications/job/{jobId} | List all applicants for a job with match metrics | HR Only |
| PATCH | /api/v1/applications/{id}/status | Update pipeline stage (Review, Shortlist, etc.) | HR Only |

#### 📅 Interviews, Scorecards & Notifications
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | /api/v1/interviews/schedule | Schedule candidate interview round | HR Only |
| GET | /api/v1/interviews/my-interviews | Get candidate's upcoming interview schedule | Candidate / HR |
| POST | /api/v1/interviews/{id}/feedback | Submit interview rating scorecard (1-10) | HR Only |
| GET | /api/v1/notifications | Fetch in-app notifications with unread count | Authenticated |
| PATCH | /api/v1/notifications/mark-read | Mark notifications as read | Authenticated |
| GET | /api/v1/analytics/dashboard | Fetch hiring metrics & pipeline conversion KPIs | HR Only |

---

## 🧪 Testing & Quality Assurance

SmartHire AI maintains a test suite covering security, business logic, resume parsing, match scoring, and controllers.

`ash
cd backend
mvn test
`

### Test Results:
`	ext
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.smarthire.AuthControllerIntegrationTests       [PASSED - 4 tests]
[INFO] Running com.smarthire.JwtTokenProviderTests               [PASSED - 4 tests]
[INFO] Running com.smarthire.UserControllerIntegrationTests      [PASSED - 5 tests]
[INFO] Running com.smarthire.JobControllerIntegrationTests       [PASSED - 7 tests]
[INFO] Running com.smarthire.ResumeControllerIntegrationTests    [PASSED - 4 tests]
[INFO] Running com.smarthire.ApplicationControllerIntegrationTests [PASSED - 8 tests]
[INFO] Running com.smarthire.InterviewControllerIntegrationTests [PASSED - 6 tests]
[INFO] Running com.smarthire.AnalyticsNotificationIntegrationTests [PASSED - 7 tests]
[INFO] Running com.smarthire.SmartHireApplicationTests          [PASSED - 1 test]
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 46, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
`

---

## 🗺️ Project Roadmap (Phases 1–5 Completed)

- [x] **Phase 1: Architecture & Foundation**
  - [x] Enterprise Spring Boot 3.3.3 + Java 17 project initialization
  - [x] Complete MySQL relational schema with 10 JPA entities
  - [x] Standardized API response format (ApiResponse<T>) & global exception handler
  - [x] Springdoc OpenAPI 3 / Swagger interactive documentation
  - [x] React 18 + Vite + Tailwind CSS responsive frontend foundation
- [x] **Phase 2: Authentication & Role Portals (HR & Candidate)**
  - [x] Stateless JWT authentication filter and token provider
  - [x] BCrypt password hashing & Spring Security 6 RBAC
  - [x] Candidate profile management with skill catalog associations
  - [x] HR Recruiter company profile management
  - [x] One-click quick demo credential switcher
- [x] **Phase 3: Job Requisition Management & Skill Indexing**
  - [x] Full CRUD REST APIs for job postings with salary validation
  - [x] Standardized skills catalog across 5 tech categories
  - [x] Candidate Job Board with multi-parameter keyword and filter queries
  - [x] HR Job Manager for creating, editing, and closing requisitions
- [x] **Phase 4: AI Skill Matching & Application Pipeline**
  - [x] One-click job application submission workflow
  - [x] Deterministic skill match vector algorithm (0–100%)
  - [x] JSON match detail generation with matched & missing skill gap breakdown
  - [x] Recruiter Candidate Review Modal with match badges and notes
  - [x] Interactive HR recruitment pipeline manager (Stage transitions)
- [x] **Phase 5: PDF Resume Parser, Interviews, Notifications & Analytics**
  - [x] Apache PDFBox 3.0.2 integration for automated PDF resume text parsing
  - [x] Instant skill extraction from resume raw text
  - [x] Interview scheduling workflow with meeting link integration
  - [x] Multi-factor interview evaluation scorecards (1–10 rating + qualitative feedback)
  - [x] Real-time in-app notification drawer with unread badges
  - [x] Executive recruitment analytics dashboard with KPIs and conversion funnel
  - [x] Multi-stage Docker & Docker Compose production setup
  - [x] Comprehensive 46/46 automated integration tests passing

---

## 👨‍💻 Author & Acknowledgments

**Developed by Karrar Raza**  
- Portfolio / GitHub: [https://github.com/karrar123soosoo](https://github.com/karrar123soosoo)
- Project: **SmartHire AI — Enterprise Recruitment Platform**
- License: MIT Open Source
