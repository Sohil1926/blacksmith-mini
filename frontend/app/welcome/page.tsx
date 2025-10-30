import Link from "next/link";
import Image from "next/image";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative">
      {/* CONSOLE link - positioned absolutely in the top right of the container area */}
      <Link
        href="/dashboard"
        className="absolute top-8 right-8 lg:top-12 lg:right-12 font-medium text-lg lg:text-xl text-white hover:underline"
        style={{ fontFamily: "IBM Plex Sans" }}
      >
        CONSOLE
      </Link>

      {/* Welcome Container */}
      <div className="bg-[#0a0a0a] border border-[#303030] rounded-lg max-w-[963px] w-full">
        <div className="flex flex-col gap-8 p-6 sm:p-10 lg:p-[38px_53px]">
          {/* Title */}
          <h1 className="font-medium text-xl lg:text-[20px] text-white" style={{ fontFamily: "IBM Plex Sans" }}>
            Welcome to Blacksmith!
          </h1>

          {/* Subtitle */}
          <p className="font-medium text-xl lg:text-[20px] text-[#a1a1a1]" style={{ fontFamily: "IBM Plex Sans" }}>
            Set up our GitHub integration to get started
          </p>

          {/* Note Container */}
          <div className="border border-[#242424] rounded-lg p-6 lg:p-[25px_28px] flex-1">
            <div className="flex flex-col gap-4">
              {/* Note Header */}
              <div className="flex items-center gap-4 lg:gap-[22px]">
                {/* Exclamation Icon */}
                <div className="w-[23px] h-[23px] flex-shrink-0">
                  <Image
                    src="http://localhost:3845/assets/5038c2fcbbf8a4c6433db683d4b184faaa73b05e.svg"
                    alt="Info"
                    width={23}
                    height={23}
                    className="w-full h-full"
                  />
                </div>
                <p className="font-medium text-xl lg:text-[20px] text-white" style={{ fontFamily: "IBM Plex Sans" }}>
                  Note
                </p>
              </div>

              {/* Note Text */}
              <div className="pl-8 lg:pl-[46px]">
                <p className="font-medium text-base lg:text-[20px] text-[#fafafa] leading-normal" style={{ fontFamily: "IBM Plex Sans" }}>
                  Blacksmith does not support GitHub organizations. Please use your personal access token from your GitHub Account
                </p>
              </div>
            </div>
          </div>

          {/* Install Button Container */}
          <div className="flex justify-end w-full">
            <button className="bg-[#f0fb29] hover:bg-[#e0eb19] transition-colors rounded-md px-5 py-4 flex items-center gap-4 lg:gap-7">
              {/* GitHub Icon */}
              <div className="w-[36px] h-[35px] flex-shrink-0">
                <Image
                  src="http://localhost:3845/assets/61cd6948fdbc8799dc382ea7d67695426f240241.svg"
                  alt="GitHub"
                  width={36}
                  height={35}
                  className="w-full h-full"
                />
              </div>

              <span className="font-medium text-lg lg:text-[20px] text-black" style={{ fontFamily: "IBM Plex Sans" }}>
                Install
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
