import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { ALLOWED_PAGES_BY_ROLE } from "../utils/rbac";

export default function AuditLogs() {
  const { tr } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("audit"); // "audit" | "rbac"
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState("All");
  const [selectedAction, setSelectedAction] = useState("All");
  const [search, setSearch] = useState("");

  const fetchAuditLogs = () => {
    setLoading(true);
    const token = localStorage.getItem("tams_jwt_token");
    let url = "http://localhost:5000/api/audit-logs?";
    if (selectedModule !== "All") url += `module=${encodeURIComponent(selectedModule)}&`;
    if (selectedAction !== "All") url += `action=${encodeURIComponent(selectedAction)}&`;
    if (search) url += `search=${encodeURIComponent(search)}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAuditLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching audit logs:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [selectedModule, selectedAction, search]);

  const modulesList = ["All", "Inventory", "Abharanam", "Donations", "Panchangam", "Activities", "Festivals", "Staff", "Priests", "Auth", "System"];
  const actionsList = ["All", "CREATE", "UPDATE", "DELETE", "LOGIN", "VAULT_CHECKOUT", "VAULT_CHECKIN"];

  return (
    <div className="page-container" style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #475569 100%)",
        borderRadius: "16px",
        padding: "28px 32px",
        color: "#fff",
        marginBottom: "28px",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.2)",
        display: "flex",
        justify: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{ fontSize: "2rem" }}>🛡️</span>
            <h1 style={{ margin: 0, fontFamily: "serif", fontSize: "1.8rem", letterSpacing: "0.5px" }}>
              {tr("Enhanced Audit Logging & Granular RBAC")}
            </h1>
          </div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "0.95rem" }}>
            {tr("Real-time security audit trail logging every create, update, delete & vault action across TAMS")}
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          style={{
            padding: "10px 20px",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            backdropFilter: "blur(5px)"
          }}
        >
          🔄 {tr("Refresh Logs")}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", borderBottom: "2px solid #e2e8f0", paddingBottom: "1px" }}>
        <button
          onClick={() => setActiveTab("audit")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "none",
            borderBottom: activeTab === "audit" ? "3px solid #0f172a" : "none",
            fontWeight: activeTab === "audit" ? "bold" : "normal",
            color: activeTab === "audit" ? "#0f172a" : "#64748b",
            fontSize: "0.95rem",
            cursor: "pointer"
          }}
        >
          📋 {tr("Action Audit Trail")} ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab("rbac")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "none",
            borderBottom: activeTab === "rbac" ? "3px solid #0f172a" : "none",
            fontWeight: activeTab === "rbac" ? "bold" : "normal",
            color: activeTab === "rbac" ? "#0f172a" : "#64748b",
            fontSize: "0.95rem",
            cursor: "pointer"
          }}
        >
          🔐 {tr("Granular RBAC Permissions Explorer")}
        </button>
      </div>

      {activeTab === "audit" ? (
        <>
          {/* Controls Bar */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: "16px",
            marginBottom: "20px",
            background: "#fff",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
          }}>
            <input
              type="text"
              placeholder={tr("Search by details, user name, or action (e.g., 'Admin updated stock')...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem"
              }}
            />

            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
            >
              {modulesList.map((m) => (
                <option key={m} value={m}>Module: {m}</option>
              ))}
            </select>

            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
            >
              {actionsList.map((a) => (
                <option key={a} value={a}>Action: {a}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>⏳ Loading Audit Trail...</div>
          ) : (
            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "14px 16px", width: "170px" }}>Timestamp</th>
                    <th style={{ padding: "14px 16px", width: "130px" }}>Action</th>
                    <th style={{ padding: "14px 16px", width: "130px" }}>Module</th>
                    <th style={{ padding: "14px 16px" }}>Detailed Audit Trail Description</th>
                    <th style={{ padding: "14px 16px", width: "180px" }}>Performed By</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id || log._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px 16px", fontSize: "0.82rem", color: "#64748b", fontFamily: "monospace" }}>
                        {log.timestamp}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          padding: "3px 8px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          background:
                            log.action === "CREATE" ? "#dcfce7" :
                            log.action === "UPDATE" ? "#fef3c7" :
                            log.action === "DELETE" ? "#fee2e2" :
                            log.action?.includes("VAULT") ? "#e0e7ff" : "#f1f5f9",
                          color:
                            log.action === "CREATE" ? "#15803d" :
                            log.action === "UPDATE" ? "#b45309" :
                            log.action === "DELETE" ? "#b91c1c" :
                            log.action?.includes("VAULT") ? "#3730a3" : "#475569"
                        }}>
                          {log.action}
                        </span>
                      </td>

                      <td style={{ padding: "14px 16px", fontWeight: "bold", color: "#334155" }}>
                        {log.module}
                      </td>

                      <td style={{ padding: "14px 16px", color: "#0f172a", lineHeight: "1.4" }}>
                        {log.details}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: "600", color: "#0f172a" }}>{log.performed_by}</div>
                        <div style={{ fontSize: "0.75rem", color: "#c08829" }}>{log.user_role || "Administrator"}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        /* RBAC Roles Matrix Explorer */
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
          <h3 style={{ marginTop: 0, color: "#0f172a", fontFamily: "serif" }}>🔐 Role-Based Access Control (RBAC) Matrix</h3>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "20px" }}>
            Below is the current access control privilege configuration matrix for all temple roles:
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>
                <th style={{ padding: "12px" }}>Module Page</th>
                <th style={{ padding: "12px" }}>Administrator</th>
                <th style={{ padding: "12px" }}>Chief Priest / Archaka</th>
                <th style={{ padding: "12px" }}>Treasurer</th>
                <th style={{ padding: "12px" }}>Devasthanam Staff</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Panchangam Rites", key: "panchangam" },
                { name: "Jewelry (Abharanam) Register", key: "abharanam" },
                { name: "Temple Activities & Pooja", key: "activities" },
                { name: "Festivals & Utsavams", key: "festivals" },
                { name: "Donations & Receipts", key: "donations" },
                { name: "Inventory & Stock", key: "inventory" },
                { name: "Annadhanam Seva", key: "annadhanam" },
                { name: "Security Audit Logs", key: "audit" },
                { name: "Reports & Analytics", key: "reports" },
              ].map((p) => (
                <tr key={p.key} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "#0f172a" }}>{p.name}</td>
                  <td style={{ padding: "12px" }}>✅ Allowed</td>
                  <td style={{ padding: "12px" }}>
                    {ALLOWED_PAGES_BY_ROLE.priest.includes(p.key) ? "✅ Allowed" : "❌ Restricted"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {ALLOWED_PAGES_BY_ROLE.treasurer.includes(p.key) ? "✅ Allowed" : "❌ Restricted"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {(ALLOWED_PAGES_BY_ROLE.staff || []).includes(p.key) ? "✅ Allowed" : "❌ Restricted"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
