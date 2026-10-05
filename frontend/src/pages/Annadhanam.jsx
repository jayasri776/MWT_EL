import { useState, useEffect, useCallback } from "react";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { db } from "../services/db";

const INITIAL_SITTINGS = [
  {
    id: 1,
    date: "08 Aug",
    occasion: "Daily",
    location: "Dining Hall A",
    beneficiaries: "318",
    menu: "Rice, sambar, rasam, payasam",
    sponsor: "General fund",
    status: "Completed",
  },
  {
    id: 2,
    date: "09 Aug",
    occasion: "Daily",
    location: "Dining Hall A",
    beneficiaries: "~300 est.",
    menu: "Rice, sambar, poriyal",
    sponsor: "Rajaraman family",
    status: "Scheduled",
  },
  {
    id: 3,
    date: "25 Oct",
    occasion: "Kandha Sashti Utsavam",
    location: "Dining Hall A + B",
    beneficiaries: "~5,000 est.",
    menu: "Festival sweet pongal, vadai, payasam",
    sponsor: "Pooled sponsorships",
    status: "Scheduled",
  },
  {
    id: 4,
    date: "01 Aug",
    occasion: "Daily",
    location: "Dining Hall A",
    beneficiaries: "290",
    menu: "Rice, sambar, curd",
    sponsor: "General fund",
    status: "Completed",
  },
];

const EMPTY_FORM = {
  date: "",
  occasion: "",
  location: "",
  beneficiaries: "",
  menu: "",
  sponsor: "",
  status: "Scheduled",
};

export default function Annadhanam() {
  const { showToast } = useToast();
  const { tr } = useLanguage();
  const [sittings, setSittings] = useState([]);
  const [tab, setTab] = useState("Upcoming");

  const [addOpen, setAddOpen] = useState(false);
  const [viewSitting, setViewSitting] = useState(null);
  const [editSitting, setEditSitting] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    const list = await db.getAnnadhanam();
    const mapped = (list || []).map((item) => ({
      id: item.id,
      date: item.date ? String(item.date).slice(0, 10) : "08 Aug",
      occasion: item.occasion || "Daily",
      location: item.location || "Dining Hall A",
      beneficiaries: String(item.beneficiaries || item.count || 300),
      count: item.count || parseInt(item.beneficiaries, 10) || 300,
      menu: item.menu || "Rice, sambar, rasam, payasam",
      sponsor: item.sponsor_name || item.sponsor || "General fund",
      sponsor_name: item.sponsor_name || item.sponsor || "General fund",
      status: item.status || "Scheduled",
    }));
    setSittings(mapped);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visible = sittings.filter((s) =>
    tab === "Upcoming" ? s.status === "Scheduled" : s.status === "Completed",
  );

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setAddOpen(true);
  };

  const handleAddSitting = async (e) => {
    e.preventDefault();
    if (!form.date.trim() || !form.occasion.trim() || !form.location.trim()) {
      showToast(tr("Please fill in date, occasion and location"));
      return;
    }
    const newSitting = {
      date: form.date.trim(),
      occasion: form.occasion.trim(),
      location: form.location.trim(),
      beneficiaries: form.beneficiaries.trim() || "300",
      count: parseInt(form.beneficiaries, 10) || 300,
      menu: form.menu.trim() || "Rice, sambar, rasam",
      sponsor: form.sponsor.trim() || "General fund",
      sponsor_name: form.sponsor.trim() || "General fund",
      amount: 5000,
      status: form.status,
    };
    await db.addAnnadhanam(newSitting);
    setAddOpen(false);
    setTab(form.status === "Completed" ? "Completed" : "Upcoming");
    showToast(`${tr("Sitting on")} ${form.date} ${tr("has been scheduled")}`);
    loadData();
  };

  const openEditForm = (sitting) => {
    setEditSitting(sitting);
    setForm({
      date: sitting.date,
      occasion: sitting.occasion,
      location: sitting.location,
      beneficiaries: sitting.beneficiaries,
      menu: sitting.menu || "",
      sponsor: sitting.sponsor || "",
      status: sitting.status,
    });
  };

  const handleEditSitting = async (e) => {
    e.preventDefault();
    if (!editSitting) return;
    const targetId = editSitting.id;
    const updated = {
      date: form.date,
      occasion: form.occasion,
      location: form.location,
      beneficiaries: form.beneficiaries,
      count: parseInt(form.beneficiaries, 10) || 300,
      menu: form.menu,
      sponsor: form.sponsor,
      sponsor_name: form.sponsor,
      status: form.status,
    };
    await db.updateAnnadhanam(targetId, updated);
    showToast(`${tr("Sitting on")} ${form.date} ${tr("updated")}`);
    setEditSitting(null);
    loadData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    await db.deleteAnnadhanam(targetId);
    showToast(tr("Sitting deleted"));
    setDeleteTarget(null);
    loadData();
  };

  return (
    <div>
      <div className="table-toolbar">
        <div className="chip-row">
          <div
            className={`chip${tab === "Upcoming" ? " active" : ""}`}
            onClick={() => setTab("Upcoming")}
          >
            {tr("Upcoming")}
          </div>
          <div
            className={`chip${tab === "Completed" ? " active" : ""}`}
            onClick={() => setTab("Completed")}
          >
            {tr("Completed")}
          </div>
        </div>
        <button className="btn-primary" onClick={openAddForm}>
          {tr("+ Schedule Sitting")}
        </button>
      </div>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>{tr("DATE & OCCASION")}</th>
              <th>{tr("LOCATION")}</th>
              <th>{tr("BENEFICIARIES")}</th>
              <th>{tr("MENU")}</th>
              <th>{tr("SPONSOR")}</th>
              <th>{tr("STATUS")}</th>
              <th style={{ textAlign: "right" }}>{tr("ACTIONS")}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="cell-name">
                    {s.date} — {tr(s.occasion)}
                  </div>
                </td>
                <td>{tr(s.location)}</td>
                <td className="mono">{tr(s.beneficiaries)}</td>
                <td>{tr(s.menu)}</td>
                <td>{tr(s.sponsor)}</td>
                <td>
                  <span
                    className={`pill ${s.status === "Completed" ? "green" : "amber"}`}
                  >
                    {tr(s.status)}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div className="action-btn-group" style={{ justifyContent: "flex-end" }}>
                    <button
                      className="icon-action-btn view-btn"
                      title="View Sitting Details"
                      aria-label={`View sitting on ${s.date}`}
                      onClick={() => setViewSitting(s)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      className="icon-action-btn edit-btn"
                      title="Edit Sitting"
                      aria-label={`Edit sitting on ${s.date}`}
                      onClick={() => openEditForm(s)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="icon-action-btn delete-btn"
                      title="Delete Sitting"
                      aria-label={`Delete sitting on ${s.date}`}
                      onClick={() => setDeleteTarget(s)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="muted" style={{ padding: 20 }}>
                  No {tab.toLowerCase()} sittings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- View Sitting Modal ---------- */}
      {viewSitting && (
        <div className="modal-overlay" onClick={() => setViewSitting(null)}>
          <div className="modal-card profile-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewSitting(null)} aria-label="Close">
              ✕
            </button>
            <h3 className="modal-title" style={{ marginBottom: 14 }}>Sitting Details</h3>
            <div className="profile-grid" style={{ borderTop: "none" }}>
              <div className="profile-row">
                <span className="k">Date</span>
                <span className="v">{viewSitting.date}</span>
              </div>
              <div className="profile-row">
                <span className="k">Occasion</span>
                <span className="v">{viewSitting.occasion}</span>
              </div>
              <div className="profile-row">
                <span className="k">Location</span>
                <span className="v">{viewSitting.location}</span>
              </div>
              <div className="profile-row">
                <span className="k">Expected Beneficiaries</span>
                <span className="v">{viewSitting.beneficiaries}</span>
              </div>
              <div className="profile-row">
                <span className="k">Sponsor</span>
                <span className="v">{viewSitting.sponsor || "—"}</span>
              </div>
              <div className="profile-row">
                <span className="k">Status</span>
                <span className={`pill ${viewSitting.status === "Completed" ? "green" : "amber"}`}>{viewSitting.status}</span>
              </div>
              <div className="profile-row full">
                <span className="k">Menu</span>
                <span className="v">{viewSitting.menu || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Schedule sitting modal ---------- */}
      {addOpen && (
        <div className="modal-overlay" onClick={() => setAddOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setAddOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="modal-title">Schedule a Sitting</h3>
            <form onSubmit={handleAddSitting}>
              <div className="form-grid">
                <div className="field">
                  <label>Date *</label>
                  <input
                    value={form.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                    placeholder="e.g. 20 Aug"
                    required
                  />
                </div>
                <div className="field">
                  <label>Occasion *</label>
                  <input
                    value={form.occasion}
                    onChange={(e) => updateForm("occasion", e.target.value)}
                    placeholder="e.g. Daily, Skanda Sashti"
                    required
                  />
                </div>
                <div className="field">
                  <label>Location *</label>
                  <input
                    value={form.location}
                    onChange={(e) => updateForm("location", e.target.value)}
                    placeholder="e.g. Dining Hall A"
                    required
                  />
                </div>
                <div className="field">
                  <label>Expected Beneficiaries</label>
                  <input
                    value={form.beneficiaries}
                    onChange={(e) =>
                      updateForm("beneficiaries", e.target.value)
                    }
                    placeholder="e.g. ~300 est."
                  />
                </div>
                <div className="field">
                  <label>Sponsor</label>
                  <input
                    value={form.sponsor}
                    onChange={(e) => updateForm("sponsor", e.target.value)}
                    placeholder="e.g. General fund"
                  />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                  >
                    <option>Scheduled</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div className="field field-full">
                  <label>Menu</label>
                  <textarea
                    rows={2}
                    value={form.menu}
                    onChange={(e) => updateForm("menu", e.target.value)}
                    placeholder="e.g. Rice, sambar, payasam"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setAddOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Sitting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Edit sitting modal ---------- */}
      {editSitting && (
        <div className="modal-overlay" onClick={() => setEditSitting(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setEditSitting(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="modal-title">Edit Sitting Details</h3>
            <form onSubmit={handleEditSitting}>
              <div className="form-grid">
                <div className="field">
                  <label>Date *</label>
                  <input
                    value={form.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Occasion *</label>
                  <input
                    value={form.occasion}
                    onChange={(e) => updateForm("occasion", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Location *</label>
                  <input
                    value={form.location}
                    onChange={(e) => updateForm("location", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Expected Beneficiaries</label>
                  <input
                    value={form.beneficiaries}
                    onChange={(e) =>
                      updateForm("beneficiaries", e.target.value)
                    }
                  />
                </div>
                <div className="field">
                  <label>Sponsor</label>
                  <input
                    value={form.sponsor}
                    onChange={(e) => updateForm("sponsor", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                  >
                    <option>Scheduled</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div className="field field-full">
                  <label>Menu</label>
                  <textarea
                    rows={2}
                    value={form.menu}
                    onChange={(e) => updateForm("menu", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditSitting(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Sitting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Delete confirmation modal ---------- */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-card confirm-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDeleteTarget(null)} aria-label="Close">
              ✕
            </button>
            <h3 className="modal-title">Delete Sitting</h3>
            <p className="muted">
              Are you sure you want to delete sitting on <strong>{deleteTarget.date} ({deleteTarget.occasion})</strong>?
            </p>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
