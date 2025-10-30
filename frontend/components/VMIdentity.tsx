export default function VMIdentity() {
  return (
    <div className="flex flex-col items-start justify-center gap-[15px] flex-1">
      <h2 className="text-xl text-[#9e9e9e] underline w-full">
        VM IDENTITY
      </h2>
      <div className="bg-[#2a2a2a] flex flex-col items-center justify-center gap-[25px] p-5 rounded h-[285px] w-full overflow-hidden">
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM ID</p>
          <p className="text-[#fafafa]">1</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM IP Address</p>
          <p className="text-[#fafafa]">172.16.1.2</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">VM Status</p>
          <p className="text-[#fafafa]">running</p>
        </div>
        <div className="flex items-center justify-between w-full font-medium text-base whitespace-nowrap">
          <p className="text-[#9e9e9e]">Firecracker PID</p>
          <p className="text-[#fafafa]">70420</p>
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
