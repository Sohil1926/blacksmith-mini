'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [firstLine, setFirstLine] = useState('');
  const [secondLine, setSecondLine] = useState('');
  const [showCursor1, setShowCursor1] = useState(true);
  const [showCursor2, setShowCursor2] = useState(false);

  const line1 = '- runs-on: ubuntu-latest';
  const line2 = '+ runs-on: sohils-laptop-i7-ubuntu-2404';

  useEffect(() => {
    let index1 = 0;
    let index2 = 0;

    // Type first line
    const interval1 = setInterval(() => {
      if (index1 < line1.length) {
        setFirstLine(line1.slice(0, index1 + 1));
        index1++;
      } else {
        clearInterval(interval1);
        setShowCursor1(false);
        setShowCursor2(true);

        // Start typing second line after a brief pause
        setTimeout(() => {
          const interval2 = setInterval(() => {
            if (index2 < line2.length) {
              setSecondLine(line2.slice(0, index2 + 1));
              index2++;
            } else {
              clearInterval(interval2);
              setShowCursor2(false);
            }
          }, 50);
        }, 300);
      }
    }, 50);

    return () => {
      clearInterval(interval1);
    };
  }, []);
  return (
    <div className="min-h-screen bg-[#f0fb29] relative overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sm:p-8 lg:p-12">
        {/* Logo */}
        <div className="w-[48px] h-[32px] sm:w-[68px] sm:h-[45px] relative flex-shrink-0">
          <Image
            src="http://localhost:3845/assets/bb1812cd8ffa598ef87998f86a4b8d39fe394943.png"
            alt="Blacksmith Logo"
            width={68}
            height={45}
            className="object-contain w-full h-full"
            priority
          />
        </div>

        {/* Console Link */}
        <Link
          href="/dashboard"
          className="font-medium text-base sm:text-lg lg:text-xl text-black hover:underline flex-shrink-0"
          style={{ fontFamily: "IBM Plex Sans" }}
        >
          CONSOLE
        </Link>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12 lg:pt-20 pb-12 sm:pb-16 lg:pb-20 max-w-full">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-20 w-full">
          {/* Left Side - Pixel Art Title */}
          <div className="flex flex-col items-start gap-6 lg:gap-8 w-full lg:w-auto min-w-0">
            {/* Large Pixel "BLACKSMITH" */}
            <div className="text-[48px] sm:text-[80px] lg:text-[120px] leading-none font-bold text-black tracking-wider break-words" style={{ fontFamily: "Pixelify Sans" }}>
              BLACKSMITH
            </div>

            {/* Subtitle moved here */}
            <p className="font-medium text-xl sm:text-2xl lg:text-[34px] text-black leading-tight max-w-full lg:max-w-[500px] break-words" style={{ fontFamily: "IBM Plex Sans" }}>
              A way to run your github actions on some random gaming laptop in waterloo
            </p>

            {/* NON SOC2 Badge */}
            <div className="relative">
              <div className="w-[80px] h-[80px] sm:w-[99px] sm:h-[99px] bg-black rounded-full flex flex-col items-center justify-center">
                <span className="font-medium text-base sm:text-xl text-white leading-tight" style={{ fontFamily: "IBM Plex Sans" }}>
                  NON
                </span>
                <span className="font-medium text-base sm:text-xl text-white leading-tight" style={{ fontFamily: "IBM Plex Sans" }}>
                  SOC2
                </span>
              </div>
              {/* Strikethrough line */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42px] sm:w-[52px] h-0.5 bg-white rotate-[-25deg]" />
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="flex-1 pt-0 lg:pt-8 w-full min-w-0">
            {/* Title */}
            <h1 className="font-bold text-2xl sm:text-3xl lg:text-[34px] text-black mb-4 sm:mb-6 break-words" style={{ fontFamily: "Pixelify Sans" }}>
              Blacksmith - mini
            </h1>

            {/* Description */}
            <p className="font-medium text-base sm:text-lg lg:text-xl text-black mb-4 sm:mb-6 break-words" style={{ fontFamily: "IBM Plex Sans" }}>
              A dead simple, drop-in replacement that costs 100% less than GitHub runners:
            </p>

            {/* Code Comparison */}
            <div className="flex flex-col gap-1 text-sm sm:text-base lg:text-lg overflow-x-auto" style={{ fontFamily: "Space Mono" }}>
              <div className="bg-[#aee4fd] px-2 py-1 inline-block w-fit min-h-[32px]">
                <span className="text-black whitespace-nowrap">
                  {firstLine}
                  {showCursor1 && <span className="inline-block w-[2px] h-[1em] bg-black ml-[2px] animate-pulse"></span>}
                </span>
              </div>
              <div className="bg-[#aee4fd] px-2 py-1 inline-block w-fit min-h-[32px]">
                <span className="text-black whitespace-nowrap">
                  {secondLine}
                  {showCursor2 && <span className="inline-block w-[2px] h-[1em] bg-black ml-[2px] animate-pulse"></span>}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
