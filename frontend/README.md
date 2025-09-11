# Frontend - Crowdfunding Platform

This is the frontend application for the crowdfunding platform built with Quasar/Vue 3 and Clerk authentication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env` (if available) or create `.env` file
   - Set your Clerk publishable key:
     ```
     VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
     VITE_API_BASE_URL=http://localhost:3333
     ```

3. Start the development server:
```bash
npm run dev
```

## Features Implemented (Phase 1)

- ✅ Clerk authentication integration
- ✅ Sign-in and Sign-up pages with redirect to home
- ✅ Public projects listing (Home page)
- ✅ Private projects listing (My Projects page) with Bearer token authentication
- ✅ Responsive layout with authentication controls
- ✅ HTTP client with Axios for API communication

## Project Structure

- `src/boot/clerk.ts` - Clerk plugin configuration
- `src/utils/http.ts` - Axios HTTP client
- `src/pages/` - Vue pages (HomePage, MyProjects, AuthSignIn, AuthSignUp)
- `src/layouts/MainLayout.vue` - Main layout with authentication controls
- `src/router/routes.ts` - Application routes

## API Integration

The frontend integrates with the backend API:
- `GET /api/projects` - Public projects (no authentication required)
- `GET /api/projects/mine` - User's projects (requires Bearer token)

## Authentication Flow

1. Users can access public projects without authentication
2. Sign-in/Sign-up redirects to home page after successful authentication
3. Authenticated users can access "My Projects" page
4. All authenticated API calls include Bearer token in Authorization header