import React from "react";

export type TrendPoint = {
  label: string;
  value: number;
};

type SafeTrendChartProps = {
  data: TrendPoint[];
  emptyMessage: string;
  valueFormatter?: (value: number) => string;
  lineColor?: string;
  fillColor?: string;
};

type ChartErrorBoundaryProps = {
  children: React.ReactNode;
  fallback: React.ReactNode;
};

type ChartErrorBoundaryState = {
  hasError: boolean;
};

function ChartFallback({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-[#f8fafc] px-4 text-center text-sm text-[#64748b]">
      {message}
    </div>
  );
}

// Keep chart failures contained so the tracker page still renders.
class ChartErrorBoundary extends React.Component<
  ChartErrorBoundaryProps,
  ChartErrorBoundaryState
> {
  state: ChartErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function TrendChartCanvas({
  data,
  valueFormatter,
  lineColor,
  fillColor,
}: Required<Omit<SafeTrendChartProps, "emptyMessage">>) {
  const width = 320;
  const height = 220;
  const padding = { top: 18, right: 12, bottom: 30, left: 12 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const gradientId = React.useId().replace(/:/g, "");

  const points = data.map((point, index) => {
    const x =
      data.length === 1
        ? width / 2
        : padding.left + (chartWidth * index) / (data.length - 1);

    const y =
      range === 0
        ? padding.top + chartHeight / 2
        : padding.top + chartHeight - ((point.value - min) / range) * chartHeight;

    return { ...point, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const baseY = padding.top + chartHeight;
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;
  const visibleDots = points.length <= 12 ? points : [points[0], points[points.length - 1]];
  const middleLabel = data[Math.floor((data.length - 1) / 2)]?.label ?? "";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3 text-xs">
        <div>
          <p className="text-[#64748b]">Low</p>
          <p className="font-semibold text-[#1e293b]">{valueFormatter(min)}</p>
        </div>
        <div className="text-right">
          <p className="text-[#64748b]">High</p>
          <p className="font-semibold text-[#1e293b]">{valueFormatter(max)}</p>
        </div>
      </div>

      <div className="h-[220px] w-full overflow-hidden rounded-xl border border-gray-100 bg-[#fcfcfd] px-2 py-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((ratio) => {
            const y = padding.top + chartHeight * ratio;
            return (
              <line
                key={ratio}
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
            );
          })}

          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />

          {visibleDots.map((point, index) => (
            <g key={`${point.label}-${index}`}>
              <circle cx={point.x} cy={point.y} fill="#ffffff" r="5" />
              <circle cx={point.x} cy={point.y} fill={lineColor} r="3" />
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-3 text-[11px] text-[#64748b]">
        <span>{data[0]?.label ?? ""}</span>
        <span className="text-center">{middleLabel}</span>
        <span className="text-right">{data[data.length - 1]?.label ?? ""}</span>
      </div>
    </div>
  );
}

export function SafeTrendChart({
  data,
  emptyMessage,
  valueFormatter = (value) => `${value}`,
  lineColor = "#d97706",
  fillColor = "rgba(217, 119, 6, 0.24)",
}: SafeTrendChartProps) {
  const sanitizedData = data.reduce<TrendPoint[]>((points, point) => {
    const label = typeof point.label === "string" ? point.label.trim() : "";

    if (!label || !Number.isFinite(point.value)) {
      return points;
    }

    points.push({
      label,
      value: Number(point.value),
    });

    return points;
  }, []);

  const fallback = <ChartFallback message={emptyMessage} />;

  if (sanitizedData.length === 0) {
    return fallback;
  }

  const boundaryKey = `${sanitizedData.length}-${sanitizedData[0]?.label ?? "start"}-${sanitizedData[sanitizedData.length - 1]?.label ?? "end"}`;

  return (
    <ChartErrorBoundary key={boundaryKey} fallback={fallback}>
      <TrendChartCanvas
        data={sanitizedData}
        valueFormatter={valueFormatter}
        lineColor={lineColor}
        fillColor={fillColor}
      />
    </ChartErrorBoundary>
  );
}
