export default function TestTimingBreakdown() {
  return (
    <div className="flex flex-col items-start justify-center gap-[15px] flex-1">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-xl text-[#9e9e9e]">
          <span className="font-medium underline">TEST</span> TIMING BREAKDOWN
        </h2>
        <p className="font-medium text-xl text-[#9e9e9e]">5s</p>
      </div>
      <div className="bg-[#2a2a2a] flex flex-col items-center justify-center gap-[25px] p-5 rounded h-[285px] w-full overflow-hidden">
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Job Duration</p>
          <p className="text-[#fafafa]">3s</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Queue Time</p>
          <p className="text-[#fafafa]">2.3s</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Boot Time</p>
          <p className="text-[#fafafa]">2.3s</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Setup Time</p>
          <p className="text-[#fafafa]">8s</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Execution Time</p>
          <p className="text-[#fafafa]">1m 34s</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Total Lifecycle</p>
          <p className="text-[#fafafa]">1m 47s</p>
        </div>
      </div>
    </div>
  );
}
