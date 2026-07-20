export default function ProgressRing({
  progress = 0,
  size = 64,
  strokeWidth = 6,
  color = "#C6C4BE",
  children,
}) {
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safeProgress / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safeProgress)}
    >
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(120,117,111,0.22)"
          strokeWidth={strokeWidth}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          vectorEffect="non-scaling-stroke"
          style={{
            transition:
              "stroke-dashoffset 650ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center rounded-full">
        {children}
      </div>
    </div>
  );
}
