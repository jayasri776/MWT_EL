import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useRecentlyAccessed } from "../context/RecentlyAccessedContext";
import { db } from "../services/db";

export default function Dashboard() {
  const navigate = useNavigate();
  const { tr, t } = useLanguage();
  const { recentlyAccessed, clearRecent } = useRecentlyAccessed();

  const [activities, setActivities] = useState([]);
  const [priests, setPriests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [donations, setDonations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [annadhanam, setAnnadhanam] = useState([]);

  const loadDashboardData = useCallback(async () => {
    const [actList, prList, stList, donList, invList, annaList] = await Promise.all([
      db.getActivities(),
      db.getPriests(),
      db.getStaff(),
      db.getDonations(),
      db.getInventory(),
      db.getAnnadhanam(),
    ]);
    setActivities(actList || []);
    setPriests(prList || []);
    setStaff(stList || []);
    setDonations(donList || []);
    setInventory(invList || []);
    setAnnadhanam(annaList || []);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const priestsTotal = priests.length;
  const priestsActive = priests.filter((p) => p.availability !== "On Leave" && p.status !== "Inactive").length;

  const staffTotal = staff.length;
  const staffActive = staff.filter((s) => s.status === "Active").length;

  const totalActivities = activities.length;
  const completedActivities = activities.filter((a) => a.status === "Completed").length;
  const upcomingActivities = totalActivities - completedActivities;

  const annadhanamTotalBeneficiaries = annadhanam.reduce((sum, item) => sum + (Number(item.count) || 300), 0);

  const recentDonations = donations.slice(0, 4).map((d) => ({
    devotee: d.donor_name || d.devotee || "Devotee",
    purpose: d.category || d.purpose || "General",
    type: d.payment_mode || d.type || "Online",
    amount: typeof d.amount === "number" ? `₹${d.amount.toLocaleString()}` : String(d.amount || "₹0"),
    receipt: d.receipt_no || d.receipt || "REC-2026",
    contact: d.contact || "+91 98401 xxxxx",
  }));

  const inventoryAlerts = inventory.slice(0, 5).map((inv) => {
    const q = Number(inv.quantity || 0);
    const r = Number(inv.reorderLevel || 10);
    const isLow = q <= r;
    return {
      name: inv.name || inv.item_name,
      stock: `${q} ${inv.unit || "Kg"}`,
      status: isLow ? "Low Stock" : "In Stock",
      pillClass: isLow ? "pill red" : "pill green",
      width: isLow ? "25%" : "80%",
      color: isLow ? "var(--sindoor)" : "var(--teal)",
    };
  });

  return (
    <div>
      {/* Recently Accessed Dashboard Quick Banner */}
      {recentlyAccessed.length > 0 && (
        <div className="panel" style={{ marginBottom: "20px", background: "linear-gradient(135deg, rgba(192, 136, 41, 0.08) 0%, rgba(13, 58, 52, 0.05) 100%)", border: "1px solid rgba(192, 136, 41, 0.2)" }}>
          <div className="panel-head" style={{ borderBottom: "none", paddingBottom: 0 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem" }}>
              🕒 {tr("Recently Accessed Views")}
            </h3>
            <button className="btn-ghost" onClick={clearRecent} style={{ fontSize: "0.78rem" }}>
              {tr("Clear History")}
            </button>
          </div>
          <div className="panel-body" style={{ paddingTop: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
              {recentlyAccessed.slice(0, 4).map((item) => (
                <button
                  key={`dash_rec_${item.id}`}
                  type="button"
                  onClick={() => navigate(item.path)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "var(--card-bg, #ffffff)",
                    border: "1px solid var(--border-color, #cbd5e1)",
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main, #1e293b)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {tr(item.title)}
                    </p>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {tr(item.category)} · {item.time}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card" style={{ "--accent": "var(--sindoor)" }}>
          <p className="stat-label">{tr(t.statActivities || "Today's Activities")}</p>
          <p className="stat-value">{totalActivities}</p>
          <p className="stat-sub up">{completedActivities} {tr(t.act_markDone || "completed")} · {upcomingActivities} {tr("upcoming")}</p>
        </div>
        <div className="stat-card" style={{ "--accent": "var(--teal)" }}>
          <p className="stat-label">{tr(t.statPriests || "Priests On Duty")}</p>
          <p className="stat-value">{priestsActive} <span style={{ fontSize: "14px", color: "var(--ink-faint)" }}>/ {priestsTotal}</span></p>
          <p className="stat-sub">{tr("1 on leave (Sri Ravishankar Gurukkal)")}</p>
        </div>
        <div className="stat-card" style={{ "--accent": "var(--gold)" }}>
          <p className="stat-label">{tr(t.panelStaffOnDuty || "Staff On Duty")}</p>
          <p className="stat-value">{staffActive} <span style={{ fontSize: "14px", color: "var(--ink-faint)" }}>/ {staffTotal}</span></p>
          <p className="stat-sub up">{tr("4 Active · 1 on leave")}</p>
        </div>
        <div className="stat-card" style={{ "--accent": "var(--sindoor)" }}>
          <p className="stat-label">{tr(t.statAnnadhanam || "Annadhanam Beneficiaries")}</p>
          <p className="stat-value">1,240</p>
          <p className="stat-sub">{tr(t.statAnnadhanamSub || "This week across 6 sittings")}</p>
        </div>
      </div>

      {/* Dash Grid */}
      <div className="dash-grid" style={{ marginTop: "20px" }}>
        <div>
          {/* Today's Seva Rhythm */}
          <div className="panel">
            <div className="panel-head">
              <h3>{tr(t.panelSevaRhythm || "Today's Seva Rhythm")}</h3>
              <button className="btn-ghost" onClick={() => navigate("/activities")}>{tr(t.fullSchedule || "Full schedule →")}</button>
            </div>
            <div className="panel-body">
              <div className="rhythm-rail">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="rhythm-item">
                    <div className="rhythm-time">{(act.when_date || act.when || "").includes("·") ? (act.when_date || act.when).split("·")[1].trim() : (act.when_date || act.when)}</div>
                    <div className="rhythm-dot-wrap">
                      <div className={`rhythm-dot ${act.status === "Completed" ? "done" : "upcoming"}`}></div>
                    </div>
                    <div className="rhythm-body">
                      <p className="rhythm-name">{tr(act.name)}</p>
                      <p className="rhythm-meta">{tr(act.sub)} · {tr(act.priest)}</p>
                      <span className={`rhythm-status ${act.status === "Completed" ? "completed" : "scheduled"}`}>
                        {tr(act.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Donations */}
          <div className="panel">
            <div className="panel-head">
              <h3>{tr(t.panelRecentDonations || "Recent Donations")}</h3>
              <button className="btn-ghost" onClick={() => navigate("/donations")}>{tr(t.viewAll || "View all →")}</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>{tr("Devotee")}</th>
                  <th>{tr("Purpose")}</th>
                  <th>{tr("Type")}</th>
                  <th>{tr("Amount")}</th>
                  <th>{tr("Receipt")}</th>
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((don, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="row-flex">
                        <div className="avatar-sm">{don.devotee[0]}</div>
                        <div>
                          <div className="cell-name">{tr(don.devotee)}</div>
                          <div className="cell-sub">{don.contact}</div>
                        </div>
                      </div>
                    </td>
                    <td>{tr(don.purpose)}</td>
                    <td><span className="pill grey">{tr(don.type)}</span></td>
                    <td className="mono" style={{ fontWeight: 600 }}>{don.amount}</td>
                    <td className="mono">{don.receipt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          {/* Upcoming Festival */}
          <div className="panel">
            <div className="panel-head">
              <h3>{tr(t.panelUpcomingFestival || "Upcoming Festival")}</h3>
              <button className="btn-ghost" onClick={() => navigate("/festivals")}>{tr(t.viewAll || "View all →")}</button>
            </div>
            <div className="panel-body" style={{ paddingTop: 0 }}>
              <div className="festival-strip" style={{ marginTop: "16px" }}>
                <div>
                  <div className="fb-eyebrow">{tr("ANNUAL · AIPPASI MASAM")}</div>
                  <div className="fb-title">{tr("Kandha Sashti Utsavam")}</div>
                  <div className="fb-sub">{tr("25 Oct 2026 · Expecting 5,00,000+ devotees")}</div>
                </div>
                <div className="festival-countdown">
                  <div className="fc-box"><div className="n">35</div><div className="l">{tr("Days")}</div></div>
                </div>
              </div>
              <div className="bar-row">
                <div className="bar-label">{tr("Priests assigned")}</div>
                <div className="bar-track"><div className="bar-fill" style={{ width: "66%", background: "var(--teal)" }}></div></div>
                <div className="bar-val">2/3</div>
              </div>
              <div className="bar-row">
                <div className="bar-label">{tr("Inventory readiness")}</div>
                <div className="bar-track"><div className="bar-fill" style={{ width: "85%", background: "var(--gold)" }}></div></div>
                <div className="bar-val">85%</div>
              </div>
              <div className="bar-row">
                <div className="bar-label">{tr("Sponsorships filled")}</div>
                <div className="bar-track"><div className="bar-fill" style={{ width: "65%" }}></div></div>
                <div className="bar-val">₹34,801</div>
              </div>
            </div>
          </div>

          {/* Inventory Alerts */}
          <div className="panel">
            <div className="panel-head">
              <h3>{tr(t.panelInventoryAlerts || "Inventory Alerts")}</h3>
              <button className="btn-ghost" onClick={() => navigate("/inventory")}>{tr(t.manageArrow || "Manage →")}</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>{tr("ITEM")}</th>
                  <th>{tr("STOCK")}</th>
                  <th>{tr("STATUS")}</th>
                </tr>
              </thead>
              <tbody>
                {inventoryAlerts.map((inv, idx) => (
                  <tr key={idx}>
                    <td className="cell-name">{tr(inv.name)}</td>
                    <td>
                      <span className="stock-meter">
                        <i style={{ width: inv.width, background: inv.color }}></i>
                      </span>
                      <span className="mono">{inv.stock}</span>
                    </td>
                    <td><span className={inv.pillClass}>{tr(inv.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Staff On Duty */}
          <div className="panel">
            <div className="panel-head">
              <h3>{tr(t.panelStaffOnDuty || "Staff On Duty")}</h3>
              <button className="btn-ghost" onClick={() => navigate("/staff")}>{tr(t.viewAll || "View staff →")}</button>
            </div>
            <div className="panel-body" style={{ paddingTop: "14px" }}>
              <div className="bar-row">
                <div className="bar-label">{tr("Security")}</div>
                <div className="bar-track"><div className="bar-fill" style={{ width: "100%", background: "var(--teal)" }}></div></div>
                <div className="bar-val">2/2</div>
              </div>
              <div className="bar-row">
                <div className="bar-label">{tr("Housekeeping / Cleaning")}</div>
                <div className="bar-track"><div className="bar-fill" style={{ width: "100%", background: "var(--teal)" }}></div></div>
                <div className="bar-val">1/1</div>
              </div>
              <div className="bar-row">
                <div className="bar-label">{tr("Accounts")}</div>
                <div className="bar-track"><div className="bar-fill" style={{ width: "100%", background: "var(--teal)" }}></div></div>
                <div className="bar-val">1/1</div>
              </div>
              <div className="bar-row">
                <div className="bar-label">{tr("Volunteers")}</div>
                <div className="bar-track"><div className="bar-fill" style={{ width: "0%" }}></div></div>
                <div className="bar-val">0/1 ({tr("On Leave")})</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
