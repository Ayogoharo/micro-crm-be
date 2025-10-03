# Postman Collection - Micro CRM Backend

This directory contains Postman collections and environments for testing the Micro CRM Backend API.

## 📁 Files

- **Micro-CRM-Backend.postman_collection.json** - Main API collection with all endpoints
- **Micro-CRM-Backend.postman_environment.json** - Environment variables for local development

## 🚀 Quick Start

### 1. Import into Postman

#### Option A: Import via Postman UI
1. Open Postman
2. Click "Import" button (top left)
3. Drag and drop both JSON files OR click "Upload Files"
4. Select both files:
   - `Micro-CRM-Backend.postman_collection.json`
   - `Micro-CRM-Backend.postman_environment.json`

#### Option B: Import via CLI (if you have Newman)
```bash
newman run Micro-CRM-Backend.postman_collection.json \
  -e Micro-CRM-Backend.postman_environment.json
```

### 2. Select Environment
1. In Postman, look for the environment dropdown (top right)
2. Select "Micro CRM Backend - Local"

### 3. Start Testing!

#### Test Flow:
1. **Register** → Creates a new user account
2. **Login** → Gets JWT token (automatically saved)
3. **Get Profile** → Test protected endpoint with token

All authentication is handled automatically! 🎉

## 🔐 Authentication

### How It Works

The collection uses **automatic token management**:

1. **Login/Register** → JWT token is automatically saved to `access_token` environment variable
2. **Protected Endpoints** → Automatically use `{{access_token}}` from environment
3. **No manual copying required!**

### Manual Token Usage (if needed)

If you need to manually set a token:
1. Go to Environments → "Micro CRM Backend - Local"
2. Find `access_token` variable
3. Paste your JWT token in the "Current Value" field

## 📋 Available Endpoints

### Health Check
- `GET /` - Verify API is running

### Authentication
- `POST /auth/register` - Register new user
  - Auto-saves: `user_id`, `user_email`, `user_plan`
- `POST /auth/login` - Login and get JWT token
  - Auto-saves: `access_token`, `user_id`, `user_email`, `user_plan`
- `GET /auth/profile` - Get current user profile (🔒 Protected)

### Clients (Coming in Phase 3)
- `POST /clients` - Create client
- `GET /clients` - List clients with pagination
- `GET /clients/:id` - Get single client
- `PATCH /clients/:id` - Update client
- `DELETE /clients/:id` - Delete client

## 🔧 Environment Variables

### Base Configuration
| Variable | Default Value | Description |
|----------|---------------|-------------|
| `base_url` | `http://localhost:3000` | API base URL |

### Test Credentials
| Variable | Default Value | Type | Description |
|----------|---------------|------|-------------|
| `test_email` | `test@example.com` | Default | Email for testing |
| `test_password` | `testpass123` | Secret | Password for testing |

### Auto-Generated (Don't edit manually)
| Variable | Description |
|----------|-------------|
| `access_token` | JWT token (auto-saved on login) |
| `user_id` | Current user ID (auto-saved) |
| `user_email` | Current user email (auto-saved) |
| `user_plan` | Current user plan (auto-saved) |

## 🧪 Testing Examples

### Example 1: Register and Login
```
1. Run "Auth / Register New User"
   → Creates account, saves user data

2. Run "Auth / Login"
   → Gets JWT token, saves to environment

3. Run "Auth / Get Profile"
   → Uses saved token automatically
```

### Example 2: Test with Different User
1. Edit environment variables:
   - `test_email` → `newuser@example.com`
   - `test_password` → `newpass123`
2. Run "Register New User"
3. Run "Login"
4. All subsequent requests use the new token

### Example 3: Test Invalid Credentials
1. Change `test_password` to wrong value
2. Run "Login" → Should return 401 Unauthorized

## 📊 Response Examples

### Successful Registration (201)
```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "plan": "free"
  }
}
```

### Successful Login (200)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "plan": "free"
  }
}
```

### Get Profile (200)
```json
{
  "userId": "uuid-here",
  "email": "test@example.com"
}
```

### Error - Duplicate Email (409)
```json
{
  "statusCode": 409,
  "message": ["Email already registered"],
  "error": "ConflictException",
  "timestamp": "2025-10-03T08:04:26.343Z",
  "path": "/auth/register"
}
```

### Error - Invalid Credentials (401)
```json
{
  "statusCode": 401,
  "message": ["Invalid credentials"],
  "error": "UnauthorizedException",
  "timestamp": "2025-10-03T08:04:26.528Z",
  "path": "/auth/login"
}
```

## 🔍 Tests Included

Each endpoint includes automatic tests:

### Login Endpoint Tests
- ✅ Status code is 200
- ✅ Response has access_token
- ✅ Response has user object
- ✅ Token is saved to environment

### Get Profile Tests
- ✅ Status code is 200
- ✅ Response has userId
- ✅ Response has email

## 🐛 Troubleshooting

### Token Not Working?
1. Check environment is selected (top right dropdown)
2. Verify `access_token` is set in environment variables
3. Try logging in again

### 401 Unauthorized on Protected Routes?
1. Make sure you ran "Login" request first
2. Check console logs for token save confirmation
3. Verify token hasn't expired (JWT_EXPIRES_IN from .env)

### Can't Connect to API?
1. Ensure backend server is running: `npm run start:dev`
2. Check `base_url` matches your server (default: `http://localhost:3000`)
3. Verify database is running: `docker compose ps`

## 📝 Console Logging

The collection includes helpful console logs:

```
📡 Request to: http://localhost:3000/auth/login
✅ Login successful
Token saved to environment
User ID: 1476ff95-2e4e-490f-a2cc-08134d5053b5
Email: test@example.com
📥 Response status: 200 OK
```

Open Postman Console (View → Show Postman Console) to see these logs.

## 🔄 Future Additions

As new features are implemented, this collection will be updated with:

- ✅ Phase 2: Authentication (Current)
- ⏳ Phase 3: Clients CRUD
- ⏳ Phase 4: Appointments
- ⏳ Phase 5: Reminders
- ⏳ Phase 6: Invoices

## 💡 Tips

1. **Use Collection Runner** - Run all requests in sequence to test the full flow
2. **Duplicate Requests** - Create variations for testing edge cases
3. **Save Responses** - Use "Save Response" to create example responses
4. **Scripts** - Check the "Tests" tab to see auto-save scripts
5. **Pre-request Scripts** - Add custom logic before sending requests

## 🤝 Contributing

When adding new endpoints:

1. Add request to appropriate folder
2. Add test scripts for automatic validation
3. Update this README with new endpoint documentation
4. Include example responses

## 📖 API Documentation

For complete API documentation, see:
- [AUTHENTICATION_SUMMARY.md](../AUTHENTICATION_SUMMARY.md) - Authentication system details
- [docs/roadmap.md](../docs/roadmap.md) - Full project roadmap (private)

---

**Last Updated:** 2025-10-03
**Collection Version:** 1.0.0
**API Version:** Sprint 1 - Phase 2 Complete
