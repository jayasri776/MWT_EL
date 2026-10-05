import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Panchangam() {
  const { tr } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [panchangamData, setPanchangamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    date: todayStr,
    tithi: "Ekadashi (Shukla Paksha)",
    tithi_end: "11:42 PM",
    nakshatram: "Rohini Nakshatram",
    nakshatram_end: "08:15 PM",
    rahu_kalam: "07:30 AM – 09:00 AM",
    yamagandam: "10:30 AM – 12:00 PM",
    durmuhurtham: "12:30 PM – 01:15 PM",
    yogam: "Siddha Yogam",
    karanam: "Bava Karanam",
    sunrise: "06:05 AM",
    sunset: "06:15 PM",
    auspicious_time: "09:15 AM – 10:20 AM",
    special_events: "Sacred Murugan Abhishekam & Veda Parayanam",
    notes: "Auspicious for sacred vows, homam, and Annadhanam seva",
  });

  const fetchPanchangam = (dateStr) => {
    setLoading(true);
    const token = localStorage.getItem("tams_jwt_token");
    fetch(`http://localhost:5000/api/panchangam/date/${dateStr}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPanchangamData(data);
        setFormData({ ...data, date: dateStr });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching Panchangam:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPanchangam(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    const newStr = d.toISOString().split("T")[0];
    setSelectedDate(newStr);
  };

  const handleSavePanchangam = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("tams_jwt_token");
    fetch("http://localhost:5000/api/panchangam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((saved) => {
        showToast("Panchangam details updated successfully in MongoDB!", "success");
        setPanchangamData(saved);
        setShowEditModal(false);
      })
      .catch(() => {
        showToast("Failed to update Panchangam record.", "error");
      });
  };

  const formattedDateHeader = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="page-container" style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, #701e1a 0%, #9a2b25 50%, #c08829 100%)",
        borderRadius: "16px",
        padding: "28px 32px",
        color: "#fff",
        marginBottom: "28px",
        boxShadow: "0 10px 30px rgba(154, 43, 37, 0.2)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{ fontSize: "2rem" }}>🕉️</span>
            <h1 style={{ margin: 0, fontFamily: "serif", fontSize: "1.8rem", letterSpacing: "0.5px" }}>
              {tr("Daily Panchangam & Hindu Calendar")}
            </h1>
          </div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "0.95rem" }}>
            {tr("Sacred Tithi, Nakshatram, Rahu Kalam & Yamagandam timing for Sri Subramaniya Swamy Temple")}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.15)", padding: "10px 18px", borderRadius: "12px", backdropFilter: "blur(5px)" }}>
          <button
            onClick={() => handleDateChange(-1)}
            style={{ background: "#fff", border: "none", borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer", fontWeight: "bold", color: "#9a2b25" }}
            title="Previous Day"
          >
            ◀
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "600",
              fontSize: "0.95rem",
              background: "#fff",
              color: "#2a1f17",
              cursor: "pointer"
            }}
          />
          <button
            onClick={() => handleDateChange(1)}
            style={{ background: "#fff", border: "none", borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer", fontWeight: "bold", color: "#9a2b25" }}
            title="Next Day"
          >
            ▶
          </button>
          <button
            onClick={() => setSelectedDate(todayStr)}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid #fff",
              background: "rgba(255,255,255,0.25)",
              color: "#fff",
              fontSize: "0.82rem",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            {tr("Today")}
          </button>
        </div>
      </div>

      {/* Date Title Banner */}
      <div style={{
        display: "flex",
        justify: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        padding: "16px 24px",
        background: "var(--paper, #fffdf8)",
        borderRadius: "12px",
        border: "1px solid var(--stone, #e3d9c4)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.3rem", color: "var(--sindoor, #9a2b25)", fontFamily: "serif" }}>
            📅 {formattedDateHeader}
          </h2>
          <div style={{ fontSize: "0.85rem", color: "var(--ink-soft, #6b5d4f)", marginTop: "4px" }}>
            Location: Tiruchendur Seashore Sanctum (IST · UTC+05:30)
          </div>
        </div>

        {(user?.role === "Administrator" || user?.role === "Priest" || user?.role === "Admin") && (
          <button
            onClick={() => setShowEditModal(true)}
            style={{
              padding: "10px 20px",
              background: "var(--gold, #c08829)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(192, 136, 41, 0.25)"
            }}
          >
            ✏️ {tr("Edit Day's Panchangam")}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--ink-soft)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⏳</div>
          <p>{tr("Calculating Panchangam and fetching Vedic planetary positions...")}</p>
        </div>
      ) : (
        <>
          {/* Top 4 Panchangam Essentials Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            marginBottom: "28px"
          }}>
            {/* Tithi Card */}
            <div style={{
              background: "var(--paper, #fffdf8)",
              border: "1px solid var(--stone, #e3d9c4)",
              borderTop: "4px solid #9a2b25",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.04)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: "bold", textTransform: "uppercase", color: "#9a2b25", letterSpacing: "0.5px" }}>
                  TITHI (LUNAR DAY)
                </span>
                <span style={{ fontSize: "1.4rem" }}>🌙</span>
              </div>
              <div style={{ fontSize: "1.35rem", fontWeight: "bold", color: "#2a1f17", marginBottom: "6px" }}>
                {panchangamData?.tithi || "Ekadashi"}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#6b5d4f" }}>
                Up to: <strong>{panchangamData?.tithi_end || "Full Day"}</strong>
              </div>
            </div>

            {/* Nakshatram Card */}
            <div style={{
              background: "var(--paper, #fffdf8)",
              border: "1px solid var(--stone, #e3d9c4)",
              borderTop: "4px solid #c08829",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.04)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: "bold", textTransform: "uppercase", color: "#c08829", letterSpacing: "0.5px" }}>
                  NAKSHATRAM (BIRTH STAR)
                </span>
                <span style={{ fontSize: "1.4rem" }}>⭐</span>
              </div>
              <div style={{ fontSize: "1.35rem", fontWeight: "bold", color: "#2a1f17", marginBottom: "6px" }}>
                {panchangamData?.nakshatram || "Rohini Nakshatram"}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#6b5d4f" }}>
                Up to: <strong>{panchangamData?.nakshatram_end || "Late Evening"}</strong>
              </div>
            </div>

            {/* Rahu Kalam Card */}
            <div style={{
              background: "var(--paper, #fffdf8)",
              border: "1px solid #fca5a5",
              borderTop: "4px solid #ef4444",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 6px 16px rgba(239, 68, 68, 0.08)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: "bold", textTransform: "uppercase", color: "#dc2626", letterSpacing: "0.5px" }}>
                  RAHU KALAM (INASPICIOUS)
                </span>
                <span style={{ fontSize: "1.4rem" }}>⚠️</span>
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#991b1b", marginBottom: "6px" }}>
                {panchangamData?.rahu_kalam || "07:30 AM – 09:00 AM"}
              </div>
              <div style={{ fontSize: "0.82rem", color: "#7f1d1d" }}>
                Avoid starting new ventures during this window
              </div>
            </div>

            {/* Yamagandam Card */}
            <div style={{
              background: "var(--paper, #fffdf8)",
              border: "1px solid #fed7aa",
              borderTop: "4px solid #f97316",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 6px 16px rgba(249, 115, 22, 0.08)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: "bold", textTransform: "uppercase", color: "#c2410c", letterSpacing: "0.5px" }}>
                  YAMAGANDAM TIMING
                </span>
                <span style={{ fontSize: "1.4rem" }}>⌛</span>
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#9a3412", marginBottom: "6px" }}>
                {panchangamData?.yamagandam || "10:30 AM – 12:00 PM"}
              </div>
              <div style={{ fontSize: "0.82rem", color: "#7c2d12" }}>
                Restricted period for major auspicious tasks
              </div>
            </div>
          </div>

          {/* Detailed Panchangam Calculations Table & Auspicious Muhurthams */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
            {/* Left Panel: Full Vedic Parameters */}
            <div style={{
              background: "var(--paper, #fffdf8)",
              border: "1px solid var(--stone, #e3d9c4)",
              borderRadius: "12px",
              padding: "24px"
            }}>
              <h3 style={{ margin: "0 0 16px 0", fontFamily: "serif", color: "var(--sindoor, #9a2b25)", borderBottom: "2px solid var(--stone)", paddingBottom: "10px" }}>
                🪔 {tr("Vedic Parameters & Solar Timings")}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e3d9c4" }}>
                  <span style={{ color: "#6b5d4f" }}>Yogam:</span>
                  <strong>{panchangamData?.yogam || "Siddha Yogam"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e3d9c4" }}>
                  <span style={{ color: "#6b5d4f" }}>Karanam:</span>
                  <strong>{panchangamData?.karanam || "Bava Karanam"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e3d9c4" }}>
                  <span style={{ color: "#6b5d4f" }}>Sunrise (Surya Udayam):</span>
                  <strong style={{ color: "#b45309" }}>🌅 {panchangamData?.sunrise || "06:05 AM"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e3d9c4" }}>
                  <span style={{ color: "#6b5d4f" }}>Sunset (Surya Astamayam):</span>
                  <strong style={{ color: "#475569" }}>🌇 {panchangamData?.sunset || "06:15 PM"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <span style={{ color: "#6b5d4f" }}>Durmuhurtham:</span>
                  <strong style={{ color: "#dc2626" }}>{panchangamData?.durmuhurtham || "12:30 PM – 01:15 PM"}</strong>
                </div>
              </div>
            </div>

            {/* Right Panel: Auspicious Muhurtham & Special Events */}
            <div style={{
              background: "var(--paper, #fffdf8)",
              border: "1px solid var(--stone, #e3d9c4)",
              borderRadius: "12px",
              padding: "24px"
            }}>
              <h3 style={{ margin: "0 0 16px 0", fontFamily: "serif", color: "var(--gold, #c08829)", borderBottom: "2px solid var(--stone)", paddingBottom: "10px" }}>
                ✨ {tr("Auspicious Time & Temple Events")}
              </h3>

              <div style={{ background: "#faf1dc", padding: "14px 18px", borderRadius: "10px", marginBottom: "16px", border: "1px solid #f3e3be" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: "bold", color: "#92400e", textTransform: "uppercase", marginBottom: "4px" }}>
                  SHUBHA MUHURTHAM (BEST TIMING)
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#78350f" }}>
                  ⏰ {panchangamData?.auspicious_time || "09:15 AM – 10:20 AM"}
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "0.88rem", fontWeight: "bold", color: "#2a1f17", marginBottom: "4px" }}>
                  Special Festival / Ritual Highlights:
                </div>
                <p style={{ margin: 0, fontSize: "0.92rem", color: "#9a2b25", fontWeight: "600" }}>
                  🚩 {panchangamData?.special_events || "Daily Sanctum Pooja & Aradhana"}
                </p>
              </div>

              {panchangamData?.notes && (
                <div style={{ fontSize: "0.85rem", color: "#6b5d4f", background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  📝 <strong>Priest Notes:</strong> {panchangamData.notes}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit Panchangam Modal */}
      {showEditModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "28px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#9a2b25", fontFamily: "serif" }}>
              ✏️ {tr("Update Panchangam for")} {formData.date}
            </h3>

            <form onSubmit={handleSavePanchangam} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Tithi</label>
                  <input
                    type="text"
                    value={formData.tithi}
                    onChange={(e) => setFormData({ ...formData, tithi: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Tithi End Time</label>
                  <input
                    type="text"
                    value={formData.tithi_end}
                    onChange={(e) => setFormData({ ...formData, tithi_end: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Nakshatram</label>
                  <input
                    type="text"
                    value={formData.nakshatram}
                    onChange={(e) => setFormData({ ...formData, nakshatram: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Nakshatram End Time</label>
                  <input
                    type="text"
                    value={formData.nakshatram_end}
                    onChange={(e) => setFormData({ ...formData, nakshatram_end: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Rahu Kalam</label>
                  <input
                    type="text"
                    value={formData.rahu_kalam}
                    onChange={(e) => setFormData({ ...formData, rahu_kalam: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Yamagandam</label>
                  <input
                    type="text"
                    value={formData.yamagandam}
                    onChange={(e) => setFormData({ ...formData, yamagandam: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Shubha Muhurtham</label>
                  <input
                    type="text"
                    value={formData.auspicious_time}
                    onChange={(e) => setFormData({ ...formData, auspicious_time: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Durmuhurtham</label>
                  <input
                    type="text"
                    value={formData.durmuhurtham}
                    onChange={(e) => setFormData({ ...formData, durmuhurtham: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Special Festival / Ritual Events</label>
                <input
                  type="text"
                  value={formData.special_events}
                  onChange={(e) => setFormData({ ...formData, special_events: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Priest Notes / Remarks</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: "8px 16px", background: "#cbd5e1", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 20px", background: "#9a2b25", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                >
                  Save to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
