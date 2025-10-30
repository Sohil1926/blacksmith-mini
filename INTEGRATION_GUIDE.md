# Backend-Frontend Integration Guide

This guide explains how to run the Blacksmith Mini system with live data flowing from the backend VM orchestrator to the frontend dashboard.

## Architecture Overview

The system now consists of three main components:

1. **Backend Orchestrator** (`backend/orchestrator.py`) - Manages Firecracker VMs and GitHub Actions runners
2. **FastAPI Server** (`backend/api_server.py`) - Exposes REST API endpoints for the frontend
3. **Next.js Frontend** (`frontend/`) - Dashboard UI that displays live VM metrics

## Prerequisites

### Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

This installs:
- FastAPI (REST API framework)
- Uvicorn (ASGI server)
- Pydantic (data validation)
- Requests (HTTP client for GitHub API)

### Frontend Dependencies
Already installed via npm/yarn in the frontend directory.

## Configuration

### 1. Backend Configuration

Make sure you have `backend/vm_config.py` configured with your GitHub credentials:

```python
# backend/vm_config.py
GITHUB_TOKEN = "your_github_personal_access_token"
REPO_OWNER = "your-github-username"
REPO_NAME = "your-repo-name"
REPO_URL = f"https://github.com/{REPO_OWNER}/{REPO_NAME}"
MAX_VMS = 5
POLL_INTERVAL = 5  # seconds
SSH_KEY_PATH = "/path/to/your/ssh/key"
# ... other config
```

### 2. Frontend Configuration

The frontend is already configured via `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running the System

### Step 1: Start the Backend API Server

```bash
cd backend
python api_server.py
```

This will:
- Start the FastAPI server on `http://localhost:8000`
- Launch the orchestrator in a background thread
- Begin polling GitHub for queued jobs
- Automatically start/stop VMs as needed

You should see:
```
Starting Blacksmith Mini API Server...
Access the API at: http://localhost:8000
API docs at: http://localhost:8000/docs
Orchestrator thread started
API server ready!
```

### Step 2: Start the Frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## API Endpoints

The backend exposes the following endpoints:

### `GET /api/status`
Returns complete system status including:
- Active VM count and details
- Queued jobs from GitHub
- System metrics (spawn rate, death rate, saturation, success rate)

**Response:**
```json
{
  "timestamp": "2025-10-29T22:00:00Z",
  "active_vms_count": 3,
  "max_vms": 5,
  "queued_jobs_count": 2,
  "vms": [
    {
      "vm_id": 1,
      "ip": "172.16.1.2",
      "status": "running",
      "pid": 70420,
      "start_time": 1698612000,
      "uptime_seconds": 120
    }
  ],
  "queued_jobs": [...],
  "metrics": {
    "spawn_rate_per_min": 12,
    "death_rate_per_min": 3,
    "pool_saturation_percent": 20,
    "success_rate_percent": 94
  }
}
```

### `GET /api/vms`
Returns just the VM list

### `GET /api/health`
Health check endpoint

### `GET /docs`
Interactive API documentation (Swagger UI)

## How It Works

### Data Flow

1. **Orchestrator Loop** (runs every 5 seconds):
   - Fetches queued jobs from GitHub API
   - Starts new VMs if jobs are queued and capacity available
   - Cleans up dead VMs
   - Tracks historical metrics (spawn/death events, saturation samples)

2. **API Polling** (frontend polls every 3 seconds):
   - Frontend calls `/api/status` via `useVMData` hook
   - Backend returns current orchestrator state (thread-safe)
   - Components automatically update with new data

3. **Thread Safety**:
   - Orchestrator runs in background thread
   - All state access protected by `threading.RLock`
   - No race conditions between orchestrator and API handlers

### Components Updated

- **SystemOverview**: Shows live VM counts and metrics
- **JobRunsTimeline**: Displays queued jobs from GitHub
- **VMIdentity**: Shows details of the first active VM

### Error Handling

If the backend is not running or unreachable:
- Components show "API Connection Error" message
- Frontend continues to function (no crashes)
- User is prompted to start backend server

## Troubleshooting

### Backend Issues

**Problem**: Import error for `vm_config`
```
Error importing: No module named 'vm_config'
```
**Solution**: Create `backend/vm_config.py` with your configuration

**Problem**: GitHub API rate limiting
**Solution**: Use a GitHub Personal Access Token with proper scopes

### Frontend Issues

**Problem**: API connection error
**Solution**: Ensure backend is running on port 8000

**Problem**: CORS errors
**Solution**: Backend already configured to allow `localhost:3000`

### Testing Without Backend

To test frontend without backend running, you can temporarily modify `useVMData` hook to return mock data instead of calling the API.

## Development Tips

### Viewing API Docs
Visit `http://localhost:8000/docs` for interactive API documentation

### Adjusting Poll Interval
Edit `frontend/hooks/useVMData.ts`:
```typescript
export function useVMData(pollInterval: number = 3000)  // milliseconds
```

### Adding More Metrics
1. Add metric calculation to `api_server.py` `_calculate_metrics()`
2. Update `Metrics` model in both backend and frontend
3. Display in component

## Next Steps

Possible enhancements:
- WebSocket connections for real-time updates (replace polling)
- Historical data visualization with charts
- VM selection in VMIdentity component
- Job details modal when clicking timeline items
- Database for persistent metrics storage

## Summary

The integration is now complete! The frontend dashboard displays live data from the backend orchestrator:
- ✅ Active VM count updates in real-time
- ✅ System metrics (spawn/death rates, saturation, success rate)
- ✅ Live queued jobs from GitHub
- ✅ VM details for active VMs
- ✅ Automatic polling every 3 seconds
- ✅ Error handling and connection status
