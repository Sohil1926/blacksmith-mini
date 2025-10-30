export default function TestTimingBreakdown() {
  return (
    <div className="flex flex-col items-start justify-center gap-[16px] flex-1">
      {/* Header */}
      <div className="flex items-center justify-between relative w-full">
        <p className="flex-1 font-medium text-base text-[#9e9e9e] h-[26px]">
          <span className="font-medium">TEST</span><span className="font-normal"> TIMING BREAKDOWN</span>
        </p>
        <div className="flex gap-[8px] items-center text-[#9e9e9e]">
          <p className="text-base">ELAPSED:</p>
          <p className="font-medium text-xl w-[29px]">5s</p>
        </div>
      </div>

      {/* Timing Bars */}
      <div className="bg-black bg-opacity-80 flex gap-[8px] items-center px-0 py-5 rounded relative w-full">
        <div className="flex gap-[8px] items-center flex-1">
          {/* Queue Time */}
          <div className="flex flex-col gap-[5px] items-start flex-1">
            <div className="bg-[#203257] border border-[#3b82f6] h-[62px] relative rounded-lg w-full overflow-clip">
              <p className="absolute bottom-[25px] font-medium text-base text-[#fafafa] right-[40.25px] translate-x-full translate-y-full whitespace-nowrap">
                2.3s
              </p>
            </div>
            <div className="flex gap-[5px] items-center relative w-full">
              <p className="font-medium text-base text-[#9e9e9e] whitespace-nowrap">Queue Time</p>
              <div className="flex-1 h-0 border-t border-[#2a2a2a]" />
            </div>
          </div>

          {/* Boot Time */}
          <div className="flex flex-col gap-[5px] items-start flex-1">
            <div className="bg-[#203257] border border-[#3b82f6] h-[62px] relative rounded-lg w-full overflow-clip">
              <p className="absolute bottom-[25px] font-medium text-base text-[#fafafa] right-[38.25px] translate-x-full translate-y-full whitespace-nowrap">
                2.3s
              </p>
            </div>
            <div className="flex gap-[5px] items-center relative w-full">
              <p className="font-medium text-base text-[#9e9e9e] whitespace-nowrap">Boot Time</p>
              <div className="flex-1 h-0 border-t border-[#2a2a2a]" />
            </div>
          </div>
        </div>

        {/* Setup Time */}
        <div className="flex flex-col gap-[5px] items-start flex-1">
          <div className="bg-[#2f3211] border border-[#f0fb29] h-[62px] relative rounded-lg w-full overflow-clip">
            <p className="absolute bottom-[25px] font-medium text-base text-[#fafafa] right-[24px] translate-x-full translate-y-full whitespace-nowrap">
              8s
            </p>
          </div>
          <div className="flex gap-[5px] items-center relative w-full">
            <p className="font-medium text-base text-[#9e9e9e] whitespace-nowrap">Setup Time</p>
            <div className="flex-1 h-0 border-t border-[#2a2a2a]" />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#2a2a2a] flex flex-col gap-[25px] items-center p-5 rounded flex-1 w-full">
        <div className="flex flex-col gap-[16px] items-start relative w-full">
          <div className="flex flex-col gap-[24px] items-start relative w-full">
            <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
              <p className="text-[#9e9e9e]">Execution Time</p>
              <p className="text-[#fafafa]">1m 34s</p>
            </div>
            <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
              <p className="text-[#9e9e9e]">Total Lifecycle</p>
              <p className="text-[#fafafa]">1m 47s</p>
            </div>
          </div>

          {/* Logs Row */}
          <div className="bg-[#484848] flex items-center justify-between px-[8px] py-1 rounded relative w-full font-medium text-base whitespace-nowrap">
            <p className="text-[#9e9e9e]">Logs</p>
            <p className="text-[#fafafa]">15 unread</p>
          </div>
        </div>
      </div>
    </div>
  );
}
