import NavBanner from "@/components/NavBanner";
import Header from "@/components/Header";
import SystemOverview from "@/components/SystemOverview";
import JobRunsTimeline from "@/components/JobRunsTimeline";
import TestTimingBreakdown from "@/components/TestTimingBreakdown";
import VMIdentity from "@/components/VMIdentity";
import NetworkStats from "@/components/NetworkStats";
import ResourceUtilization from "@/components/ResourceUtilization";
import SystemsOperational from "@/components/SystemsOperational";

export default function Dashboard() {
  return (
    <div className="bg-black flex flex-col gap-[8px] items-start pb-[40px] pt-[193px] px-[24px] relative w-full min-h-screen">
      <NavBanner />
      <Header />

      {/* First Stats Container */}
      <div className="flex flex-wrap gap-[24px] items-start justify-center overflow-clip relative shrink-0 w-full">
        <SystemOverview />
        <JobRunsTimeline />
      </div>

      {/* Divider Line */}
      <div className="h-0 border-t border-[#2a2a2a] relative shrink-0 w-full" />

      {/* Second Stats Container */}
      <div className="flex flex-wrap gap-[24px] items-start justify-center overflow-clip relative shrink-0 w-full">
        <TestTimingBreakdown />
        <div className="flex gap-[24px] items-center flex-1">
          <VMIdentity />
          <NetworkStats />
        </div>
      </div>

      {/* Divider Line */}
      <div className="h-0 border-t border-[#2a2a2a] relative shrink-0 w-full" />

      {/* Resource Utilization */}
      <ResourceUtilization />

      {/* Systems Operational - Bottom */}
      <div className="w-full">
        <SystemsOperational />
      </div>
    </div>
  );
}
