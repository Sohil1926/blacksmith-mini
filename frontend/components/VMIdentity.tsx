'use client';

import { useVMData } from '@/hooks/useVMData';

export default function VMIdentity() {
  const { data, loading, isConnected } = useVMData();

  // Get the first VM from the list (or null if no VMs)
  const vm = data?.vms?.[0];

  // Calculate uptime in readable format
  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  // Show loading or no VMs state
  if (loading || !isConnected || !vm) {
    return (
      <div className="flex flex-col items-start justify-center gap-[15px] flex-1">
        <h2 className="text-xl text-[#9e9e9e] underline w-full">
          VM IDENTITY
        </h2>
        <div className="bg-[#2a2a2a] flex flex-col items-center justify-center gap-[25px] p-5 rounded h-[285px] w-full overflow-hidden">
          <p className="text-[#9e9e9e]">
            {loading ? 'Loading...' : !isConnected ? 'API Disconnected' : 'No Active VMs'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-center gap-[15px] flex-1">
      <h2 className="text-xl text-[#9e9e9e] underline w-full">
        VM IDENTITY
      </h2>
      <div className="bg-[#2a2a2a] flex flex-col items-center justify-center gap-[25px] p-5 rounded h-[285px] w-full overflow-hidden">
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM ID</p>
          <p className="text-[#fafafa]">{vm.vm_id}</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM IP Address</p>
          <p className="text-[#fafafa]">{vm.ip}</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM Status</p>
          <p className="text-[#fafafa]">{vm.status}</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Firecracker PID</p>
          <p className="text-[#fafafa]">{vm.pid || 'N/A'}</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Uptime</p>
          <p className="text-[#fafafa]">{formatUptime(vm.uptime_seconds)}</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Kernel Version</p>
          <p className="text-[#fafafa]">6.1.141</p>
        </div>
      </div>
    </div>
  );
}
