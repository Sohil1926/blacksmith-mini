'use client';

import { useVMData } from '@/hooks/useVMData';

export default function VMIdentity() {
  const { data, loading, isConnected } = useVMData();

  // Get the first VM from the list (or null if no VMs)
  const vm = data?.vms?.[0];

  return (
    <div className="flex flex-col items-start justify-center gap-[16px] flex-1">
      <p className="text-base text-[#9e9e9e] h-[26px] w-full">
        VM IDENTITY
      </p>
      <div className="bg-[#2a2a2a] flex flex-col gap-[24px] items-center justify-center overflow-clip p-5 rounded h-[285px] w-full">
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM ID</p>
          <p className="text-[#fafafa]">{vm?.vm_id || '1'}</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM IP Address</p>
          <p className="text-[#fafafa]">{vm?.ip || '172.16.1.2'}</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM Status</p>
          <p className="text-[#fafafa]">{vm?.status || 'running'}</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Firecracker PID</p>
          <p className="text-[#fafafa]">{vm?.pid || '70420'}</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Kernel Version</p>
          <p className="text-[#fafafa]">6.1.141</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Runner Version</p>
          <p className="text-[#fafafa]">2.329.0</p>
        </div>
      </div>
    </div>
  );
}
