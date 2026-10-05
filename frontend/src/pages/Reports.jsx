import { useMemo, useState } from "react";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";

/**
 * Reports page
 *  - Top chip grid switches between Donation / Inventory / Activity / Festival / Financial
 *  - Provides 3 Chart Types: Bar Chart, Pie Chart, and Scatter Chart
 *  - Includes explicit X-Axis and Y-Axis labels, grid lines, tick marks, legends, and descriptions
 */

const REPORT_TYPES = [
  {
    key: "Donation",
    label: "Donation",
    unit: "₹",
    filterLabel: "Purpose",
    xAxisLabel: "Donation Purpose Category (Annadhanam, Renovation, etc.)",
    yAxisLabel: "Total Amount Collected (in ₹ INR)",
    chartTitle: "Donation Collection vs. Donation Purpose",
    chartDescription: "This chart illustrates the total monetary donations (₹) received, categorized by temple purpose.",
    filterOptions: [
      "All Purposes",
      "Annadhanam",
      "Renovation",
      "General",
      "Festival",
    ],
    chartData: [
      { label: "Annadhanam", value: 186000 },
      { label: "Renovation", value: 412000 },
      { label: "General", value: 97000 },
      { label: "Festival", value: 154000 },
    ],
  },
  {
    key: "Inventory",
    label: "Inventory",
    unit: "Units",
    filterLabel: "Category",
    xAxisLabel: "Inventory Category (Pooja Items, Groceries, etc.)",
    yAxisLabel: "Total Stock Quantity (in Units)",
    chartTitle: "Stock Quantity vs. Inventory Category",
    chartDescription: "This chart displays the physical stock count of essential temple items available in store.",
    filterOptions: [
      "All Categories",
      "Pooja Items",
      "Groceries",
      "Maintenance",
      "Electronics",
    ],
    chartData: [
      { label: "Pooja Items", value: 320 },
      { label: "Groceries", value: 540 },
      { label: "Maintenance", value: 120 },
      { label: "Electronics", value: 45 },
    ],
  },
  {
    key: "Activity",
    label: "Activity",
    unit: "Rites",
    filterLabel: "Activity Type",
    xAxisLabel: "Ritual & Service Type (Abhishekam, Homam, etc.)",
    yAxisLabel: "Number of Rituals Performed",
    chartTitle: "Ritual Counts vs. Activity Type",
    chartDescription: "This chart shows the volume of religious rites and sacred activities conducted by temple priests.",
    filterOptions: [
      "All Activities",
      "Abhishekam",
      "Homam",
      "Annadhanam",
      "Cultural",
    ],
    chartData: [
      { label: "Abhishekam", value: 62 },
      { label: "Homam", value: 34 },
      { label: "Annadhanam", value: 120 },
      { label: "Cultural", value: 18 },
    ],
  },
  {
    key: "Festival",
    label: "Festival",
    unit: "₹",
    filterLabel: "Festival",
    xAxisLabel: "Festival Utsavam (Skanda Sashti, Thaipusam, etc.)",
    yAxisLabel: "Festival Budget & Revenue (in ₹ INR)",
    chartTitle: "Devotee Contributions vs. Festival Utsavam",
    chartDescription: "This chart compares total funds raised and allocated for major temple festivals and utsavams.",
    filterOptions: [
      "All Festivals",
      "Skanda Sashti",
      "Thaipusam",
      "Panguni Uthiram",
    ],
    chartData: [
      { label: "Skanda Sashti", value: 480000 },
      { label: "Thaipusam", value: 210000 },
      { label: "Panguni Uthiram", value: 96000 },
    ],
  },
  {
    key: "Financial",
    label: "Financial",
    unit: "₹",
    filterLabel: "Account Head",
    xAxisLabel: "Financial Account Head (Income, Expense, etc.)",
    yAxisLabel: "Financial Amount (in ₹ INR)",
    chartTitle: "Devasthanam Treasury vs. Account Head",
    chartDescription: "This chart outlines the financial balance of income, operational expenses, donations, and maintenance.",
    filterOptions: [
      "All Accounts",
      "Income",
      "Expense",
      "Donations",
      "Maintenance",
    ],
    chartData: [
      { label: "Income", value: 920000 },
      { label: "Expense", value: 640000 },
      { label: "Donations", value: 849000 },
      { label: "Maintenance", value: 130000 },
    ],
  },
];

const PIE_COLORS = [
  "#9a2b25",
  "#c08829",
  "#14544b",
  "#7a4fb5",
  "#2563eb",
];

const INITIAL_RECENT = [
  {
    id: "r1",
    name: "July Donation Summary",
    type: "Donation",
    period: "01–31 Jul",
    generatedBy: "Padmavathy R.",
    date: "01 Aug",
    format: "Document",
    snapshot: {
      typeKey: "Donation",
      filterValue: "All Purposes",
      from: "2026-07-01",
      to: "2026-07-31",
      chartData: REPORT_TYPES[0].chartData,
    },
  },
  {
    id: "r2",
    name: "Q2 Financial Statement",
    type: "Financial",
    period: "Apr–Jun",
    generatedBy: "Padmavathy R.",
    date: "03 Jul",
    format: "Excel",
    snapshot: {
      typeKey: "Financial",
      filterValue: "All Accounts",
      from: "2026-04-01",
      to: "2026-06-30",
      chartData: REPORT_TYPES[4].chartData,
    },
  },
  {
    id: "r3",
    name: "Inventory Stock Audit",
    type: "Inventory",
    period: "Jul 2026",
    generatedBy: "Bhaskaran N.",
    date: "28 Jul",
    format: "Document",
    snapshot: {
      typeKey: "Inventory",
      filterValue: "All Categories",
      from: "2026-07-01",
      to: "2026-07-28",
      chartData: REPORT_TYPES[1].chartData,
    },
  },
];

function buildCSV(type, filters, chartData) {
  const rows = [
    [`${type.label} Report`],
    ["Period", `${filters.from} to ${filters.to}`],
    [type.filterLabel, filters.filterValue],
    ["X-Axis Label", type.xAxisLabel],
    ["Y-Axis Label", type.yAxisLabel],
    [],
    [type.filterLabel, type.unit ? `Value (${type.unit})` : "Value"],
    ...chartData.map((d) => [d.label, d.value]),
  ];
  return rows.map((r) => r.join(",")).join("\n");
}

function buildDocHTML(type, filters, chartData) {
  const rowsHtml = chartData
    .map(
      (d) =>
        `<tr><td style="padding:6px 10px;border:1px solid #ccc;">${d.label}</td><td style="padding:6px 10px;border:1px solid #ccc;">${type.unit === "₹" ? "₹" : ""}${d.value.toLocaleString("en-IN")} ${type.unit !== "₹" ? type.unit : ""}</td></tr>`,
    )
    .join("");
  return `<html><head><meta charset="utf-8"></head><body style="font-family:Arial, sans-serif;">
    <h2>${type.label} Report</h2>
    <p><b>Period:</b> ${filters.from} to ${filters.to}<br/><b>${type.filterLabel}:</b> ${filters.filterValue}</p>
    <p><b>X-Axis:</b> ${type.xAxisLabel}<br/><b>Y-Axis:</b> ${type.yAxisLabel}</p>
    <table style="border-collapse:collapse;">
      <tr><th style="padding:6px 10px;border:1px solid #ccc;text-align:left;">${type.filterLabel}</th><th style="padding:6px 10px;border:1px solid #ccc;text-align:left;">Value</th></tr>
      ${rowsHtml}
    </table>
  </body></html>`;
}

function triggerDownload(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadReport(type, filters, chartData, format) {
  const safeName = `${type.label}_Report_${filters.from}_to_${filters.to}`;
  if (format === "Excel") {
    triggerDownload(
      `${safeName}.csv`,
      buildCSV(type, filters, chartData),
      "text/csv",
    );
  } else {
    triggerDownload(
      `${safeName}.doc`,
      buildDocHTML(type, filters, chartData),
      "application/msword",
    );
  }
}

// -------------------------------------------------------------
// 1. Enhanced Bar Chart (with X-Axis, Y-Axis, Ticks, Grid Lines)
// -------------------------------------------------------------
function BarChart({ data, unit, xAxisLabel, yAxisLabel, chartTitle, chartDescription }) {
  const rawMax = Math.max(...data.map((d) => d.value)) || 100;
  // Nice round max ceiling
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const max = Math.ceil(rawMax / magnitude) * magnitude || rawMax;

  const svgWidth = 660;
  const svgHeight = 320;
  const plotLeft = 85;
  const plotRight = 630;
  const plotTop = 45;
  const plotBottom = 240;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((max / tickCount) * i));

  const gap = 20;
  const barWidth = (plotWidth - gap * (data.length + 1)) / data.length;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "12px", borderBottom: "1px solid var(--stone, #e3d9c4)", paddingBottom: "8px" }}>
        <h4 style={{ margin: 0, color: "var(--sindoor, #9a2b25)", fontSize: "1.05rem", fontFamily: "serif" }}>
          📊 {chartTitle}
        </h4>
        <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--ink-soft, #6b5d4f)" }}>
          {chartDescription}
        </p>
      </div>

      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: "100%", height: "auto", background: "#fffdf8", borderRadius: "8px" }}>
        {/* Background Grid Lines & Y-Axis Ticks */}
        {yTicks.map((val) => {
          const y = plotBottom - (val / max) * plotHeight;
          return (
            <g key={`y_grid_${val}`}>
              {/* Horizontal Grid Line */}
              <line
                x1={plotLeft}
                y1={y}
                x2={plotRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              {/* Y-Tick Mark */}
              <line x1={plotLeft - 5} y1={y} x2={plotLeft} y2={y} stroke="#475569" strokeWidth="1.5" />
              {/* Y-Tick Text Value */}
              <text
                x={plotLeft - 9}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fontWeight="500"
                fill="#475569"
              >
                {unit === "₹" ? "₹" : ""}{val >= 1000 ? `${(val / 1000).toLocaleString("en-IN")}k` : val}
              </text>
            </g>
          );
        })}

        {/* Y-AXIS LINE */}
        <line x1={plotLeft} y1={plotTop - 10} x2={plotLeft} y2={plotBottom} stroke="#2a1f17" strokeWidth="2" />
        {/* Y-Axis Arrowhead */}
        <path d={`M${plotLeft - 4},${plotTop - 6} L${plotLeft},${plotTop - 14} L${plotLeft + 4},${plotTop - 6}`} fill="#2a1f17" />
        {/* Y-AXIS ROTATED LABEL */}
        <text
          x={-(plotTop + plotHeight / 2)}
          y={20}
          transform="rotate(-90)"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#9a2b25"
        >
          Y-Axis: {yAxisLabel}
        </text>

        {/* X-AXIS LINE */}
        <line x1={plotLeft} y1={plotBottom} x2={plotRight + 10} y2={plotBottom} stroke="#2a1f17" strokeWidth="2" />
        {/* X-Axis Arrowhead */}
        <path d={`M${plotRight + 6},${plotBottom - 4} L${plotRight + 14},${plotBottom} L${plotRight + 6},${plotBottom + 4}`} fill="#2a1f17" />
        {/* X-AXIS LABEL */}
        <text
          x={plotLeft + plotWidth / 2}
          y={plotBottom + 52}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#9a2b25"
        >
          X-Axis: {xAxisLabel}
        </text>

        {/* Bars and Data Labels */}
        {data.map((d, i) => {
          const barHeight = (d.value / max) * plotHeight;
          const x = plotLeft + gap + i * (barWidth + gap);
          const y = plotBottom - barHeight;
          const barColor = PIE_COLORS[i % PIE_COLORS.length];

          return (
            <g key={d.label}>
              {/* X-Tick Mark */}
              <line x1={x + barWidth / 2} y1={plotBottom} x2={x + barWidth / 2} y2={plotBottom + 5} stroke="#475569" strokeWidth="1.5" />

              {/* Bar Rect */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="5"
                fill={barColor}
                stroke="#fff"
                strokeWidth="1"
              >
                <title>{`${d.label}: ${unit === "₹" ? "₹" : ""}${d.value.toLocaleString("en-IN")} ${unit !== "₹" ? unit : ""}`}</title>
              </rect>

              {/* Top Value Label above Bar */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#2a1f17"
              >
                {unit === "₹" ? "₹" : ""}{d.value.toLocaleString("en-IN")}
              </text>

              {/* X-Axis Label under Bar */}
              <text
                x={x + barWidth / 2}
                y={plotBottom + 20}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="600"
                fill="#2a1f17"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend & Summary Box */}
      <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
        {data.map((d, i) => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", background: "#f8fafc", padding: "4px 10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <strong>{d.label}:</strong> {unit === "₹" ? "₹" : ""}{d.value.toLocaleString("en-IN")}
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. Enhanced Pie Chart (with Percentage breakdown & Legend Key)
// -------------------------------------------------------------
function PieChart({ data, unit, chartTitle, chartDescription }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = 95, cx = 115, cy = 115;
  let cumulative = 0;

  const slices = data.map((d, i) => {
    const startAngle = (cumulative / total) * 2 * Math.PI;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI;
    const x1 = cx + radius * Math.sin(startAngle);
    const y1 = cy - radius * Math.cos(startAngle);
    const x2 = cx + radius * Math.sin(endAngle);
    const y2 = cy - radius * Math.cos(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const path = `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;

    const midAngle = startAngle + (endAngle - startAngle) / 2;
    const labelX = cx + (radius * 0.65) * Math.sin(midAngle);
    const labelY = cy - (radius * 0.65) * Math.cos(midAngle);
    const pct = ((d.value / total) * 100).toFixed(1);

    return (
      <g key={d.label}>
        <path
          d={path}
          fill={PIE_COLORS[i % PIE_COLORS.length]}
          stroke="#fff"
          strokeWidth="2"
        >
          <title>{`${d.label}: ${unit === "₹" ? "₹" : ""}${d.value.toLocaleString("en-IN")} (${pct}%)`}</title>
        </path>
        {pct > 5 && (
          <text
            x={labelX}
            y={labelY + 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill="#ffffff"
          >
            {pct}%
          </text>
        )}
      </g>
    );
  });

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "12px", borderBottom: "1px solid var(--stone, #e3d9c4)", paddingBottom: "8px" }}>
        <h4 style={{ margin: 0, color: "var(--sindoor, #9a2b25)", fontSize: "1.05rem", fontFamily: "serif" }}>
          🍕 {chartTitle} (Proportional Share)
        </h4>
        <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--ink-soft, #6b5d4f)" }}>
          {chartDescription} Represents relative percentage breakdown of the total ({unit === "₹" ? "₹" : ""}{total.toLocaleString("en-IN")}).
        </p>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <svg viewBox="0 0 230 230" style={{ width: 210, height: 210, flexShrink: 0 }}>
          {slices}
        </svg>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: "220px" }}>
          {data.map((d, i) => {
            const pct = ((d.value / total) * 100).toFixed(1);
            return (
              <div
                key={d.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.85rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: PIE_COLORS[i % PIE_COLORS.length],
                      display: "inline-block",
                    }}
                  />
                  <strong style={{ color: "#2a1f17" }}>{d.label}</strong>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: "bold", color: "#9a2b25" }}>
                    {unit === "₹" ? "₹" : ""}{d.value.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{pct}% share</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. New Scatter Chart (with Cartesian X/Y Axis, Trend line & Points)
// -------------------------------------------------------------
function ScatterChart({ data, unit, xAxisLabel, yAxisLabel, chartTitle, chartDescription }) {
  const rawMax = Math.max(...data.map((d) => d.value)) || 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const max = Math.ceil(rawMax / magnitude) * magnitude || rawMax;

  const svgWidth = 660;
  const svgHeight = 320;
  const plotLeft = 85;
  const plotRight = 630;
  const plotTop = 45;
  const plotBottom = 240;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((max / tickCount) * i));

  // Compute Scatter Points coordinates
  const points = data.map((d, i) => {
    const x = plotLeft + ((i + 0.5) / data.length) * plotWidth;
    const y = plotBottom - (d.value / max) * plotHeight;
    return { ...d, x, y, index: i };
  });

  // Polyline string connecting scatter points
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "12px", borderBottom: "1px solid var(--stone, #e3d9c4)", paddingBottom: "8px" }}>
        <h4 style={{ margin: 0, color: "var(--sindoor, #9a2b25)", fontSize: "1.05rem", fontFamily: "serif" }}>
          📈 {chartTitle} (Scatter Distribution Plot)
        </h4>
        <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--ink-soft, #6b5d4f)" }}>
          {chartDescription} Plots metric point values on a Cartesian X/Y coordinate plane.
        </p>
      </div>

      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: "100%", height: "auto", background: "#fffdf8", borderRadius: "8px" }}>
        {/* Background Grid Lines & Y-Ticks */}
        {yTicks.map((val) => {
          const y = plotBottom - (val / max) * plotHeight;
          return (
            <g key={`y_scatter_grid_${val}`}>
              <line
                x1={plotLeft}
                y1={y}
                x2={plotRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line x1={plotLeft - 5} y1={y} x2={plotLeft} y2={y} stroke="#475569" strokeWidth="1.5" />
              <text
                x={plotLeft - 9}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fontWeight="500"
                fill="#475569"
              >
                {unit === "₹" ? "₹" : ""}{val >= 1000 ? `${(val / 1000).toLocaleString("en-IN")}k` : val}
              </text>
            </g>
          );
        })}

        {/* Y-AXIS LINE */}
        <line x1={plotLeft} y1={plotTop - 10} x2={plotLeft} y2={plotBottom} stroke="#2a1f17" strokeWidth="2" />
        <path d={`M${plotLeft - 4},${plotTop - 6} L${plotLeft},${plotTop - 14} L${plotLeft + 4},${plotTop - 6}`} fill="#2a1f17" />
        {/* Y-AXIS ROTATED LABEL */}
        <text
          x={-(plotTop + plotHeight / 2)}
          y={20}
          transform="rotate(-90)"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#9a2b25"
        >
          Y-Axis: {yAxisLabel}
        </text>

        {/* X-AXIS LINE */}
        <line x1={plotLeft} y1={plotBottom} x2={plotRight + 10} y2={plotBottom} stroke="#2a1f17" strokeWidth="2" />
        <path d={`M${plotRight + 6},${plotBottom - 4} L${plotRight + 14},${plotBottom} L${plotRight + 6},${plotBottom + 4}`} fill="#2a1f17" />
        {/* X-AXIS LABEL */}
        <text
          x={plotLeft + plotWidth / 2}
          y={plotBottom + 52}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#9a2b25"
        >
          X-Axis: {xAxisLabel}
        </text>

        {/* Connecting Trend Line */}
        <polyline
          fill="none"
          stroke="var(--gold, #c08829)"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          points={polylinePoints}
        />

        {/* Scatter Points & Labels */}
        {points.map((p, i) => {
          const pointColor = PIE_COLORS[i % PIE_COLORS.length];
          return (
            <g key={p.label}>
              {/* Vertical guideline from point to X-axis */}
              <line
                x1={p.x}
                y1={p.y}
                x2={p.x}
                y2={plotBottom}
                stroke="#cbd5e1"
                strokeDasharray="2 2"
                strokeWidth="1"
              />

              {/* X-Tick Mark */}
              <line x1={p.x} y1={plotBottom} x2={p.x} y2={plotBottom + 5} stroke="#475569" strokeWidth="1.5" />

              {/* Outer Pulse Circle */}
              <circle cx={p.x} cy={p.y} r="12" fill={pointColor} opacity="0.18" />

              {/* Core Scatter Point Circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r="7"
                fill={pointColor}
                stroke="#ffffff"
                strokeWidth="2"
              >
                <title>{`Point (${p.label}): ${unit === "₹" ? "₹" : ""}${p.value.toLocaleString("en-IN")}`}</title>
              </circle>

              {/* Value Badge above Point */}
              <rect
                x={p.x - 45}
                y={p.y - 30}
                width="90"
                height="18"
                rx="4"
                fill="#2a1f17"
                opacity="0.85"
              />
              <text
                x={p.x}
                y={p.y - 17}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#ffffff"
              >
                {unit === "₹" ? "₹" : ""}{p.value.toLocaleString("en-IN")}
              </text>

              {/* X-Axis Category Label */}
              <text
                x={p.x}
                y={plotBottom + 20}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="600"
                fill="#2a1f17"
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Scatter Legend Summary */}
      <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
        {points.map((p, i) => (
          <div key={p.label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", background: "#f8fafc", padding: "4px 10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <strong>({p.label}, {unit === "₹" ? "₹" : ""}{p.value.toLocaleString("en-IN")})</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Main Reports Component
// -------------------------------------------------------------
export default function Reports() {
  const { showToast } = useToast();
  const { tr } = useLanguage();
  const [activeKey, setActiveKey] = useState("Donation");
  const [fromDate, setFromDate] = useState("2026-08-01");
  const [toDate, setToDate] = useState("2026-08-08");
  const [filterValue, setFilterValue] = useState(
    REPORT_TYPES[0].filterOptions[0],
  );
  const [stage, setStage] = useState("form"); // 'form' | 'chart'
  const [pendingDownload, setPendingDownload] = useState(false);
  const [chartMode, setChartMode] = useState("bar"); // 'bar' | 'pie' | 'scatter'
  const [recent, setRecent] = useState(INITIAL_RECENT);

  const activeType = useMemo(
    () => REPORT_TYPES.find((t) => t.key === activeKey),
    [activeKey],
  );

  function switchType(key) {
    setActiveKey(key);
    const type = REPORT_TYPES.find((t) => t.key === key);
    setFilterValue(type.filterOptions[0]);
    setStage("form");
    setPendingDownload(false);
  }

  function handlePreview() {
    setStage("chart");
    setPendingDownload(false);
  }

  function handleGenerate() {
    setStage("chart");
    setPendingDownload(true);
  }

  function handlePickFormat(format) {
    const filters = { from: fromDate, to: toDate, filterValue };
    downloadReport(activeType, filters, activeType.chartData, format);

    const today = new Date();
    const dateLabel = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
    const newRow = {
      id: `r${Date.now()}`,
      name: `${activeType.label} Report — ${filterValue}`,
      type: activeType.label,
      period: `${fromDate} to ${toDate}`,
      generatedBy: "You (Admin)",
      date: dateLabel,
      format,
      snapshot: {
        typeKey: activeType.key,
        filterValue,
        from: fromDate,
        to: toDate,
        chartData: activeType.chartData,
      },
    };
    setRecent((prev) => [newRow, ...prev]);
    setPendingDownload(false);
    showToast(
      `${tr("Report downloaded as")} ${format === "Excel" ? tr("Excel Sheet (CSV)") : tr("Document (Doc)")}`,
    );
  }

  function handleDownloadExisting(row) {
    const type =
      REPORT_TYPES.find((t) => t.key === row.snapshot.typeKey) || activeType;
    const filters = {
      from: row.snapshot.from,
      to: row.snapshot.to,
      filterValue: row.snapshot.filterValue,
    };
    downloadReport(type, filters, row.snapshot.chartData, row.format);
    showToast(`${tr("Re-downloading")} "${row.name}"`);
  }

  return (
    <div className="reports-page">
      <style>{`
        .report-chart-panel{display:flex;gap:18px;margin-top:18px;flex-wrap:wrap;}
        .report-chart-box{flex:1;min-width:320px;background:var(--ivory);border-radius:14px;padding:22px;border:1px solid var(--stone);}
        .report-format-box{width:230px;display:flex;flex-direction:column;gap:10px;}
        .chart-toggle{display:flex;gap:8px;margin-bottom:16px;background:#eee5d3;padding:4px;border-radius:10px;width:fit-content;}
        .chart-toggle button{
          border:none;background:transparent;border-radius:8px;padding:6px 14px;
          font-size:12px;font-weight:bold;cursor:pointer;color:var(--ink-soft);transition:all 0.2s;
        }
        .chart-toggle button.active{background:var(--sindoor);color:#fff;box-shadow:0 2px 6px rgba(154,43,37,0.3);}
        .format-card{
          border:1px solid var(--stone);border-radius:12px;padding:14px 16px;background:var(--paper);
          text-align:left;cursor:pointer;transition:box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .format-card:hover{box-shadow:var(--shadow);border-color:var(--sindoor);}
        .format-card .ft{font-weight:600;font-size:13px;margin-bottom:2px;}
        .format-card .fd{font-size:11px;color:var(--ink-faint);}
        .report-type{cursor:pointer;}
      `}</style>

      <div className="report-type-grid">
        {REPORT_TYPES.map((t) => (
          <div
            key={t.key}
            className={`report-type${activeKey === t.key ? " active" : ""}`}
            onClick={() => switchType(t.key)}
          >
            <div className="lbl">{tr(t.label)}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>{tr("Report Analytics Generator")} — {tr(activeType.label)}</h3>
        </div>
        <div className="panel-body">
          <div className="form-grid">
            <div className="field">
              <label>{tr("From Date")}</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label>{tr("To Date")}</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label>{tr(activeType.filterLabel)}</label>
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                {activeType.filterOptions.map((o) => (
                  <option key={o} value={o}>{tr(o)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-secondary" onClick={handlePreview}>
              👁️ {tr("Preview Report & Charts")}
            </button>
            <button className="btn-primary" onClick={handleGenerate}>
              📥 {tr("Generate & Download")}
            </button>
          </div>

          {stage === "chart" && (
            <div className="report-chart-panel">
              <div className="report-chart-box">
                {/* 3 Chart Mode Selectors */}
                <div className="chart-toggle">
                  <button
                    className={chartMode === "bar" ? "active" : ""}
                    onClick={() => setChartMode("bar")}
                  >
                    📊 {tr("Bar Chart")}
                  </button>
                  <button
                    className={chartMode === "pie" ? "active" : ""}
                    onClick={() => setChartMode("pie")}
                  >
                    🍕 {tr("Pie Chart")}
                  </button>
                  <button
                    className={chartMode === "scatter" ? "active" : ""}
                    onClick={() => setChartMode("scatter")}
                  >
                    📈 {tr("Scatter Chart")}
                  </button>
                </div>

                {chartMode === "bar" && (
                  <BarChart
                    data={activeType.chartData.map(d => ({ ...d, label: tr(d.label) }))}
                    unit={activeType.unit}
                    xAxisLabel={tr(activeType.xAxisLabel)}
                    yAxisLabel={tr(activeType.yAxisLabel)}
                    chartTitle={tr(activeType.chartTitle)}
                    chartDescription={tr(activeType.chartDescription)}
                  />
                )}

                {chartMode === "pie" && (
                  <PieChart
                    data={activeType.chartData.map(d => ({ ...d, label: tr(d.label) }))}
                    unit={activeType.unit}
                    chartTitle={tr(activeType.chartTitle)}
                    chartDescription={tr(activeType.chartDescription)}
                  />
                )}

                {chartMode === "scatter" && (
                  <ScatterChart
                    data={activeType.chartData.map(d => ({ ...d, label: tr(d.label) }))}
                    unit={activeType.unit}
                    xAxisLabel={tr(activeType.xAxisLabel)}
                    yAxisLabel={tr(activeType.yAxisLabel)}
                    chartTitle={tr(activeType.chartTitle)}
                    chartDescription={tr(activeType.chartDescription)}
                  />
                )}
              </div>

              {pendingDownload && (
                <div className="report-format-box">
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: "var(--ink-soft)",
                      margin: "0 0 4px",
                    }}
                  >
                    {tr("Download this report as:")}
                  </p>
                  <div
                    className="format-card"
                    onClick={() => handlePickFormat("Document")}
                  >
                    <div className="ft">📄 {tr("Document (Doc)")}</div>
                    <div className="fd">{tr("Word-compatible .doc file")}</div>
                  </div>
                  <div
                    className="format-card"
                    onClick={() => handlePickFormat("Excel")}
                  >
                    <div className="ft">📊 {tr("Excel Sheet (CSV)")}</div>
                    <div className="fd">{tr(".csv, opens directly in Excel")}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>{tr("Recently Generated Reports")}</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>{tr("Report")}</th>
              <th>{tr("Type")}</th>
              <th>{tr("Period")}</th>
              <th>{tr("Generated By")}</th>
              <th>{tr("Date")}</th>
              <th>{tr("Format")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.id}>
                <td className="cell-name">{tr(r.name)}</td>
                <td>{tr(r.type)}</td>
                <td className="mono">{r.period}</td>
                <td>{tr(r.generatedBy)}</td>
                <td className="mono">{r.date}</td>
                <td className="mono">{tr(r.format)}</td>
                <td>
                  <button
                    className="btn-ghost"
                    onClick={() => handleDownloadExisting(r)}
                  >
                    {tr("Download")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

