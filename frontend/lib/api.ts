/**
 * API client for communicating with the Blacksmith Mini backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// TypeScript interfaces matching backend models
export interface VMInfo {
  vm_id: number;
  ip: string;
  status: string;
  pid: number | null;
  start_time: number;
  uptime_seconds: number;
}

export interface JobInfo {
  id: number;
  name: string;
  status: string;
  workflow_name?: string;
  created_at?: string;
}

export interface Metrics {
  spawn_rate_per_min: number;
  death_rate_per_min: number;
  pool_saturation_percent: number;
  success_rate_percent: number;
}

export interface SystemStatus {
  timestamp: string;
  active_vms_count: number;
  max_vms: number;
  queued_jobs_count: number;
  vms: VMInfo[];
  queued_jobs: JobInfo[];
  metrics: Metrics;
}

export interface HealthResponse {
  status: string;
  orchestrator_running: boolean;
  timestamp: string;
}

/**
 * Fetch system status from API
 */
export async function fetchSystemStatus(): Promise<SystemStatus> {
  const response = await fetch(`${API_BASE_URL}/api/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch VMs data from API
 */
export async function fetchVMs(): Promise<{ vms: VMInfo[]; count: number; max: number }> {
  const response = await fetch(`${API_BASE_URL}/api/vms`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Health check endpoint
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Utility function to check if API is reachable
 */
export async function checkAPIConnection(): Promise<boolean> {
  try {
    await fetchHealth();
    return true;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
}
