'use client';

import { useVMData } from '@/hooks/useVMData';

const iconRunning = "http://localhost:3845/assets/80902fe570fdd51433fad0421bd80f636531591d.svg";
const iconSuccess = "http://localhost:3845/assets/73ce733df6af2b8a65fdabaa6d3b9bcee15cac15.svg";
const iconFailed = "http://localhost:3845/assets/ead0f78b7a42516342261b6f108c8d3a136ac0a7.svg";

export default function JobRunsTimeline() {
  const { data } = useVMData();

  // Map API status to our status format
  const mapStatus = (status: string): 'RUNNING' | 'SUCCESS' | 'FAILED' => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'queued' || lowerStatus === 'in_progress') return 'RUNNING';
    if (lowerStatus === 'completed' || lowerStatus === 'success') return 'SUCCESS';
    return 'FAILED';
  };

  // Get jobs from API data or show placeholder
  const jobs = data?.queued_jobs.map(job => ({
    name: job.name,
    status: mapStatus(job.status)
  })) || [];

  // Determine what jobs to display - use placeholder data if no jobs
  const displayJobs = jobs.length > 0 ? jobs : [
    { name: 'Test', status: 'RUNNING' as const },
    { name: 'build', status: 'SUCCESS' as const },
    { name: 'lint', status: 'SUCCESS' as const },
    { name: 'test-ete', status: 'FAILED' as const },
  ];

  return (
    <div className="flex flex-col gap-[16px] items-start flex-1 relative">
      <p className="text-base text-[#9e9e9e] h-[26px] w-full">
        JOB RUNS TIMELINE
      </p>
      <div className="flex flex-col gap-[10px] h-[295px] items-center overflow-x-clip overflow-y-auto relative w-full">
        {displayJobs.map((job, index) => {
          const icon = job.status === 'RUNNING' ? iconRunning : job.status === 'SUCCESS' ? iconSuccess : iconFailed;
          const statusBg = job.status === 'RUNNING' ? 'bg-[#2f3211]' : job.status === 'SUCCESS' ? 'bg-[#203257]' : 'bg-[#3e1429]';
          const statusColor = job.status === 'RUNNING' ? 'text-[#f0fb29]' : job.status === 'SUCCESS' ? 'text-[#3b82f6]' : 'text-[#ec4899]';
          const borderColor = index === 0 && job.status === 'RUNNING' ? 'border-[#fafafa]' : 'border-[#5d5d5d]';

          return (
            <div
              key={index}
              className={`bg-[#161616] border ${borderColor} rounded-lg relative w-full`}
            >
              <div className="flex gap-[10px] items-center justify-center overflow-clip px-[12px] py-[8px] pr-[8px] relative rounded-[inherit] w-full">
                <div className="flex gap-[9px] items-center flex-1">
                  <div className="relative w-[15.996px] h-[15.996px]">
                    <img alt="" className="block max-w-none w-full h-full" src={icon} />
                  </div>
                  <p className="font-medium text-base text-[#fafafa] whitespace-nowrap">
                    {job.name}
                  </p>
                </div>
                <div className={`${statusBg} flex gap-[10px] items-center justify-end overflow-clip px-5 py-1 rounded relative`}>
                  <p className={`font-medium text-base ${statusColor} whitespace-nowrap`}>
                    {job.status}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gradient fade at bottom */}
      <div className="absolute bg-gradient-to-t from-black h-[88px] left-0 to-transparent bottom-0 w-full pointer-events-none" />
    </div>
  );
}
