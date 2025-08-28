# AccessAble API - Backend Service

A Ballerina-based REST API for the AccessAble accessibility platform that helps users with disabilities discover and share accessible locations in Sri Lanka.

## 🚀 Quick Start

### Prerequisites
- [Ballerina 2201.12.7](https://ballerina.io/downloads/)
- MongoDB Atlas account (or local MongoDB)
- Node.js (for frontend)

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd accessable-api
   ```

3. Install dependencies (automatically handled by Ballerina)

4. Set up environment variables (see Configuration section)

5. Run the service:
   ```bash
   bal run
   ```

The API will be available at `http://localhost:9090`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory or set environment variables (environment values override `.env`). The service auto-loads `.env` at startup.

```bash
# Database Configuration (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/accessable

# JWT Secret (REQUIRED for production)
JWT_SECRET=your-very-secure-jwt-secret-key

# Cloudinary (REQUIRED for image upload features)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### Admin User Setup

For initial setup, you can create an admin user through the registration process:

1. Start the API server: `bal run`
2. Register an admin account through the `/auth` endpoint with `action: "register"`
3. Set the user's role to "admin" in the database or use admin tools to promote the user
4. The first registered user can be manually set as admin in the database

**Security Best Practices:**
- Use strong passwords with at least 8 characters, including uppercase, lowercase, and digits
- Never commit default passwords to version control
- Use environment variables for sensitive configuration
- Add `.env` to `.gitignore` and never commit it
- Enable HTTPS in production

## 📡 API Endpoints

### Authentication
- `POST /auth` - Login/Register endpoint

### Places Management
- `GET /locations/getAllPlaces` - Get all approved places
- `GET /locations/getPlaceById/{id}` - Get specific place
- `POST /locations/addPlace` - Add new place (authenticated)
- `POST /locations/addPlaces` - Alternative place creation
- `GET /locations/getReviewsByPlace/{placeId}` - Get reviews for a place
- `POST /locations/addReview` - Add review (authenticated)

### Admin Endpoints (Require Admin Role)
- `GET /admin/users/pending` - Get pending users
- `POST /admin/users/approve` - Approve user
- `POST /admin/users/unapprove/{id}` - Unapprove user
- `DELETE /admin/users/{id}` - Delete user
- `GET /admin/users/all` - Get all users
- `GET /admin/places/pending` - Get pending places
- `POST /admin/places/approve` - Approve place
- `POST /admin/places/decline` - Decline place
- `GET /admin/reviews/pending` - Get pending reviews
- `POST /admin/reviews/approve` - Approve review
- `POST /admin/reviews/decline` - Decline review

### User Management
- `GET /profile` - Get user profile (authenticated)
- `PUT /profile` - Update user profile (authenticated)
- `PUT /profile/password` - Change password (authenticated)
- `DELETE /profile` - Delete account (authenticated)
- `POST /profile/upload` - Upload profile picture (authenticated)
- `GET /profile/activity` - Get user activity (authenticated)

### Matching System
- `POST /caregivers/suggest` - Get caregiver suggestions for PWD
- `POST /disabled/suggest` - Get PWD suggestions for caregivers

### Public Endpoints
- `GET /locations/stats` - Get platform statistics

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login/Register** via `POST /auth` with:
   ```json
   {
     "action": "login",
     "data": {
       "email": "user@example.com",
       "password": "password"
     }
   }
   ```

2. **Use Token** in subsequent requests:
   ```
   Authorization: Bearer <jwt_token>
   ```

3. **Token Validation** - All protected endpoints validate the JWT token and extract user information

## 🏗️ Architecture

### Project Structure
```
accessable-api/
├── main.bal           # Main API service with all endpoints
├── LocationService.bal # Location-specific services
├── types.bal          # Data type definitions
├── utils.bal          # Utility functions
├── listeners.bal      # HTTP listener configuration
├── cloudinary.bal     # Image upload utilities
├── Ballerina.toml     # Project configuration
├── Dependencies.toml  # Auto-generated dependencies
└── .gitignore        # Git ignore rules
```

### Key Components

1. **main.bal** - Primary service with authentication, user management, and admin functions
2. **LocationService.bal** - Dedicated service for location/place operations
3. **types.bal** - Shared data types and database configuration
4. **utils.bal** - JWT token utilities and helper functions

### Database Schema

The application uses MongoDB with the following collections:
- `users` - User accounts and profiles
- `places` - Accessible locations
- `reviews` - User reviews for places

## 🛠️ Development

### Running in Development
```bash
bal run
```

### Building for Production
```bash
bal build
```

### Testing
```bash
bal test
```

## 🔒 Security Features

### Authentication & Authorization
- **JWT Authentication** with configurable secrets
- **Role-based Access Control** (Admin, Caregiver, PWD)
- **Password Hashing** using SHA-256 with base64 encoding
- **Token Validation** with signature verification
- **Admin-only Endpoints** with role verification

### Input Security
- **Input Validation** on all endpoints
- **Email Format Validation**
- **Password Complexity Requirements** (minimum 8 chars, mixed case, digits)
- **SQL Injection Prevention** through MongoDB driver
- **XSS Protection** through proper data encoding

### Configuration Security
- **Environment Variables** for sensitive configuration
- **No Hardcoded Credentials** in production code
- **Secure Admin User Creation** requiring explicit environment variables
- **CORS Configuration** for frontend integration
- **Database Connection Security** with MongoDB Atlas

### Admin User Security
- **Manual Admin Setup** through registration and database management
  - Create admin users through the standard registration process
  - Promote users to admin role through database management
  - Validate email format and password complexity in registration
  - Use environment variables for sensitive configuration

## 🚨 Important Security Notes

1. **Never commit sensitive data** like passwords, API keys, or database URIs
2. **Use environment variables** for configuration
3. **Use strong passwords** for all accounts (8+ characters, mixed case, digits)
4. **Enable HTTPS** in production environments
5. **Regularly backup** your database and configuration

## 📚 Dependencies

- `ballerinax/mongodb` - MongoDB driver
- `ballerina/http` - HTTP server and client
- `ballerina/crypto` - Cryptographic operations
- `ballerina/mime` - MIME type handling

## 🤝 Contributing

1. Follow Ballerina coding standards
2. Add proper error handling
3. Include documentation for new endpoints
4. Test all changes thoroughly

## 📄 License

This project is part of the AccessAble platform for improving accessibility in Sri Lanka.
