export default function Header() {
  return (
    <div className="absolute bg-black border-b border-[#2a2a2a] h-[83px] left-0 top-[88px] w-full dotted-pattern">
      <div className="flex gap-2.5 h-[83px] items-center justify-center overflow-clip px-[22px] py-2.5 relative w-full">
        <div className="flex gap-[357px] flex-1 h-full items-center justify-center relative">
          <div className="flex flex-col items-start justify-center relative shrink-0 w-[458px]">
            <p className="font-medium text-[36px] text-[#fafafa] whitespace-nowrap">
              GitHub Actions Analytics
            </p>
          </div>
          <div className="flex gap-2.5 flex-1 h-[52px] items-center justify-center relative">
            <p className="font-medium text-xl text-[#fafafa] whitespace-nowrap">
              /blacksmith-mini
            </p>
          </div>
          <div className="flex gap-2.5 flex-1 items-center justify-end relative">
            <p className="font-medium text-xl text-[#fafafa] whitespace-nowrap">
              TODAY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
