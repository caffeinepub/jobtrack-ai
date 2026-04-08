interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  description?: string;
  colorClass?: string;
  className?: string;
  "data-ocid"?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  description,
  "data-ocid": dataOcid,
}: MetricCardProps) {
  const trendSymbol = trend === "up" ? "↑" : trend === "down" ? "↓" : "—";

  const trendOpacity =
    trend === "up"
      ? "opacity-100"
      : trend === "down"
        ? "opacity-60"
        : "opacity-40";

  return (
    <div
      data-ocid={dataOcid}
      className="flex flex-col gap-1"
      style={{ minWidth: 0 }}
    >
      {/* Label — nav text size */}
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.17px",
          color: "rgba(240,240,250,0.55)",
          lineHeight: 1,
        }}
      >
        {label}
      </p>

      {/* Value — display size */}
      <div className="flex items-end gap-2" style={{ lineHeight: 1 }}>
        <span
          style={{
            fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
            fontWeight: 700,
            letterSpacing: "0.96px",
            textTransform: "uppercase",
            color: "#f0f0fa",
            fontFamily: "'Space Grotesk', sans-serif",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.96px",
              color: "rgba(240,240,250,0.6)",
              paddingBottom: "0.25rem",
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Trend indicator */}
      {(trend || trendValue || description) && (
        <p
          className={trendOpacity}
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.17px",
            color: "#f0f0fa",
            marginTop: 2,
          }}
        >
          {trendSymbol} {trendValue ?? description}
        </p>
      )}
    </div>
  );
}
