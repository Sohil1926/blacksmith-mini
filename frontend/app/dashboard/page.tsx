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
    <div className="flex flex-col items-start w-full">
        <NavBanner />
        <Header />
        <div className="flex flex-col items-start gap-5 w-full max-w-[1512px] px-4 sm:px-6 py-10 mx-auto">
          <div className="flex flex-col lg:flex-row items-stretch justify-center gap-5 sm:gap-7 w-full">
            <SystemOverview />
            <JobRunsTimeline />
          </div>
          <div className="flex flex-col lg:flex-row items-stretch justify-center gap-5 sm:gap-7 w-full">
            <TestTimingBreakdown />
            <VMIdentity />
            <NetworkStats />
          </div>
          <ResourceUtilization />

          {/* Systems Operational - Bottom Left Aligned */}
          <div className="w-full">
            <SystemsOperational />
          </div>
        </div>
    </div>
  );
}
