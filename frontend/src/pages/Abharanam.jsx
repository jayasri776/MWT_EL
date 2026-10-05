import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Pagination from "../components/Pagination";

export default function Abharanam() {
  const { tr } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "movements"
  const [ornaments, setOrnaments] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [metalFilter, setMetalFilter] = useState("All");

  // Pagination State for Inventory Tab
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Pagination State for Movements Tab
  const [movCurrentPage, setMovCurrentPage] = useState(1);
  const [movPageSize, setMovPageSize] = useState(5);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState(null);


  // New Ornament Form State
  const [newOrnament, setNewOrnament] = useState({
    name: "",
    deity: "Lord Subramaniya Swamy",
    category: "Crown (Kireedam)",
    metal_type: "22K Gold",
    gross_weight_grams: "",
    net_weight_grams: "",
    stone_weight_carats: "",
    hallmark_cert: "BIS-HM-" + Math.floor(100000 + Math.random() * 900000),
    estimated_value_inr: "",
    insurance_policy: "National Insurance #POL-2026-" + Math.floor(1000 + Math.random() * 9000),
    insurance_expiry: "2027-12-31",
    vault_location: "Main Vault A - Locker 01",
    status: "In Vault",
    notes: "",
  });

  // Vault Movement Form State
  const [movementForm, setMovementForm] = useState({
    action: "Vault Issue (Check Out)",
    issued_to_priest: "Ganesan Sivachariar (Chief Priest)",
    authorized_by: user?.name || "Temple Administrator",
    deity_adorned: "Lord Subramaniya Swamy",
    purpose: "Festival Sanctum Alankaram",
    security_witness: "Muthu Kumar (Security Supervisor)",
    notes: "",
  });

  const fetchData = () => {
    setLoading(true);
    const token = localStorage.getItem("tams_jwt_token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("http://localhost:5000/api/abharanam", { headers }).then((res) => res.json()),
      fetch("http://localhost:5000/api/abharanam/movements", { headers }).then((res) => res.json()),
    ])
      .then(([ornamentDocs, movementDocs]) => {
        setOrnaments(Array.isArray(ornamentDocs) ? ornamentDocs : []);
        setMovements(Array.isArray(movementDocs) ? movementDocs : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching Abharanam data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddOrnament = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("tams_jwt_token");
    fetch("http://localhost:5000/api/abharanam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newOrnament),
    })
      .then((res) => res.json())
      .then(() => {
        showToast("Sacred Ornament added to Vault Register!", "success");
        setShowAddModal(false);
        fetchData();
      })
      .catch(() => showToast("Failed to add ornament record.", "error"));
  };

  const handleLogMovement = (e) => {
    e.preventDefault();
    if (!selectedItemForMovement) return;
    const token = localStorage.getItem("tams_jwt_token");

    const payload = {
      ...movementForm,
      abharanam_id: selectedItemForMovement.id || selectedItemForMovement._id,
      item_code: selectedItemForMovement.item_code,
      abharanam_name: selectedItemForMovement.name,
    };

    fetch("http://localhost:5000/api/abharanam/movements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        showToast("Vault movement & Alankaram log recorded successfully!", "success");
        setShowMovementModal(false);
        setSelectedItemForMovement(null);
        fetchData();
      })
      .catch(() => showToast("Failed to log vault movement.", "error"));
  };

  // KPI Computations
  const totalGoldGrams = ornaments
    .filter((o) => (o.metal_type || "").includes("Gold"))
    .reduce((sum, o) => sum + (Number(o.net_weight_grams) || 0), 0);

  const totalSilverGrams = ornaments
    .filter((o) => (o.metal_type || "").includes("Silver"))
    .reduce((sum, o) => sum + (Number(o.net_weight_grams) || 0), 0);

  const totalValuation = ornaments.reduce((sum, o) => sum + (Number(o.estimated_value_inr) || 0), 0);

  const totalInVault = ornaments.filter((o) => o.status === "In Vault").length;
  const totalAdorning = ornaments.filter((o) => o.status === "Adorning Deity").length;

  const filteredOrnaments = ornaments.filter((o) => {
    const matchesSearch =
      (o.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.item_code || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.deity || "").toLowerCase().includes(search.toLowerCase());
    const matchesMetal = metalFilter === "All" || (o.metal_type || "").includes(metalFilter);
    return matchesSearch && matchesMetal;
  });

  // Reset page when search or metal filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, metalFilter]);

  const paginatedOrnaments = filteredOrnaments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const paginatedMovements = movements.slice(
    (movCurrentPage - 1) * movPageSize,
    movCurrentPage * movPageSize
  );

  return (
    <div className="page-container" style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, #14544b 0%, #0d3a34 50%, #c08829 100%)",
        borderRadius: "16px",
        padding: "28px 32px",
        color: "#fff",
        marginBottom: "28px",
        boxShadow: "0 10px 30px rgba(13, 58, 52, 0.2)",
        display: "flex",
        justify: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{ fontSize: "2rem" }}>👑</span>
            <h1 style={{ margin: 0, fontFamily: "serif", fontSize: "1.8rem", letterSpacing: "0.5px" }}>
              {tr("Sacred Ornaments & Jewelry (Abharanam) Register")}
            </h1>
          </div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "0.95rem" }}>
            {tr("Vault register for precious Gold, Silver, Diamonds, Gram/Carat tracking & Alankaram movements")}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: "12px 24px",
            background: "#c08829",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(192, 136, 41, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          ➕ {tr("Add New Sacred Ornament")}
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "18px",
        marginBottom: "28px"
      }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "5px solid #c08829", borderRadius: "12px", padding: "18px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: "bold", color: "#b45309", textTransform: "uppercase" }}>GOLD NET WEIGHT</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#2a1f17", margin: "6px 0 2px" }}>
            {totalGoldGrams.toLocaleString("en-IN", { maximumFractionDigits: 2 })} g
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Registered in Safe Vault</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "5px solid #64748b", borderRadius: "12px", padding: "18px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: "bold", color: "#475569", textTransform: "uppercase" }}>SILVER NET WEIGHT</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#2a1f17", margin: "6px 0 2px" }}>
            {(totalSilverGrams / 1000).toFixed(2)} kg
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{totalSilverGrams.toLocaleString("en-IN")} grams</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "5px solid #10b981", borderRadius: "12px", padding: "18px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: "bold", color: "#047857", textTransform: "uppercase" }}>ESTIMATED VALUATION</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#065f46", margin: "6px 0 2px" }}>
            ₹{(totalValuation / 100000).toFixed(2)} Lakhs
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Insured under Devasthanam Board</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: "5px solid #3b82f6", borderRadius: "12px", padding: "18px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: "bold", color: "#1d4ed8", textTransform: "uppercase" }}>VAULT STATUS</div>
          <div style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#1e293b", margin: "6px 0 2px" }}>
            🔒 {totalInVault} Vault / ✨ {totalAdorning} Deity
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{ornaments.length} Total Sacred Ornaments</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", borderBottom: "2px solid #e2e8f0", paddingBottom: "1px" }}>
        <button
          onClick={() => setActiveTab("inventory")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "none",
            borderBottom: activeTab === "inventory" ? "3px solid #14544b" : "none",
            fontWeight: activeTab === "inventory" ? "bold" : "normal",
            color: activeTab === "inventory" ? "#14544b" : "#64748b",
            fontSize: "0.95rem",
            cursor: "pointer"
          }}
        >
          💎 {tr("Gold & Silver Inventory Register")} ({ornaments.length})
        </button>

        <button
          onClick={() => setActiveTab("movements")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "none",
            borderBottom: activeTab === "movements" ? "3px solid #14544b" : "none",
            fontWeight: activeTab === "movements" ? "bold" : "normal",
            color: activeTab === "movements" ? "#14544b" : "#64748b",
            fontSize: "0.95rem",
            cursor: "pointer"
          }}
        >
          📜 {tr("Vault Access & Alankaram Movement Log")} ({movements.length})
        </button>
      </div>

      {activeTab === "inventory" ? (
        <>
          {/* Controls Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder={tr("Search by ornament name, code, deity...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                minWidth: "260px",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem"
              }}
            />

            <select
              value={metalFilter}
              onChange={(e) => setMetalFilter(e.target.value)}
              style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
            >
              <option value="All">All Metal Types</option>
              <option value="Gold">Gold Ornaments</option>
              <option value="Silver">Silver Kavacham / Vessels</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>⏳ Loading Vault Register...</div>
          ) : (
            <>
              <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                      <th style={{ padding: "14px 16px" }}>Code / Ornament Name</th>
                      <th style={{ padding: "14px 16px" }}>Deity & Category</th>
                      <th style={{ padding: "14px 16px" }}>Metal & Purity</th>
                      <th style={{ padding: "14px 16px" }}>Net Wt. (Gram)</th>
                      <th style={{ padding: "14px 16px" }}>Stone (Carat)</th>
                      <th style={{ padding: "14px 16px" }}>Hallmark / Insurance</th>
                      <th style={{ padding: "14px 16px" }}>Status & Vault</th>
                      <th style={{ padding: "14px 16px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrnaments.map((item) => (
                      <tr key={item.id || item._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: "bold", color: "#0f172a" }}>{item.name}</div>
                          <code style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#b45309" }}>
                            {item.item_code}
                          </code>
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: "600", color: "#14544b" }}>{item.deity}</div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{item.category}</div>
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            background: (item.metal_type || "").includes("Gold") ? "#fef3c7" : "#f1f5f9",
                            color: (item.metal_type || "").includes("Gold") ? "#92400e" : "#475569"
                          }}>
                            {item.metal_type}
                          </span>
                        </td>

                        <td style={{ padding: "14px 16px", fontWeight: "bold" }}>
                          {item.net_weight_grams} g
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "normal" }}>
                            Gross: {item.gross_weight_grams}g
                          </div>
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          {item.stone_weight_carats > 0 ? `${item.stone_weight_carats} ct` : "—"}
                        </td>

                        <td style={{ padding: "14px 16px", fontSize: "0.78rem" }}>
                          <div style={{ color: "#047857", fontWeight: "bold" }}>{item.hallmark_cert}</div>
                          <div style={{ color: "#64748b" }}>{item.insurance_policy}</div>
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "0.78rem",
                            fontWeight: "bold",
                            background: item.status === "In Vault" ? "#dcfce7" : item.status === "Adorning Deity" ? "#fef3c7" : "#fee2e2",
                            color: item.status === "In Vault" ? "#15803d" : item.status === "Adorning Deity" ? "#b45309" : "#b91c1c"
                          }}>
                            {item.status === "In Vault" ? "🔒 In Vault" : item.status === "Adorning Deity" ? "✨ Adorning Deity" : item.status}
                          </span>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                            📍 {item.vault_location}
                          </div>
                        </td>

                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <button
                            onClick={() => {
                              setSelectedItemForMovement(item);
                              setMovementForm((prev) => ({
                                ...prev,
                                action: item.status === "In Vault" ? "Vault Issue (Check Out)" : "Vault Return (Check In)",
                                deity_adorned: item.deity
                              }));
                              setShowMovementModal(true);
                            }}
                            style={{
                              padding: "6px 12px",
                              background: item.status === "In Vault" ? "#14544b" : "#c08829",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "0.78rem",
                              fontWeight: "bold",
                              cursor: "pointer"
                            }}
                          >
                            {item.status === "In Vault" ? "📤 Issue for Alankaram" : "📥 Return to Vault"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Inventory Pagination Controls */}
              <Pagination
                currentPage={currentPage}
                totalItems={filteredOrnaments.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            </>
          )}
        </>
      ) : (
        /* Vault Movements Log Tab */
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ marginTop: 0, color: "#14544b", fontFamily: "serif" }}>📜 Vault Access & Security Movement Audit Trail</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "12px" }}>Timestamp</th>
                <th style={{ padding: "12px" }}>Ornament & Code</th>
                <th style={{ padding: "12px" }}>Action</th>
                <th style={{ padding: "12px" }}>Issued To Priest</th>
                <th style={{ padding: "12px" }}>Authorized By</th>
                <th style={{ padding: "12px" }}>Purpose / Deity</th>
                <th style={{ padding: "12px" }}>Security Witness</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMovements.map((m) => (
                <tr key={m.id || m._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "#64748b" }}>{m.timestamp}</td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ fontWeight: "bold", color: "#0f172a" }}>{m.abharanam_name}</div>
                    <code style={{ fontSize: "0.72rem", background: "#f1f5f9", padding: "2px 4px" }}>{m.item_code}</code>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      background: m.action.includes("Issue") ? "#fef3c7" : "#dcfce7",
                      color: m.action.includes("Issue") ? "#b45309" : "#15803d"
                    }}>
                      {m.action}
                    </span>
                  </td>
                  <td style={{ padding: "12px", fontWeight: "600" }}>{m.issued_to_priest}</td>
                  <td style={{ padding: "12px" }}>{m.authorized_by}</td>
                  <td style={{ padding: "12px" }}>
                    <div>{m.purpose}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{m.deity_adorned}</div>
                  </td>
                  <td style={{ padding: "12px", color: "#475569" }}>{m.security_witness || "Security Lead"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Movements Pagination Controls */}
          <Pagination
            currentPage={movCurrentPage}
            totalItems={movements.length}
            pageSize={movPageSize}
            onPageChange={setMovCurrentPage}
            onPageSizeChange={setMovPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      )}


      {/* Add Ornament Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px"
        }}>
          <div style={{
            background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "650px",
            maxHeight: "90vh", overflowY: "auto", padding: "28px"
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#14544b", fontFamily: "serif" }}>
              ✨ {tr("Register New Sacred Ornament in Vault")}
            </h3>

            <form onSubmit={handleAddOrnament} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Ornament Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Navaratna Gold Crown"
                    value={newOrnament.name}
                    onChange={(e) => setNewOrnament({ ...newOrnament, name: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Deity Adorned</label>
                  <input
                    type="text"
                    value={newOrnament.deity}
                    onChange={(e) => setNewOrnament({ ...newOrnament, deity: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Category</label>
                  <select
                    value={newOrnament.category}
                    onChange={(e) => setNewOrnament({ ...newOrnament, category: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="Crown (Kireedam)">Crown (Kireedam)</option>
                    <option value="Lance (Vel)">Lance (Vel)</option>
                    <option value="Necklace (Haaram)">Necklace (Haaram)</option>
                    <option value="Shield (Kavacham)">Shield (Kavacham)</option>
                    <option value="Waistband (Odiyanam)">Waistband (Odiyanam)</option>
                    <option value="Armlet (Keyura)">Armlet (Keyura)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Metal & Purity</label>
                  <select
                    value={newOrnament.metal_type}
                    onChange={(e) => setNewOrnament({ ...newOrnament, metal_type: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="22K Gold">22K Gold</option>
                    <option value="24K Gold">24K Gold</option>
                    <option value="925 Sterling Silver">925 Sterling Silver</option>
                    <option value="Platinum & Gold">Platinum & Gold</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Gross Weight (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1250"
                    value={newOrnament.gross_weight_grams}
                    onChange={(e) => setNewOrnament({ ...newOrnament, gross_weight_grams: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Net Weight (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1120"
                    value={newOrnament.net_weight_grams}
                    onChange={(e) => setNewOrnament({ ...newOrnament, net_weight_grams: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Stone (Carat)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="45"
                    value={newOrnament.stone_weight_carats}
                    onChange={(e) => setNewOrnament({ ...newOrnament, stone_weight_carats: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>BIS Hallmark Cert ID</label>
                  <input
                    type="text"
                    value={newOrnament.hallmark_cert}
                    onChange={(e) => setNewOrnament({ ...newOrnament, hallmark_cert: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Estimated Value (INR ₹)</label>
                  <input
                    type="number"
                    placeholder="8500000"
                    value={newOrnament.estimated_value_inr}
                    onChange={(e) => setNewOrnament({ ...newOrnament, estimated_value_inr: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Insurance Policy No</label>
                  <input
                    type="text"
                    value={newOrnament.insurance_policy}
                    onChange={(e) => setNewOrnament({ ...newOrnament, insurance_policy: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Vault Location</label>
                  <input
                    type="text"
                    value={newOrnament.vault_location}
                    onChange={(e) => setNewOrnament({ ...newOrnament, vault_location: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: "8px 16px", background: "#cbd5e1", border: "none", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 20px", background: "#14544b", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>Save to Vault Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vault Movement Modal */}
      {showMovementModal && selectedItemForMovement && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px"
        }}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "550px", padding: "28px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#14544b", fontFamily: "serif" }}>
              📜 Log Vault Access & Movement: {selectedItemForMovement.name}
            </h3>

            <form onSubmit={handleLogMovement} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Action Type</label>
                <select
                  value={movementForm.action}
                  onChange={(e) => setMovementForm({ ...movementForm, action: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                >
                  <option value="Vault Issue (Check Out)">Vault Issue (Check Out to Priest)</option>
                  <option value="Vault Return (Check In)">Vault Return (Check In to Safe)</option>
                  <option value="Maintenance Transfer">Maintenance / Cleaning Transfer</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Issued To Priest</label>
                <input
                  type="text"
                  value={movementForm.issued_to_priest}
                  onChange={(e) => setMovementForm({ ...movementForm, issued_to_priest: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Purpose / Occasion</label>
                <input
                  type="text"
                  value={movementForm.purpose}
                  onChange={(e) => setMovementForm({ ...movementForm, purpose: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Security Witness</label>
                <input
                  type="text"
                  value={movementForm.security_witness}
                  onChange={(e) => setMovementForm({ ...movementForm, security_witness: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowMovementModal(false)} style={{ padding: "8px 16px", background: "#cbd5e1", border: "none", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 20px", background: "#14544b", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>Confirm & Save Audit Trail</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
