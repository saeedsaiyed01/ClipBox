# ClipBox Technical Documentation

## 1. High-level Overview

**ClipBox** is a specialized video editing automation platform. Its primary function is to transform raw video footage into polished, social-media-ready clips (e.g., for TikTok, Reels, Shorts) by applying custom aspect ratios, backgrounds, and styling effects.

### System Architecture
The system operates on an **Asynchronous Client-Server-Worker** model to handle resource-intensive video processing without blocking user interaction.

*   **Frontend**: A Next.js application that provides the user interface for uploading videos, configuring settings (crop, background), and managing user accounts.
*   **Backend API**: An Express.js server acting as the request orchestrator. It handles authentication, credit management, and queues video processing tasks.
*   **Worker Service**: A background process (powered by BullMQ & Redis) that picks up jobs and performs the actual video manipulation using FFmpeg.
*   **Database**: MongoDB stores user profiles, credits, and subscription data.
*   **Storage**:
    *   **Local Disk**: Temporary storage for raw uploads during processing.
    *   **Cloudinary**: Permanent storage for the final processed video files.

### Data Flow Overview
`User` -> `Frontend (Upload)` -> `Backend API` -> `Redis Queue` -> `Worker (FFmpeg)` -> `Cloudinary` -> `Frontend (Notification/Poll)`

---

## 2. Repository Structure

This is a **Monorepo** designed to keep the full-stack context in one place while maintaining clear separation of concerns.

*   **`/` (Root)**
    *   `docker-compose.yml`: Orchestrates the local development stack (Frontend + Backend + Redis).
    *   `scripts/`, `docs/`: auxiliary project resources.

*   **`/clipbox-backend`**
    *   **Purpose**: Handles all server-side logic, API endpoints, and heavy video processing.
    *   **Key Responsibilities**: Auth, Database connection, Job Queues, FFmpeg execution.

*   **`/clipbox-frontend`**
    *   **Purpose**: The client-side application using React & Next.js.
    *   **Key Responsibilities**: UI/UX, State management, API communication, Asset display.

---

## 3. Backend Deep Dive

**Location**: `/clipbox-backend`
**Stack**: Node.js, Express, TypeScript, Mongoose, BullMQ, FFmpeg.

### Folder Structure
*   `src/server.ts`: Entry point. Initializes Express, Database, and Middleware.
*   `src/worker.ts`: Entry point for the Background Worker. Can run independently or alongside the server.
*   `src/api/routes/`: Route definitions (e.g., `process.routes.ts`, `auth.ts`).
*   `controllers/`: Request handlers (check inputs, queue jobs).
*   `src/jobs/`: The heavy lifting logic (FFmpeg scripts).
*   `src/queues/`: BullMQ configuration.
*   `src/middleware/`: Reusable logic like `requireAuth` and `checkCredits`.

### Key Modules
1.  **Video Processor (`src/jobs/video.processor.ts`)**:
    *   Uses `fluent-ffmpeg` or spawned `ffmpeg` processes.
    *   Generates dynamic masks (via `canvas`) for rounded corners.
    *   Composites video layers (Background + Scaled Video + Overlay).
    *   Uploads result to Cloudinary.

2.  **Job Queue (`src/queues/video.queue.ts`)**:
    *   Uses **BullMQ** on top of **Redis**.
    *   Decouples the HTTP request from the processing time (which can take 30s+).

3.  **Authentication**:
    *   JWT-based. Tokens are issued by `routes/auth.ts` and verified by `middleware/requireAuth.ts`.

---

## 4. Frontend Deep Dive

**Location**: `/clipbox-frontend`
**Stack**: Next.js 16 (App Router), Tailwind CSS, Shadcn UI.

### Architecture
*   **`app/`**: Uses Next.js App Router for file-based routing.
    *   `app/studio/`: The main editor interface.
    *   `app/dashboard/`: User account summary and history.
*   **`components/`**: Reusable UI blocks (Buttons, Inputs, Cards).
*   **`lib/`**: Utilities.
    *   `api.ts`: A custom `authenticatedFetch` wrapper that handles JWT injection and 401 redirects.

### Key Logic
*   **State Management**: React `useState` for local form state.
*   **Polling**: The Studio page polls `/api/status/:jobId` to check when the video rendering is complete.

---

## 5. Backend ↔ Frontend Connection

### Communication
*   **Protocol**: REST over HTTP.
*   **CORS**: Configured in `server.ts` to allow specific production and development origins.

### Security flow
1.  **Login**: Frontend sends credentials -> Backend returns JWT.
2.  **Storage**: Frontend stores JWT in LocalStorage/Cookies.
3.  **Requests**: `lib/api.ts` attaches `Authorization: Bearer <token>` to every request.
4.  **Validation**: Backend `requireAuth` middleware decodes the token and attaches the `User` object to `req`.

### Error Handling
*   Backend sends standard HTTP codes (401, 403, 404, 500) with JSON `{ error: "message" }`.
*   Frontend `api.ts` intercepts these. Special handling exists for `401` (redirect to login) and credit limits (`429`).

---

## 6. Infrastructure & DevOps

### Development (Local)
*   **Docker Compose**: Runs `redis`, `backend`, and `frontend` in a network.
*   **Commands**: `npm run dev` (running services individually) or `docker-compose up`.

### Production
*   **Frontend**: Deployed to Vercel (Auto-building Next.js).
*   **Backend**: Deployed to Render (Node.js Environment).
    *   Requires a paid instance or persistent disk preferably, due to FFmpeg caching needs.
    *   Environment variables (`CLOUDINARY_URL`, `MONGO_URI`, `REDIS_URL`) connect the services.
*   **Redis**: Hosted Redis instance (e.g., Upstash or Render Redis).

---

## 7. File-by-file Explanation (Key Files)

*   **`clipbox-backend/src/server.ts`**
    *   Sets up the HTTP server, CORS, global error handling, and connects to MongoDB. In production, it may also lazy-load the worker to save costs.

*   **`clipbox-backend/src/jobs/video.processor.ts`**
    *   **CRITICAL FILE**. Contains the logic for:
        *   Calculating video dimensions based on Aspect Ratio.
        *   Drawing the gradient/solid background.
        *   Executing the FFmpeg command line.
        *   Handling Clean-up (deleting temp files).

*   **`clipbox-backend/controllers/process.controller.ts`**
    *   Validates upload limits (User Credit).
    *   Receive the raw file, creates a Job ID, and returns it immediately to the client.

*   **`clipbox-frontend/lib/api.ts`**
    *   The centralized fetching utility. Ensures consistent Auth headers and base URL usage across the app.

---

## 8. End-to-End Request Lifecycle

**Scenario: A User creates a "Story" format video with a Red background.**

1.  **User Interaction**: User clicks "Generate" on `/studio`.
2.  **Frontend**: Validates inputs -> Calls `POST /api/process` with the file and `{ settings: { aspectRatio: '9:16', background: 'red' } }`.
3.  **Backend (API)**:
    *   `requireAuth`: Validates JWT.
    *   `checkCredits`: Ensures user credit > 0.
    *   `multer`: Saves temp file `uploads/video-123.mp4`.
    *   Pushes job to Redis: `{'process-video', { path: '...', settings: ... }}`.
    *   Returns `{ jobId: 'job-999' }`.
4.  **Backend (Worker)**:
    *   Picks up `job-999`.
    *   `video.processor.ts` runs FFmpeg command.
    *   Uploads output to Cloudinary.
    *   Updates Redis Job Status to `completed` with the result URL.
5.  **Frontend**:
    *   Polls `GET /api/status/job-999`.
    *   Eventually receives `{ status: 'completed', url: 'https://res.cloudinary.com/...' }`.
    *   Updates the video player source for the user to view/download.

---

## 9. Benefits of this Architecture

1.  **Async Processing**: Video encoding is CPU-bound and slow. By moving it to a background worker (BullMQ), the API stays fast and responsive.
2.  **Scalability**: You can run 1 API server and 50 Worker servers if the workload increases, without changing code.
3.  **Separation of Concerns**: Frontend focuses purely on UI state; Backend focuses logic. This allows different teams to work in parallel.
4.  **Security**:
    *   JWT ensures stateless authentication.
    *   Server-side validation preventing credit bypass (e.g., `checkCredits` middleware).
    *   Input sanitization prevents malicious files.

---

