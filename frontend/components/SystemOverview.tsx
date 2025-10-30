export default function SystemOverview() {
  return (
    <div className="flex flex-col items-center justify-center gap-[18px] w-full">
      <h2 className="text-xl text-[#9e9e9e] underline w-full">
        SYSTEM OVERVIEW
      </h2>
      <div className="bg-[#2a2a2a] flex flex-col items-center justify-center gap-[25px] p-5 rounded w-full overflow-hidden">
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Active VMs</p>
          <p className="text-[#fafafa]">3/5</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Max VMs</p>
          <p className="text-[#fafafa]">5</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM Spawn Rate</p>
          <p className="text-[#fafafa]">12/min</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM Death Rate (completions/min)</p>
          <p className="text-[#fafafa]">3/min</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM Pool Saturation (% of time at max VMs)</p>
          <p className="text-[#fafafa]">20%</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Success Rate (% of jobs that completed)</p>
          <p className="text-[#fafafa]">94%</p>
        </div>
      </div>
    </div>
  );
}
