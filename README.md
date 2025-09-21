# 🚗 AutoClaims - Claims Made Simple

A comprehensive, production-ready auto insurance claims processing system with complete workflow automation, role-based access control, and modern UI design.

![Landing Page](screenshots/1.jpg)

## ✨ Key Features

- **🔐 Complete Role-Based Workflow**: Customer, Agent, Adjuster, Manager, Admin roles with specific permissions
- **📋 Automated Claims Processing**: SUBMITTED → UNDER_REVIEW → ASSIGNED → INVESTIGATING → APPROVED → SETTLED
- **📁 Document Management**: Secure file uploads with metadata tracking
- **🔑 JWT Authentication**: Secure token-based authentication with role validation
- **⚡ Real-time Status Updates**: Live claim status tracking across all roles
- **🎨 Modern UI**: Blue/purple gradient theme with glassmorphism effects
- **📊 Role-Specific Dashboards**: Customized views for each user type
- **🔄 Workflow Visualization**: Clear process flow from submission to settlement

## 🛠️ Tech Stack

- **Backend**: FastAPI 0.104+ with async/await, Tortoise ORM, Aerich migrations
- **Database**: PostgreSQL 15 with connection pooling
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Authentication**: JWT with role-based middleware
- **Containerization**: Docker & Docker Compose with multi-stage builds
- **File Storage**: Local volumes with future S3 integration ready

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git for cloning the repository
- 8GB+ RAM recommended

### 1. Clone and Setup
```bash
git clone <repository-url>
cd AutoInsuranceClaims
```

### 2. Start All Services
```bash
# Build and start all containers in detached mode
docker-compose up -d --build
```

### 3. Initialize Database (First Time Only)
```bash
# Initialize Aerich migrations
docker exec claims_backend aerich init-db

# Verify database connection
docker exec claims_backend python -c "from tortoise import Tortoise; print('Database ready!')"
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432 (claims_user/claims_password)

## 📸 Screenshots

### Landing Page with Workflow
![Landing Page](screenshots/2.jpg)
*Modern landing page showing the complete 5-step claims processing workflow*

### Customer Dashboard
![Customer Filing New Claim](screenshots/customer_filing_newclaim.jpg)
*Customer interface for filing new claims with policy selection*

### Admin Dashboard
![Admin Dashboard](screenshots/admin_dashboard.jpg)
*Admin dashboard with complete system overview and controls*

### Adjuster Claims Management
![Adjuster Claims Service](screenshots/adjuster_claims_service_history.jpg)
*Adjuster interface showing assigned claims and investigation tools*

## 👥 User Roles & Workflow Permissions

| Role | Login Credentials | Permissions | Workflow Actions |
|------|------------------|-------------|------------------|
| **Customer** | customer@test.com / password | Submit claims, view own claims, upload documents | Create new claims (SUBMITTED) |
| **Agent** | agent@test.com / password | Review submitted claims, reject invalid claims | SUBMITTED → UNDER_REVIEW, REJECT |
| **Adjuster** | adjuster@test.com / password | Investigate assigned claims, assess damage, approve/reject | ASSIGNED → INVESTIGATING → APPROVED/REJECTED |
| **Manager** | manager@test.com / password | Assign claims to adjusters, oversee process, settle claims | UNDER_REVIEW → ASSIGNED, APPROVED → SETTLED |
| **Admin** | admin@test.com / password | Full system access, override any workflow step | Any status transition, system management |

## 🔄 Complete Claims Workflow

### Workflow States & Transitions
```mermaid
graph LR
    A[SUBMITTED] -->|Agent/Manager| B[UNDER_REVIEW]
    B -->|Manager| C[ASSIGNED]
    C -->|Adjuster| D[INVESTIGATING]
    D -->|Adjuster| E[APPROVED]
    D -->|Adjuster| F[REJECTED]
    E -->|Manager/Admin| G[SETTLED]
    A -->|Agent/Admin| F
    B -->|Agent/Manager/Admin| F
    C -->|Adjuster/Manager/Admin| F
```

### Role-Based Workflow Actions

**Customer Workflow:**
1. Submit claim with incident details → Status: SUBMITTED
2. Track claim progress through dashboard
3. View final settlement or rejection

**Agent Workflow:**
1. Review submitted claims for validity
2. Move valid claims to UNDER_REVIEW
3. Reject obviously invalid claims

**Manager Workflow:**
1. Review claims in UNDER_REVIEW status
2. Assign claims to available adjusters → Status: ASSIGNED
3. Settle approved claims → Status: SETTLED

**Adjuster Workflow:**
1. Receive assigned claims → Status: INVESTIGATING
2. Assess damage, review documentation
3. Set estimated damage amounts
4. Approve with settlement amount or reject

**Admin Workflow:**
1. Override any workflow step
2. Process final settlements
3. Manage system users and policies

## 📊 Test Data & Demo

### Pre-loaded Test Claims
The system includes **10 sample claims** in various workflow stages:

- **2 SUBMITTED** claims (ready for agent review)
- **1 UNDER_REVIEW** claim (ready for manager assignment)
- **1 ASSIGNED** claim (ready for adjuster investigation)
- **2 INVESTIGATING** claims (ready for adjuster decision)
- **2 APPROVED** claims (ready for settlement)
- **1 SETTLED** claim (completed)
- **1 REJECTED** claim (denied)

### Demo Workflow
1. **Login as Customer** → View all 10 claims
2. **Login as Agent** → See 3 claims needing review
3. **Login as Manager** → See 6 claims for assignment/settlement
4. **Login as Adjuster** → See 5 assigned claims
5. **Login as Admin** → See all 10 claims with full control

## 🚀 API Endpoints

### Authentication
- `POST /auth/register` - User registration with role assignment
- `POST /auth/login` - JWT token-based login
- `GET /auth/me` - Get current user profile

### Claims Management
- `GET /claims` - List claims (role-filtered)
- `POST /claims` - Create new claim
- `GET /claims/{id}` - Get claim details (permission-checked)
- `PUT /claims/{id}/status` - Update claim status (workflow-validated)

### Workflow & Assignment
- `GET /users/adjusters` - List available adjusters (Manager/Admin only)
- `POST /policies` - Create default policy for user
- `GET /policies` - List user policies

### Document Management
- `POST /claims/{id}/documents` - Upload claim documents
- `POST /claims/{id}/notes` - Add claim notes

### Role-Based Access Control
All endpoints implement role-based permissions:
- **Customer**: Own claims only
- **Agent**: SUBMITTED + UNDER_REVIEW claims
- **Adjuster**: Assigned claims only
- **Manager**: Claims needing assignment/settlement
- **Admin**: Full system access

## 🔧 Development Setup

### Local Development (Without Docker)

**Backend development**:
```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL="postgresql://claims_user:claims_password@localhost:5432/claims_db"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend development**:
```bash
cd frontend
npm install
npm run dev
```

### Database Operations

**Create new migration**:
```bash
docker exec claims_backend aerich migrate --name "migration_name"
```

**Apply migrations**:
```bash
docker exec claims_backend aerich upgrade
```

**Reset database** (⚠️ Development only):
```bash
docker-compose down -v
docker-compose up -d --build
docker exec claims_backend aerich init-db
```

## 🐳 Docker Commands

**View logs**:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

**Restart services**:
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

**Stop and cleanup**:
```bash
# Stop services
docker-compose down

# Stop and remove volumes (⚠️ Data loss)
docker-compose down -v
```

## ⚙️ Environment Variables

### Backend (.env)
```bash
# Database Configuration
DATABASE_URL=postgresql://claims_user:claims_password@postgres:5432/claims_db

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=/app/uploads

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME="AutoClaims Pro"
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
```

## 🚨 Troubleshooting

### Common Issues

**Port already in use**:
```bash
# Check what's using the port
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Kill the process or change ports in docker-compose.yml
```

**Database connection failed**:
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

**Frontend build errors**:
```bash
# Clear node_modules and reinstall
docker-compose down
docker system prune -f
docker-compose up -d --build
```

### Health Checks

**Backend health**:
```bash
curl http://localhost:8000/docs
```

**Database health**:
```bash
docker exec claims_postgres pg_isready -U claims_user
```

**Frontend health**:
```bash
curl http://localhost:3000
```

## 📁 Project Structure

```
AutoInsuranceClaims/
├── 🐳 docker-compose.yml     # Container orchestration
├── 📖 README.md              # This file
├── 🔧 backend/
│   ├── 📄 Dockerfile         # Backend container config
│   ├── 📋 requirements.txt   # Python dependencies
│   ├── 🗃️ models.py          # Database models (User, Claim, Policy)
│   ├── 📝 schemas.py         # Pydantic request/response schemas
│   ├── 🔐 auth.py            # JWT authentication & RBAC
│   ├── 🚀 main.py            # FastAPI application & routes
│   ├── ⚙️ aerich_config.py   # Database migration config
│   ├── 📊 pyproject.toml     # Aerich settings
│   └── 📂 migrations/        # Database migration files
├── 🎨 frontend/
│   ├── 📄 Dockerfile         # Frontend container config
│   ├── 📦 package.json       # Node.js dependencies
│   ├── ⚙️ next.config.js     # Next.js configuration
│   ├── 🎨 tailwind.config.js # Tailwind CSS config
│   ├── 📱 app/
│   │   ├── 🌐 globals.css    # Global styles
│   │   ├── 📄 layout.tsx     # Root layout
│   │   └── 🏠 page.tsx       # Landing page
│   ├── 🧩 components/        # Reusable React components
│   └── 📚 lib/
│       └── 🔐 auth.ts        # API client & auth utilities
└── 📊 volumes/
    ├── postgres_data/        # Database persistence
    └── uploads_data/         # File uploads storage
```

## ✅ Current Status: PRODUCTION READY

### ✅ Completed Features
- **Complete UI**: Landing, login, register, dashboard, claims management
- **Full Workflow**: 5-role workflow with status transitions
- **Role-Based Access**: Complete permission system
- **Claims Management**: Create, view, update, assign, approve, settle
- **Test Data**: 10 sample claims + 5 test users
- **Modern Design**: Responsive UI with gradient themes
- **Database**: PostgreSQL with proper relationships
- **Authentication**: JWT with role validation
- **Docker**: Complete containerization

### 🔄 Future Enhancements
1. **Real-time Notifications**: WebSocket integration
2. **Advanced Document Management**: File categorization, OCR
3. **Reporting & Analytics**: Claims metrics, performance dashboards
4. **Mobile App**: React Native companion app
5. **Integration APIs**: Third-party insurance systems
6. **AI/ML Features**: Fraud detection, damage assessment
7. **Testing Suite**: Unit, integration, E2E tests
8. **Performance**: Caching, indexing, optimization

## 🎮 Quick Demo Guide

### 1. Start the System
```bash
docker-compose up -d --build
```

### 2. Test Complete Workflow
1. **Customer Experience**:
   - Login: customer@test.com / password
   - View 10 existing claims in various stages
   - File a new claim

2. **Agent Review**:
   - Login: agent@test.com / password
   - See submitted claims needing review
   - Move claims to UNDER_REVIEW

3. **Manager Assignment**:
   - Login: manager@test.com / password
   - Assign claims to adjusters
   - Settle approved claims

4. **Adjuster Investigation**:
   - Login: adjuster@test.com / password
   - Investigate assigned claims
   - Approve with settlement amounts

5. **Admin Control**:
   - Login: admin@test.com / password
   - Override any workflow step
   - Complete system management

### 3. Key URLs
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review Docker logs: `docker-compose logs -f`
- Verify all containers are running: `docker ps`
- Check API documentation: http://localhost:8000/docs

---

**AutoClaims - Claims Made Simple** • A complete insurance claims processing solution with role-based workflow automation.