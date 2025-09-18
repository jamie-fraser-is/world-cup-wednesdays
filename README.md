# World Cup Wednesdays

A fortnightly competition platform where participants submit entries for bracket-style tournaments on various topics. Built with React, Node.js, and PostgreSQL, fully containerized with Docker.

## 🏆 Features

### Core Competition System
- **Fortnightly Tournaments**: Regular bracket-style competitions on various topics
- **16-Entry Brackets**: Full tournament progression from Round of 16 to Final
- **Real-time Voting**: Live voting with WebSocket updates
- **Fair Voting**: Vote counts hidden until round completion
- **Automatic Tie-breaking**: Transparent coin flip resolution for tied matches

### User Management
- **Role-based Access**: Admin, Host, and Participant roles
- **JWT Authentication**: Secure token-based authentication
- **User Statistics**: Win rates, participation tracking, and leaderboards
- **Host Rotation**: Automatic host selection with cooldown periods

### Advanced Features
- **AI Entry Generation**: Automatically fill brackets with AI-generated entries
- **Admin Portal**: Complete competition and user management
- **Entry Collection**: Rich entry submission with image support
- **Competition History**: Full tournament archives and statistics
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Socket.io Client, Axios
- **Backend**: Node.js, Express, Socket.io, JWT
- **Database**: PostgreSQL with comprehensive schema
- **Infrastructure**: Docker & Docker Compose
- **Testing**: Jest, React Testing Library, Supertest

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Setup (One Command)

```bash
# Clone the repository
git clone <repository-url>
cd world-cup-wednesdays

# Start everything with Docker
docker-compose up --build
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

### Demo Accounts
All demo accounts use password: `password`
- **Admin**: admin@example.com
- **Users**: john@example.com, jane@example.com, alice@example.com, bob@example.com

## 📁 Project Structure

```
world-cup-wednesdays/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # React contexts (Auth, Socket)
│   │   ├── pages/              # Page components
│   │   └── __tests__/          # Frontend tests
│   ├── Dockerfile.dev          # Development container
│   └── package.json
├── server/                     # Node.js Backend
│   ├── database/
│   │   ├── init/               # Database initialization scripts
│   │   │   ├── 01-schema.sql   # Database schema
│   │   │   └── 02-seed-data.sql # Demo data
│   │   └── connection.js       # PostgreSQL connection
│   ├── middleware/             # Express middleware
│   ├── routes/                 # API routes
│   ├── tests/                  # Backend tests
│   ├── Dockerfile              # Production container
│   └── package.json
├── scripts/                    # Setup scripts
├── docker-compose.yml          # Multi-container setup
└── README.md
```

## 🔧 Development

### Docker Commands
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild containers
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Access database
docker-compose exec postgres psql -U wcw_user -d world_cup_wednesdays
```

### Environment Configuration
The application uses environment variables for configuration. Key variables:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=world_cup_wednesdays
DB_USER=wcw_user
DB_PASSWORD=wcw_password

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Optional: AI Integration
OPENAI_API_KEY=your-openai-key
```

## 🧪 Testing

### Run All Tests
```bash
# Backend tests
docker-compose exec backend npm test

# Frontend tests  
docker-compose exec frontend npm test

# With coverage
docker-compose exec backend npm run test:coverage
```

### Test Coverage
- **Backend**: API routes, middleware, database operations
- **Frontend**: Components, contexts, user interactions
- **Integration**: End-to-end user flows

## 📊 Database Schema

### Core Tables
- **users**: User accounts and authentication
- **competitions**: Tournament details and status
- **entries**: User submissions with images
- **matches**: Bracket matches and results
- **votes**: Individual user votes
- **user_stats**: Aggregated statistics

### Key Features
- **Foreign key constraints** for data integrity
- **Indexes** for query performance
- **Automatic initialization** with Docker
- **Seed data** for immediate testing

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user info

### Competitions
- `GET /api/competitions` - List all competitions
- `GET /api/competitions/current` - Active competition
- `GET /api/competitions/:id` - Competition details
- `POST /api/competitions` - Create competition (admin)

### Tournament System
- `POST /api/entries` - Submit entry
- `POST /api/voting/vote` - Cast vote
- `GET /api/voting/my-votes/:id` - User's votes

### Administration
- `GET /api/users/leaderboard` - User rankings
- `POST /api/competitions/select-host` - Random host selection

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password hashing** with bcrypt
- **SQL injection protection** with parameterized queries
- **CORS configuration** for cross-origin requests
- **Input validation** with express-validator
- **Helmet.js** for security headers

## 🚢 Deployment

The application is designed to be deployed with Docker in any environment:

### Production Deployment
1. Set production environment variables
2. Use `docker-compose.prod.yml` for production configuration
3. Configure reverse proxy (nginx) for SSL termination
4. Set up database backups and monitoring

### Environment Considerations
- **Development**: Full hot-reload with volume mounts
- **Testing**: Isolated containers with test database
- **Production**: Optimized builds with health checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `docker-compose exec backend npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for office competition management
- Inspired by tournament bracket systems
- Designed for scalability and maintainability