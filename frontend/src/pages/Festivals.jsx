import { useState, useMemo, useEffect, useCallback } from "react";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { db } from "../services/db";

const STATUSES = ["Planned", "Ongoing", "Completed"];
const CATEGORIES = ["Annual", "Weekly"];
const STATUS_PILL = { Planned: "amber", Ongoing: "green", Completed: "grey" };
const CARD_TOP_CLASSES = { Annual: "gold", Weekly: "" };

/* Returns the next occurrence date (ISO) of a given weekday (0=Sun..6=Sat) */
function nextWeekday(weekday) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const diff = (weekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
  return d.toISOString().slice(0, 10);
}

const INITIAL_FESTIVALS = [
  {
    id: 1,
    name: "Kandha Sashti & Soorasamharam",
    deity: "Lord Subramaniya Swamy (Senthil Aandavar)",
    category: "Annual",
    startDate: "2026-10-25",
    endDate: "2026-10-31",
    priest: "Ganesan Sivachariar",
    expectedDevotees: 500000,
    status: "Planned",
    avatar: "KS",
    history:
      "Kandha Sashti at Tiruchendur is world-famous. It celebrates Lord Murugan's victory over the demon king Surapadman on the sacred seashore of Tiruchendur using the Divine Vel (Lance) given by Goddess Parvati.",
    significance:
      "Hundreds of thousands of devotees observe strict 6-day fasting. On the 6th day, the dramatic enactment of Soorasamharam takes place on Tiruchendur seashore, followed by the divine wedding ceremony (Thirukalyanam) with Goddess Deivanai on the 7th day.",
  },
  {
    id: 2,
    name: "Vaikasi Visakam Utsavam",
    deity: "Lord Shanmukha",
    category: "Annual",
    startDate: "2026-05-28",
    endDate: "2026-06-01",
    priest: "Krishnamurthy Bhat",
    expectedDevotees: 350000,
    status: "Completed",
    avatar: "VV",
    history:
      "Vaikasi Visakam celebrates the incarnation day (birth star) of Lord Shanmukha / Subramaniya Swamy. Millions of devotees walk on foot (Pada Yatra) from various parts of Tamil Nadu to Tiruchendur temple.",
    significance:
      "Devotees carry Pal Kudam (milk pots) and elaborate Kavadis to offer milk Abhishekam to Lord Shanmukha, seeking health, longevity, and divine grace.",
  },
  {
    id: 3,
    name: "Avani Perumanthiram (Avani Utsavam)",
    deity: "Lord Senthil Nayagar",
    category: "Annual",
    startDate: "2026-08-24",
    endDate: "2026-09-04",
    priest: "Ravishankar Gurukkal",
    expectedDevotees: 200000,
    status: "Ongoing",
    avatar: "AU",
    history:
      "The 12-day Avani festival is a major annual Brahmotsavam at Tiruchendur. Lord Shanmukha is taken in procession in Red Silk (Sivappu Saathi) and White Silk (Vellai Saathi) chapparams.",
    significance:
      "Features the grand Ther Oottam (Car Festival) on the 10th day, drawing massive crowds of devotees to pull the temple chariot through Car Street.",
  },
  {
    id: 4,
    name: "Masi Perumanthiram (Masi Utsavam)",
    deity: "Lord Shanmukha with Valli & Deivanai",
    category: "Annual",
    startDate: "2026-02-14",
    endDate: "2026-02-25",
    priest: "Ganesan Sivachariar",
    expectedDevotees: 250000,
    status: "Completed",
    avatar: "MU",
    history:
      "A historic 12-day festival celebrated in Masi month featuring Silver Chariot procession (Velli Chapparam) and the sacred sea-water bath (Theerthavari).",
    significance:
      "Lord Shanmukha is adorned in Green Silk (Pachai Saathi) Alankaram, symbolizing prosperity, spiritual bliss, and divine protection for all devotees.",
  },
  {
    id: 5,
    name: "Tuesday Shanmugar Abhishekam & Kavadi Seva",
    deity: "Lord Shanmukha",
    category: "Weekly",
    startDate: nextWeekday(2),
    endDate: nextWeekday(2),
    priest: "Krishnamurthy Bhat",
    expectedDevotees: 15000,
    status: "Ongoing",
    avatar: "TS",
    history:
      "Tuesday (Sevvai) is sacred for Lord Murugan worship at Tiruchendur. Weekly special Shanmuga Abhishekam is performed with Milk, Sandal paste, Rose water, and Vibhuti.",
    significance:
      "Brings relief from Angaraka (Mars) dosham, grants health, strength, and victory in righteous endeavors.",
  },
];

const EMPTY_ADD_FORM = {
  name: "",
  deity: "",
  category: "Annual",
  startDate: "",
  endDate: "",
  priest: "",
  expectedDevotees: "",
  status: "Planned",
  history: "",
  significance: "",
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRange(start, end) {
  if (start === end) return formatDate(start);
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()))
    return `${start} – ${end}`;
  const sameMonth =
    s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.getDate()} – ${formatDate(end)}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function initialsFromName(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function Festivals() {
  const { showToast } = useToast();
  const { tr } = useLanguage();
  const [festivals, setFestivals] = useState([]);
  const [filter, setFilter] = useState("All");

  const [detailsId, setDetailsId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [editForm, setEditForm] = useState(EMPTY_ADD_FORM);

  const loadFestivals = useCallback(async () => {
    const list = await db.getFestivals();
    const mapped = (list || []).map((item) => ({
      id: item.id,
      name: item.name,
      deity: item.deity || "Lord Shanmukha",
      category: item.category || (item.name.toLowerCase().includes("tuesday") ? "Weekly" : "Annual"),
      startDate: item.startDate || (item.start_date ? String(item.start_date).slice(0, 10) : "2026-10-25"),
      endDate: item.endDate || (item.end_date ? String(item.end_date).slice(0, 10) : "2026-10-31"),
      priest: item.priest || "Ganesan Sivachariar",
      expectedDevotees: item.expectedDevotees ? Number(item.expectedDevotees) : 250000,
      status: item.status || "Planned",
      avatar: initialsFromName(item.name),
      history: item.description || item.history || "",
      significance: item.significance || "",
    }));
    setFestivals(mapped);
  }, []);

  useEffect(() => {
    loadFestivals();
  }, [loadFestivals]);

  const detailsFestival = festivals.find((f) => f.id === detailsId) || null;
  const editFestival = festivals.find((f) => f.id === editId) || null;

  const upcoming = useMemo(() => {
    const future = festivals
      .filter((f) => daysUntil(f.startDate) >= 0)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    return future[0] || null;
  }, [festivals]);

  const visible =
    filter === "All" ? festivals : festivals.filter((f) => f.status === filter);

  const openEdit = (f) => {
    setEditForm({
      name: f.name,
      deity: f.deity,
      category: f.category,
      startDate: f.startDate,
      endDate: f.endDate,
      priest: f.priest,
      expectedDevotees: f.expectedDevotees,
      status: f.status,
      history: f.history || "",
      significance: f.significance || "",
    });
    setEditId(f.id);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.startDate) {
      showToast("Festival name and start date are required");
      return;
    }
    const updatedItem = {
      name: editForm.name.trim(),
      deity: editForm.deity || "Lord Shanmukha",
      category: editForm.category,
      startDate: editForm.startDate,
      endDate: editForm.endDate || editForm.startDate,
      start_date: editForm.startDate,
      end_date: editForm.endDate || editForm.startDate,
      priest: editForm.priest || "Ganesan Sivachariar",
      expectedDevotees: editForm.expectedDevotees ? Number(editForm.expectedDevotees) : 250000,
      status: editForm.status,
      history: editForm.history.trim(),
      description: editForm.history.trim(),
      significance: editForm.significance.trim(),
    };
    await db.updateFestival(editId, updatedItem);
    setEditId(null);
    showToast(`${editForm.name} updated`);
    loadFestivals();
  };

  const openAdd = () => {
    setAddForm(EMPTY_ADD_FORM);
    setAddOpen(true);
  };

  const saveAdd = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.startDate) {
      showToast("Festival name and start date are required");
      return;
    }
    const newItem = {
      name: addForm.name.trim(),
      deity: addForm.deity || "Lord Shanmukha",
      category: addForm.category,
      startDate: addForm.startDate,
      endDate: addForm.endDate || addForm.startDate,
      start_date: addForm.startDate,
      end_date: addForm.endDate || addForm.startDate,
      priest: addForm.priest || "Ganesan Sivachariar",
      expectedDevotees: addForm.expectedDevotees ? Number(addForm.expectedDevotees) : 10000,
      status: addForm.status,
      history: addForm.history.trim(),
      description: addForm.history.trim(),
      significance: addForm.significance.trim(),
    };
    await db.addFestival(newItem);
    setAddOpen(false);
    showToast(`${addForm.name} added`);
    loadFestivals();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    await db.deleteFestival(targetId);
    showToast(`${deleteTarget.name} removed`);
    setDeleteTarget(null);
    if (detailsId === targetId) setDetailsId(null);
    loadFestivals();
  };

  return (
    <div>
      {/* ---------- Nearest upcoming festival ---------- */}
      {upcoming && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-head" style={{ justifyContent: "space-between" }}>
            <h3>{tr("Upcoming Festival")}</h3>
            <div className="action-btn-group">
              <button
                className="icon-action-btn view-btn"
                title={tr("View Details")}
                aria-label={`View ${upcoming.name}`}
                onClick={() => setDetailsId(upcoming.id)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button
                className="icon-action-btn edit-btn"
                title={tr("Edit Festival")}
                aria-label={`Edit ${upcoming.name}`}
                onClick={() => openEdit(upcoming)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="panel-body">
            <p className="entity-name" style={{ marginBottom: 4 }}>
              {tr(upcoming.name)}
            </p>
            <p className="entity-role" style={{ marginBottom: 0 }}>
              {formatRange(upcoming.startDate, upcoming.endDate)} · {tr("in")}{" "}
              {daysUntil(upcoming.startDate)} {tr("Days")}
            </p>
          </div>
        </div>
      )}

      {/* ---------- Status filter chips + Add button ---------- */}
      <div className="table-toolbar">
        <div className="chip-row">
          {["All", ...STATUSES].map((s) => (
            <div
              key={s}
              className={`chip${filter === s ? " active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {tr(s)}
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={openAdd}>
          {tr("+ New Festival")}
        </button>
      </div>

      {/* ---------- Festival cards ---------- */}
      <div className="card-grid">
        {visible.map((f) => (
          <div className="entity-card" key={f.id}>
            <div
              className={`entity-card-top ${CARD_TOP_CLASSES[f.category] || ""}`}
            >
              <span className="ec-tag">
                {tr(f.category)} ·{" "}
                {f.category === "Weekly"
                  ? tr("Recurring")
                  : formatDate(f.startDate)}
              </span>
            </div>
            <div className="entity-body">
              <p className="entity-name">{tr(f.name)}</p>
              <p className="entity-role">{tr("Main deity")} — {tr(f.deity)}</p>
              <div className="entity-meta-row">
                <span>{f.category === "Weekly" ? tr("Recurs") : tr("Dates")}</span>
                <span className="v">
                  {f.category === "Weekly"
                    ? tr("Every Friday")
                    : formatRange(f.startDate, f.endDate)}
                </span>
              </div>
              <div className="entity-meta-row">
                <span>
                  {f.category === "Weekly"
                    ? tr("Avg. footfall")
                    : tr("Expected devotees")}
                </span>
                <span className="v">
                  {f.category === "Weekly"
                    ? `~${f.expectedDevotees}`
                    : f.expectedDevotees.toLocaleString()}
                </span>
              </div>
              <div className="entity-meta-row">
                <span>{tr("Status")}</span>
                <span className={`pill ${STATUS_PILL[f.status] || "grey"}`}>
                  {tr(f.status)}
                </span>
              </div>
              <div className="entity-foot" style={{ justifyContent: "flex-end" }}>
                <div className="action-btn-group">
                  <button
                    className="icon-action-btn view-btn"
                    title={tr("View Festival Details")}
                    aria-label={`View details of ${f.name}`}
                    onClick={() => setDetailsId(f.id)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button
                    className="icon-action-btn edit-btn"
                    title={tr("Edit Festival")}
                    aria-label={`Edit ${f.name}`}
                    onClick={() => openEdit(f)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    className="icon-action-btn delete-btn"
                    title={tr("Delete Festival")}
                    aria-label={`Delete ${f.name}`}
                    onClick={() => setDeleteTarget(f)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="muted" style={{ padding: 20 }}>
            {tr("No festivals match your filters.")}
          </p>
        )}
      </div>

      {/* ---------- Details modal ---------- */}
      {detailsFestival && (
        <div className="modal-overlay" onClick={() => setDetailsId(null)}>
          <div
            className="modal-card profile-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setDetailsId(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="profile-header">
              <div className="profile-photo profile-photo-placeholder">
                {detailsFestival.avatar}
              </div>
              <div>
                <p className="profile-name">{detailsFestival.name}</p>
                <p className="profile-role">
                  Main deity — {detailsFestival.deity}
                </p>
                <span
                  className={`pill ${STATUS_PILL[detailsFestival.status] || "grey"}`}
                >
                  {detailsFestival.status}
                </span>
              </div>
            </div>

            <div className="profile-grid">
              <div className="profile-row full">
                <span className="k">History</span>
                <span className="v">{detailsFestival.history || "—"}</span>
              </div>
              <div className="profile-row full">
                <span className="k">Why It's Celebrated</span>
                <span className="v">{detailsFestival.significance || "—"}</span>
              </div>
              <div className="profile-row">
                <span className="k">When It's Celebrated</span>
                <span className="v">
                  {detailsFestival.category === "Weekly"
                    ? "Every Friday"
                    : formatRange(
                        detailsFestival.startDate,
                        detailsFestival.endDate,
                      )}
                </span>
              </div>
              <div className="profile-row">
                <span className="k">Chief Priest</span>
                <span className="v">{detailsFestival.priest || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Edit festival modal ---------- */}
      {editFestival && (
        <div className="modal-overlay" onClick={() => setEditId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setEditId(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="modal-title">Edit Festival · {editFestival.name}</h3>
            <form onSubmit={saveEdit}>
              <div className="form-grid">
                <div className="field">
                  <label>Festival Name *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Main Deity</label>
                  <input
                    type="text"
                    value={editForm.deity}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, deity: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, category: e.target.value }))
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, status: e.target.value }))
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, startDate: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, endDate: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Chief Priest</label>
                  <input
                    type="text"
                    value={editForm.priest}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, priest: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Expected Devotees</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.expectedDevotees}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        expectedDevotees: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="field field-full">
                  <label>History</label>
                  <textarea
                    rows={3}
                    value={editForm.history}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, history: e.target.value }))
                    }
                  />
                </div>
                <div className="field field-full">
                  <label>Why It's Celebrated</label>
                  <textarea
                    rows={3}
                    value={editForm.significance}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        significance: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditId(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Festival
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Add festival modal ---------- */}
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
            <h3 className="modal-title">New Festival</h3>
            <form onSubmit={saveAdd}>
              <div className="form-grid">
                <div className="field">
                  <label>Festival Name *</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Skanda Sashti"
                    required
                  />
                </div>
                <div className="field">
                  <label>Main Deity</label>
                  <input
                    type="text"
                    value={addForm.deity}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, deity: e.target.value }))
                    }
                    placeholder="e.g. Lord Muruga"
                  />
                </div>
                <div className="field">
                  <label>Category</label>
                  <select
                    value={addForm.category}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, category: e.target.value }))
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={addForm.status}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, status: e.target.value }))
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={addForm.startDate}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, startDate: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={addForm.endDate}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, endDate: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Chief Priest</label>
                  <input
                    type="text"
                    value={addForm.priest}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, priest: e.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Expected Devotees</label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.expectedDevotees}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        expectedDevotees: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="field field-full">
                  <label>History</label>
                  <textarea
                    rows={3}
                    value={addForm.history}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, history: e.target.value }))
                    }
                  />
                </div>
                <div className="field field-full">
                  <label>Why It's Celebrated</label>
                  <textarea
                    rows={3}
                    value={addForm.significance}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        significance: e.target.value,
                      }))
                    }
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
                  Add Festival
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
            <h3 className="modal-title">Delete Festival</h3>
            <p className="muted">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
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
