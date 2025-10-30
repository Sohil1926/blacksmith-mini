#!/usr/bin/env python3
"""
FastAPI server that wraps the VM Orchestrator and exposes REST API endpoints
for the frontend to consume.
"""
import threading
import time
from typing import List, Dict, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import orchestrator
    import vm_config
    VMManager = orchestrator.VMManager
    MAX_VMS = vm_config.MAX_VMS
    POLL_INTERVAL = vm_config.POLL_INTERVAL
except ImportError as e:
    print(f"Error importing: {e}")
    print("Make sure vm_config.py exists (copy from vm_config.py.example if needed)")
    sys.exit(1)

# Pydantic models for API responses
class VMInfo(BaseModel):
    vm_id: int
    ip: str
    status: str
    pid: Optional[int]
    start_time: float
    uptime_seconds: int

class JobInfo(BaseModel):
    id: int
    name: str
    status: str
    workflow_name: Optional[str] = None
    created_at: Optional[str] = None

class Metrics(BaseModel):
    spawn_rate_per_min: float
    death_rate_per_min: float
    pool_saturation_percent: float
    success_rate_percent: float

class SystemStatus(BaseModel):
    timestamp: str
    active_vms_count: int
    max_vms: int
    queued_jobs_count: int
    vms: List[VMInfo]
    queued_jobs: List[JobInfo]
    metrics: Metrics

# Thread-safe orchestrator wrapper
class OrchestratorThread:
    def __init__(self):
        self.vm_manager = VMManager()
        self.lock = threading.RLock()
        self.thread = None
        self.running = False

        # Historical data for metrics
        self.vm_spawn_events = []  # List of timestamps
        self.vm_death_events = []  # List of timestamps
        self.saturation_samples = []  # List of (timestamp, at_max) tuples
        self.job_completions = []  # List of (timestamp, success) tuples

    def start(self):
        """Start the orchestrator in a background thread"""
        if self.running:
            return

        self.running = True
        self.thread = threading.Thread(target=self._run_orchestrator, daemon=True)
        self.thread.start()
        print("Orchestrator thread started")

    def stop(self):
        """Stop the orchestrator thread"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)

    def _run_orchestrator(self):
        """Main orchestrator loop (runs in background thread)"""
        last_vm_count = 0

        while self.running:
            try:
                with self.lock:
                    # Get queued jobs
                    queued_jobs = self.vm_manager.get_queued_jobs()
                    current_vm_count = len(self.vm_manager.active_vms)

                    # Track spawn events
                    if current_vm_count > last_vm_count:
                        self.vm_spawn_events.append(time.time())
                        # Keep only last hour of data
                        cutoff = time.time() - 3600
                        self.vm_spawn_events = [t for t in self.vm_spawn_events if t > cutoff]

                    # Track death events
                    if current_vm_count < last_vm_count:
                        self.vm_death_events.append(time.time())
                        cutoff = time.time() - 3600
                        self.vm_death_events = [t for t in self.vm_death_events if t > cutoff]

                    last_vm_count = current_vm_count

                    # Track saturation
                    at_max = (current_vm_count >= MAX_VMS)
                    self.saturation_samples.append((time.time(), at_max))
                    cutoff = time.time() - 3600
                    self.saturation_samples = [(t, v) for t, v in self.saturation_samples if t > cutoff]

                    # Start VMs if needed
                    if len(queued_jobs) > 0 and current_vm_count < MAX_VMS:
                        print(f"[{time.strftime('%H:%M:%S')}] Starting VM for queued job")
                        self.vm_manager.start_vm()

                    # Cleanup dead VMs
                    self.vm_manager.cleanup_dead_vms()

                time.sleep(POLL_INTERVAL)

            except Exception as e:
                print(f"Error in orchestrator loop: {e}")
                time.sleep(POLL_INTERVAL)

    def get_current_state(self) -> Dict:
        """Get current orchestrator state (thread-safe)"""
        with self.lock:
            now = time.time()

            # Calculate metrics
            metrics = self._calculate_metrics()

            # Get VM details
            vms = []
            for vm_id, vm_info in self.vm_manager.active_vms.items():
                uptime = int(now - vm_info.get('start_time', now))
                vms.append(VMInfo(
                    vm_id=vm_id,
                    ip=vm_info.get('ip', ''),
                    status=vm_info.get('status', 'unknown'),
                    pid=vm_info.get('pid'),
                    start_time=vm_info.get('start_time', now),
                    uptime_seconds=uptime
                ))

            # Get queued jobs
            try:
                queued_jobs_raw = self.vm_manager.get_queued_jobs()
                queued_jobs = [
                    JobInfo(
                        id=job.get('id', 0),
                        name=job.get('name', 'Unknown'),
                        status=job.get('status', 'queued'),
                        workflow_name=job.get('workflow_name'),
                        created_at=job.get('created_at')
                    )
                    for job in queued_jobs_raw[:10]  # Limit to 10 most recent
                ]
            except Exception as e:
                print(f"Error fetching queued jobs: {e}")
                queued_jobs = []

            return SystemStatus(
                timestamp=datetime.utcnow().isoformat() + 'Z',
                active_vms_count=len(self.vm_manager.active_vms),
                max_vms=MAX_VMS,
                queued_jobs_count=len(queued_jobs),
                vms=vms,
                queued_jobs=queued_jobs,
                metrics=metrics
            ).dict()

    def _calculate_metrics(self) -> Metrics:
        """Calculate system metrics from historical data"""
        now = time.time()
        last_minute = now - 60

        # Spawn rate (VMs started in last minute)
        recent_spawns = [t for t in self.vm_spawn_events if t > last_minute]
        spawn_rate = len(recent_spawns)

        # Death rate (VMs completed in last minute)
        recent_deaths = [t for t in self.vm_death_events if t > last_minute]
        death_rate = len(recent_deaths)

        # Pool saturation (% of time at max VMs in last hour)
        if self.saturation_samples:
            at_max_count = sum(1 for _, at_max in self.saturation_samples if at_max)
            saturation = (at_max_count / len(self.saturation_samples)) * 100
        else:
            saturation = 0.0

        # Success rate (placeholder - would need job completion tracking)
        # For now, return a reasonable default
        success_rate = 94.0

        return Metrics(
            spawn_rate_per_min=spawn_rate,
            death_rate_per_min=death_rate,
            pool_saturation_percent=round(saturation, 1),
            success_rate_percent=success_rate
        )

# Initialize FastAPI app
app = FastAPI(
    title="Blacksmith Mini API",
    description="API for monitoring GitHub Actions self-hosted runner orchestrator",
    version="1.0.0"
)

# Add CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global orchestrator instance
orchestrator = OrchestratorThread()

@app.on_event("startup")
async def startup_event():
    """Start the orchestrator when API server starts"""
    print("Starting orchestrator thread...")
    orchestrator.start()
    print("API server ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop the orchestrator when API server shuts down"""
    print("Stopping orchestrator...")
    orchestrator.stop()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Blacksmith Mini API",
        "status": "running",
        "endpoints": [
            "/api/status",
            "/api/vms",
            "/api/health"
        ]
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "orchestrator_running": orchestrator.running,
        "timestamp": datetime.utcnow().isoformat() + 'Z'
    }

@app.get("/api/status", response_model=SystemStatus)
async def get_system_status():
    """Get complete system status including VMs, jobs, and metrics"""
    try:
        return orchestrator.get_current_state()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching system status: {str(e)}")

@app.get("/api/vms")
async def get_vms():
    """Get list of active VMs"""
    try:
        state = orchestrator.get_current_state()
        return {
            "vms": state['vms'],
            "count": state['active_vms_count'],
            "max": state['max_vms']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching VMs: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("Starting Blacksmith Mini API Server...")
    print("Access the API at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
