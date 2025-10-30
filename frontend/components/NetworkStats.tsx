export default function NetworkStats() {
  return (
    <div className="flex flex-col items-start justify-center gap-[17px] flex-1">
      <h2 className="text-xl text-[#9e9e9e] underline w-full">
        NETWORK STATS
      </h2>
      <div className="bg-[#2a2a2a] flex flex-col items-center gap-[25px] p-5 rounded h-[285px] w-full overflow-hidden">
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">DNS Queries</p>
          <p className="text-[#fafafa]">18</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Connections</p>
          <p className="text-[#fafafa]">github.com, npm.org</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Total Downloaded</p>
          <p className="text-[#fafafa]">245 MB</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Total Uploaded</p>
          <p className="text-[#fafafa]">12MB</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Packet drops</p>
          <p className="text-[#fafafa]">0</p>
        </div>
      </div>
    </div>
  );
}
