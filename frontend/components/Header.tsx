export default function Header() {
  return (
    <div className="bg-black border-b border-[#2a2a2a] w-full dotted-pattern h-[112px]">
      <div className="flex items-center justify-center w-full max-w-[1512px] mx-auto px-4 sm:px-6 h-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 lg:gap-8 flex-1 w-full max-w-full">
          <div className="flex items-center gap-2.5 shrink">
            <h1 className="font-medium text-xl sm:text-2xl lg:text-4xl text-[#fafafa] text-center break-words">
              GitHub Actions Analytics
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2.5 shrink-0">
            <p className="font-medium text-base sm:text-lg lg:text-xl text-[#fafafa] whitespace-nowrap">
              /blacksmith-mini
            </p>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2.5 shrink-0">
            <p className="font-medium text-base sm:text-lg lg:text-xl text-[#fafafa] whitespace-nowrap">
              TODAY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
