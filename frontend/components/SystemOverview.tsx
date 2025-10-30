'use client';

import { useVMData } from '@/hooks/useVMData';

export default function SystemOverview() {
  const { data, loading, error, isConnected } = useVMData();

  // Show loading state
  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-[18px] w-full">
        <h2 className="text-xl text-[#9e9e9e] underline w-full">
          SYSTEM OVERVIEW
        </h2>
        <div className="bg-[#2a2a2a] flex flex-col items-center justify-center gap-[25px] p-5 rounded w-full overflow-hidden min-h-[300px]">
          <p className="text-[#9e9e9e]">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state or disconnected state
  if (error || !isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-[18px] w-full">
        <h2 className="text-xl text-[#9e9e9e] underline w-full">
          SYSTEM OVERVIEW
        </h2>
        <div className="bg-[#2a2a2a] flex flex-col items-center justify-center gap-[25px] p-5 rounded w-full overflow-hidden min-h-[300px]">
          <p className="text-[#ec4899]">⚠ API Connection Error</p>
          <p className="text-[#9e9e9e] text-sm">Make sure the backend server is running on port 8000</p>
        </div>
      </div>
    );
  }

  // Show data
  return (
    <div className="flex flex-col items-center justify-center gap-[18px] w-full">
      <h2 className="text-xl text-[#9e9e9e] underline w-full">
        SYSTEM OVERVIEW
      </h2>
      <div className="bg-[#2a2a2a] flex flex-col items-center justify-center gap-[25px] p-5 rounded w-full overflow-hidden">
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Active VMs</p>
          <p className="text-[#fafafa]">{data?.active_vms_count}/{data?.max_vms}</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Max VMs</p>
          <p className="text-[#fafafa]">{data?.max_vms}</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM Spawn Rate</p>
          <p className="text-[#fafafa]">{data?.metrics.spawn_rate_per_min}/min</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM Death Rate (completions/min)</p>
          <p className="text-[#fafafa]">{data?.metrics.death_rate_per_min}/min</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM Pool Saturation (% of time at max VMs)</p>
          <p className="text-[#fafafa]">{data?.metrics.pool_saturation_percent}%</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Success Rate (% of jobs that completed)</p>
          <p className="text-[#fafafa]">{data?.metrics.success_rate_percent}%</p>
        </div>
      </div>
    </div>
  );
}
