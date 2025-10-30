export default function ResourceUtilization() {
  // Placeholder data for demonstration
  const cpuData = [
    { x: 0, y: 20 },
    { x: 1, y: 85 },
    { x: 2, y: 50 },
    { x: 3, y: 45 },
  ];

  const memoryData = [
    { x: 0, y: 30 },
    { x: 1, y: 75 },
    { x: 2, y: 82 },
    { x: 3, y: 50 },
  ];

  const ChartContainer = ({
    title,
    data,
    color
  }: {
    title: string;
    data: Array<{x: number, y: number}>;
    color: string;
  }) => {
    // Calculate SVG path for the area chart
    const width = 600;
    const height = 160;
    const padding = { top: 10, right: 10, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Create path for the filled area
    const points = data.map((point, i) => {
      const x = padding.left + (point.x / 3) * chartWidth;
      const y = padding.top + chartHeight - (point.y / 100) * chartHeight;
      return { x, y };
    });

    // Build the area path
    let areaPath = `M ${padding.left} ${height - padding.bottom} `; // Start at bottom-left
    points.forEach((point, i) => {
      if (i === 0) {
        areaPath += `L ${point.x} ${point.y} `;
      } else {
        areaPath += `L ${point.x} ${point.y} `;
      }
    });
    areaPath += `L ${padding.left + chartWidth} ${height - padding.bottom} Z`; // Close path at bottom-right

    // Build the line path
    let linePath = `M ${points[0].x} ${points[0].y} `;
    points.slice(1).forEach(point => {
      linePath += `L ${point.x} ${point.y} `;
    });

    return (
      <div className="flex-1 bg-[rgba(0,0,0,0.2)] flex flex-col gap-[25px] px-5 py-3 rounded overflow-hidden">
        <p className="font-medium text-base text-[#9e9e9e] whitespace-nowrap">
          {title}
        </p>
        <div className="w-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Chart area */}
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color} stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Y-axis */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={height - padding.bottom}
              stroke="#fafafa"
              strokeWidth="1"
            />

            {/* X-axis */}
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="#fafafa"
              strokeWidth="1"
            />

            {/* Y-axis labels and ticks */}
            {[0, 25, 50, 75, 100].map((value) => {
              const y = padding.top + chartHeight - (value / 100) * chartHeight;
              return (
                <g key={`y-${value}`}>
                  <line
                    x1={padding.left - 6}
                    y1={y}
                    x2={padding.left}
                    y2={y}
                    stroke="#fafafa"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#000"
                    fontSize="12"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels and ticks */}
            {[0, 1, 2, 3].map((value) => {
              const x = padding.left + (value / 3) * chartWidth;
              return (
                <g key={`x-${value}`}>
                  <line
                    x1={x}
                    y1={height - padding.bottom}
                    x2={x}
                    y2={height - padding.bottom + 6}
                    stroke="#fafafa"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={height - padding.bottom + 20}
                    textAnchor="middle"
                    fill="#000"
                    fontSize="12"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path
              d={areaPath}
              fill={`url(#gradient-${color})`}
            />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-start gap-[16px] w-full">
      <p className="text-base text-[#9e9e9e] h-[26px] w-full">
        <span className="font-medium">RESOURCE</span><span className="font-normal"> UTILIZATION</span>
      </p>
      <div className="flex gap-[10px] items-start overflow-clip relative w-full">
        <ChartContainer
          title="CPU Usage"
          data={cpuData}
          color="#4A90E2"
        />
        <ChartContainer
          title="Memory Usage"
          data={memoryData}
          color="#9B59B6"
        />
      </div>
    </div>
  );
}
