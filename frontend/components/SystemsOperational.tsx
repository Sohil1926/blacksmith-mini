export default function SystemsOperational() {
  return (
    <div className="flex items-center justify-start gap-[14px]">
      {/* Green Circle with Glow Effect */}
      <div className="relative w-4 h-4 flex-shrink-0">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[#28c96b] rounded-full blur-sm opacity-60"></div>
        {/* Main green circle */}
        <div className="relative w-full h-full bg-[#28c96b] rounded-full"></div>
      </div>

      {/* Status Text */}
      <p
        className="font-medium text-base text-[#28c96b] whitespace-nowrap"
        style={{ fontFamily: "IBM Plex Sans" }}
      >
        ALL SYSTEMS OPERATIONAL
      </p>
    </div>
  );
}
