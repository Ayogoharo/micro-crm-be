# Deployment Guide

This guide covers deploying the Micro CRM Backend to production environments like Railway, Render, or similar platforms.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (provided by hosting platform or external service)
- Environment variables configured

## Required Environment Variables

The following environment variables must be set in your deployment platform:

```bash
# Application
NODE_ENV=production
PORT=3000

# Database (provided by your hosting platform)
DATABASE_HOST=<your-database-host>
DATABASE_PORT=5432
DATABASE_USER=<your-database-user>
DATABASE_PASSWORD=<your-database-password>
DATABASE_NAME=<your-database-name>

# JWT Authentication
JWT_SECRET=<generate-a-strong-secret-key>
JWT_EXPIRES_IN=7d

# CORS (frontend URL)
CORS_ORIGIN=https://your-frontend-domain.com
```

## Build and Start Commands

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm run start:prod
```

## Database Migrations

Migrations must run before starting the application. Add this to your deployment pipeline:

```bash
npm run migration:run
```

## Platform-Specific Instructions

### Railway

1. Create a new project on [Railway](https://railway.app)
2. Add a PostgreSQL database service
3. Connect your GitHub repository
4. Set environment variables in Railway dashboard
5. Railway will automatically detect and use the build/start commands from package.json

**Deploy Steps:**
- Build Command: `npm run build`
- Start Command: `npm run migration:run && npm run start:prod`

### Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Select "Node" environment
4. Add a PostgreSQL database
5. Configure build and start commands

**Settings:**
- Build Command: `npm install && npm run build`
- Start Command: `npm run migration:run && npm run start:prod`
- Add environment variables from the Render dashboard

### Heroku

1. Create a new app on [Heroku](https://heroku.com)
2. Add Heroku Postgres addon
3. Set environment variables via Heroku CLI or dashboard

```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
# ... set other variables
git push heroku main
```

## Health Check Endpoint

Your deployment platform can use the `/health` endpoint to monitor application health:

```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-06T15:00:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

## API Documentation

Once deployed, Swagger documentation will be available at:
```
https://your-domain.com/api
```

## Security Considerations

1. **JWT_SECRET**: Use a cryptographically secure random string (32+ characters)
2. **CORS_ORIGIN**: Set to your actual frontend domain, never use `*` in production
3. **DATABASE_PASSWORD**: Use strong passwords provided by your hosting platform
4. **Environment Variables**: Never commit .env files to version control

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_HOST and DATABASE_PORT are correct
- Check if your hosting platform requires SSL connections
- Ensure database service is running and accessible

### Migration Failures
- Check database user has necessary permissions
- Verify migrations haven't been run already
- Review migration logs for specific errors

### CORS Errors
- Verify CORS_ORIGIN matches your frontend domain exactly
- Include the protocol (https://) in the origin
- Check if your frontend is sending credentials

## Monitoring

Consider implementing:
- Error tracking (e.g., Sentry)
- Performance monitoring (e.g., New Relic)
- Logging aggregation (e.g., LogDNA, Papertrail)
- Uptime monitoring (e.g., UptimeRobot)

## Scaling

For production workloads:
- Use connection pooling for database
- Consider adding Redis for caching
- Implement rate limiting
- Add load balancing if needed

## Support

For issues or questions:
- Check the README.md for local development setup
- Review API documentation at `/api`
- Check application logs on your hosting platform
