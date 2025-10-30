'use client';

import { useState } from 'react';
import { useVMData } from '@/hooks/useVMData';

const iconRunning = "http://localhost:3845/assets/80902fe570fdd51433fad0421bd80f636531591d.svg";
const iconSuccess = "http://localhost:3845/assets/73ce733df6af2b8a65fdabaa6d3b9bcee15cac15.svg";
const iconFailed = "http://localhost:3845/assets/ead0f78b7a42516342261b6f108c8d3a136ac0a7.svg";

export default function JobRunsTimeline() {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const { data, loading, isConnected } = useVMData();

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

  // Determine what jobs to display
  const displayJobs = jobs.length > 0 ? jobs : [
    { name: loading ? 'Loading...' : 'No jobs queued', status: 'RUNNING' as const }
  ];

  return (
    <div className="flex flex-col gap-[18px] items-start w-full">
      <h2 className="text-xl text-[#9e9e9e] underline w-full">
        JOB RUNS TIMELINE
      </h2>
      <div className="flex flex-col gap-2.5 h-[289px] items-center overflow-y-auto overflow-x-hidden w-full py-2 px-1">
        {displayJobs.map((job, index) => {
          const icon = job.status === 'RUNNING' ? iconRunning : job.status === 'SUCCESS' ? iconSuccess : iconFailed;
          const statusBg = job.status === 'RUNNING' ? 'bg-[#2f3211]' : job.status === 'SUCCESS' ? 'bg-[#203257]' : 'bg-[#3e1429]';
          const statusColor = job.status === 'RUNNING' ? 'text-[#f0fb29]' : job.status === 'SUCCESS' ? 'text-[#3b82f6]' : 'text-[#ec4899]';

          const isSelected = selectedJob === index;

          return (
            <div
              key={index}
              onClick={() => setSelectedJob(index)}
              className={`bg-[#161616] border border-[#5d5d5d] rounded-lg w-full cursor-pointer transition-all duration-200 hover:bg-[#1e1e1e] hover:border-[#fafafa] ${
                isSelected ? 'ring-2 ring-[#f0fb29] ring-offset-2 ring-offset-black' : ''
              }`}
            >
              <div className="flex gap-2.5 items-center justify-center overflow-hidden p-3 rounded-[inherit] w-full">
                <div className="flex gap-[9px] items-center flex-1">
                  <div className="w-4 h-4 shrink-0">
                    <img alt="" className="block max-w-none w-full h-full" src={icon} />
                  </div>
                  <p className="font-medium text-base text-[#fafafa] whitespace-nowrap">
                    {job.name}
                  </p>
                </div>
                <div className={`${statusBg} flex gap-2.5 items-center justify-end overflow-hidden px-5 py-1 rounded shrink-0`}>
                  <p className={`font-medium text-base ${statusColor} whitespace-nowrap`}>
                    {job.status}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
