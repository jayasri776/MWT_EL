import { useMemo, useState } from "react";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";

/**
 * Reports page
 *  - Top chip grid switches between Donation / Inventory / Activity / Festival / Financial
 *  - "Preview" shows a chart (bar or pie, toggle) for the current filters — nothing is saved
 *  - "Generate Report" shows the same chart, then asks the admin to pick Document or Excel Sheet
 *  - Picking a format builds the file client-side and downloads it, and adds a row to
 *    "Recently Generated" — whose own Download buttons re-download that exact report
 */

const REPORT_TYPES = [
  {
    key: "Donation",
    label: "Donation",
    unit: "₹",
    filterLabel: "Purpose",
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
    unit: "",
    filterLabel: "Category",
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
    unit: "",
    filterLabel: "Activity Type",
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
  "var(--sindoor)",
  "var(--gold)",
  "var(--teal)",
  "#7a4fb5",
  "#3f7fbf",
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
        `<tr><td style="padding:6px 10px;border:1px solid #ccc;">${d.label}</td><td style="padding:6px 10px;border:1px solid #ccc;">${type.unit}${d.value.toLocaleString("en-IN")}</td></tr>`,
    )
    .join("");
  return `<html><head><meta charset="utf-8"></head><body style="font-family:Arial, sans-serif;">
    <h2>${type.label} Report</h2>
    <p><b>Period:</b> ${filters.from} to ${filters.to}<br/><b>${type.filterLabel}:</b> ${filters.filterValue}</p>
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

function BarChart({ data, unit }) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const width = 560,
    chartHeight = 160,
    gap = 18;
  const barWidth = (width - gap * (data.length + 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${width} 220`} style={{ width: "100%", height: "auto" }}>
      {data.map((d, i) => {
        const barHeight = (d.value / max) * chartHeight;
        const x = gap + i * (barWidth + gap);
        const y = chartHeight - barHeight + 20;
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="6"
              fill="var(--sindoor)"
            />
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="var(--ink)"
            >
              {unit}
              {d.value.toLocaleString("en-IN")}
            </text>
            <text
              x={x + barWidth / 2}
              y={chartHeight + 38}
              textAnchor="middle"
              fontSize="10"
              fill="var(--ink-soft)"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PieChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = 90,
    cx = 110,
    cy = 110;
  let cumulative = 0;
  const slices = data.map((d, i) => {
    const startAngle = (cumulative / total) * 2 * Math.PI;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI;
    const x1 = cx + radius * Math.sin(startAngle),
      y1 = cy - radius * Math.cos(startAngle);
    const x2 = cx + radius * Math.sin(endAngle),
      y2 = cy - radius * Math.cos(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const path = `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
    return (
      <path
        key={d.label}
        d={path}
        fill={PIE_COLORS[i % PIE_COLORS.length]}
        stroke="var(--paper)"
        strokeWidth="1.5"
      />
    );
  });
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <svg
        viewBox="0 0 220 220"
        style={{ width: 190, height: 190, flexShrink: 0 }}
      >
        {slices}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.map((d, i) => (
          <div
            key={d.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: PIE_COLORS[i % PIE_COLORS.length],
                display: "inline-block",
              }}
            />
            {d.label} — {((d.value / total) * 100).toFixed(1)}%
          </div>
        ))}
      </div>
    </div>
  );
}

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
  const [chartMode, setChartMode] = useState("bar"); // 'bar' | 'pie'
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
        .report-chart-box{flex:1;min-width:300px;background:var(--ivory);border-radius:14px;padding:18px;border:1px solid var(--stone);}
        .report-format-box{width:230px;display:flex;flex-direction:column;gap:10px;}
        .chart-toggle{display:flex;gap:8px;margin-bottom:12px;}
        .chart-toggle button{
          border:1px solid var(--stone-dark);background:var(--paper);border-radius:8px;padding:5px 12px;
          font-size:11.5px;cursor:pointer;color:var(--ink-soft);
        }
        .chart-toggle button.active{background:var(--sindoor);color:#fff;border-color:var(--sindoor);}
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
          <h3>{tr("Report Generator")} — {tr(activeType.label)}</h3>
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
              {tr("Preview Report")}
            </button>
            <button className="btn-primary" onClick={handleGenerate}>
              {tr("Generate & Download")}
            </button>
          </div>

          {stage === "chart" && (
            <div className="report-chart-panel">
              <div className="report-chart-box">
                <div className="chart-toggle">
                  <button
                    className={chartMode === "bar" ? "active" : ""}
                    onClick={() => setChartMode("bar")}
                  >
                    {tr("Bar Chart")}
                  </button>
                  <button
                    className={chartMode === "pie" ? "active" : ""}
                    onClick={() => setChartMode("pie")}
                  >
                    {tr("Pie Chart")}
                  </button>
                </div>
                {chartMode === "bar" ? (
                  <BarChart
                    data={activeType.chartData.map(d => ({ ...d, label: tr(d.label) }))}
                    unit={activeType.unit}
                  />
                ) : (
                  <PieChart data={activeType.chartData.map(d => ({ ...d, label: tr(d.label) }))} />
                )}
              </div>

              {pendingDownload && (
                <div className="report-format-box">
                  <p
                    style={{
                      fontSize: 12,
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
