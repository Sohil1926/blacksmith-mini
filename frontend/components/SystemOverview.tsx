'use client';

import { useVMData } from '@/hooks/useVMData';

export default function SystemOverview() {
  const { data, loading, error, isConnected } = useVMData();

  // Calculate which VMs are active for visualization
  const activeVMs = data?.active_vms_count || 3;
  const maxVMs = data?.max_vms || 5;

  return (
    <div className="flex flex-col gap-[16px] items-center flex-1 relative">
      <div className="flex items-start justify-between relative w-full">
        <p className="text-base text-[#9e9e9e] whitespace-nowrap">
          SYSTEM OVERVIEW
        </p>
      </div>

      <div className="flex gap-[24px] items-start relative w-full">
        {/* Active VMs Visualization */}
        <div className="flex flex-col gap-[16px] items-center justify-center relative">
          <div className="bg-[#2a2a2a] flex flex-col gap-[24px] items-center p-5 relative rounded w-[199px]">
            <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
              <p className="text-[#9e9e9e]">Active VMs</p>
              <p className="text-[#fafafa]">{activeVMs}/{maxVMs}</p>
            </div>
          </div>

          {/* VM Status Boxes */}
          <div className="flex flex-wrap gap-[6px] items-start w-[159px]">
            {Array.from({ length: maxVMs }).map((_, i) => (
              <div
                key={i}
                className={`rounded-lg w-[49px] h-[49px] border-[1.5px] ${
                  i < activeVMs
                    ? 'bg-[#2f3211] border-[#f0fb29]'
                    : 'border-[#8f8f8f]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* System Stats */}
        <div className="bg-[#2a2a2a] flex flex-col gap-[24px] items-center justify-center overflow-clip p-5 rounded flex-1">
          <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
            <p className="text-[#9e9e9e]">VM Spawn Rate</p>
            <p className="text-[#fafafa]">{loading ? '...' : data?.metrics.spawn_rate_per_min || '12'}/min</p>
          </div>
          <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
            <p className="text-[#9e9e9e]">VM Death Rate (completions/min)</p>
            <p className="text-[#fafafa]">{loading ? '...' : data?.metrics.death_rate_per_min || '3'}/min</p>
          </div>
          <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
            <p className="text-[#9e9e9e]">VM Pool Saturation (% of time at max VMs)</p>
            <p className="text-[#fafafa]">{loading ? '...' : data?.metrics.pool_saturation_percent || '60'}%</p>
          </div>
          <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
            <p className="text-[#9e9e9e]">Success Rate (% of jobs that completed) </p>
            <p className="text-[#fafafa]">{loading ? '...' : data?.metrics.success_rate_percent || '94'}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
