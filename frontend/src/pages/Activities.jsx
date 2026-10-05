import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useLanguage } from "../context/LanguageContext";
import { db } from "../services/db";
import Pagination from "../components/Pagination";

const FILTERS = ["All", "Daily", "Weekly", "Monthly", "Festival", "Special"];
const pillClass = (s) =>
  s === "Completed"
    ? "pill green"
    : s === "Scheduled"
      ? "pill amber"
      : "pill grey";

const ActivityRow = memo(function ActivityRow({
  activity,
  onView,
  onEdit,
  onDelete,
}) {
  const { tr } = useLanguage();
  return (
    <tr className="new-row">
      <td>
        <div className="cell-name">{tr(activity.name)}</div>
        {activity.sub && <div className="cell-sub">{tr(activity.sub)}</div>}
      </td>
      <td>{tr(activity.type)}</td>
      <td className="mono">{activity.when_date || activity.when}</td>
      <td>{tr(activity.priest)}</td>
      <td>
        <span className={pillClass(activity.status)}>{tr(activity.status)}</span>
      </td>
      <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
        <div className="action-btn-group" style={{ justifyContent: "flex-end" }}>
          <button
            className="icon-action-btn view-btn"
            title="View Details"
            aria-label={`View ${activity.name}`}
            onClick={() => onView(activity)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            className="icon-action-btn edit-btn"
            title="Edit Activity"
            aria-label={`Edit ${activity.name}`}
            onClick={() => onEdit(activity)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="icon-action-btn delete-btn"
            title="Delete Activity"
            aria-label={`Delete ${activity.name}`}
            onClick={() => onDelete(activity)}
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
  );
});

export default function Activities() {
  const { tr, t } = useLanguage();

  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals for CRUD
  const [viewActivity, setViewActivity] = useState(null);
  const [editActivity, setEditActivity] = useState(null);
  const [deleteActivity, setDeleteActivity] = useState(null);

  const [form, setForm] = useState({ name: "", sub: "", priest: "", type: "Daily", when_date: "", status: "Scheduled" });
  const [editForm, setEditForm] = useState({ name: "", sub: "", priest: "", type: "Daily", when_date: "", status: "Scheduled" });

  const searchRef = useRef(null);

  const loadData = useCallback(async () => {
    const list = await db.getActivities();
    setActivities(list || []);
  }, []);

  useEffect(() => {
    loadData();
    searchRef.current && searchRef.current.focus();
  }, [loadData]);

  const handleAdd = useCallback(
    async (e) => {
      e.preventDefault();
      if (!form.name.trim()) return;
      const whenVal = form.when_date.trim() || (new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' · 9:00 AM');
      await db.addActivity({
        name: form.name.trim(),
        sub: form.sub.trim() || "Sanctum sanctorum",
        type: form.type,
        when_date: whenVal,
        when: whenVal,
        priest: form.priest.trim() || "Unassigned",
        status: form.status,
      });
      loadData();
      setForm({ name: "", sub: "", priest: "", type: "Daily", when_date: "", status: "Scheduled" });
      setShowForm(false);
    },
    [form, loadData],
  );

  const openEdit = (act) => {
    setEditActivity(act);
    setEditForm({
      name: act.name,
      sub: act.sub || "",
      priest: act.priest,
      type: act.type,
      when_date: act.when_date || act.when || "",
      status: act.status,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editActivity || !editForm.name.trim()) return;
    await db.updateActivity(editActivity.id, {
      name: editForm.name.trim(),
      sub: editForm.sub.trim(),
      priest: editForm.priest.trim(),
      type: editForm.type,
      when_date: editForm.when_date.trim(),
      status: editForm.status,
    });
    setEditActivity(null);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteActivity) return;
    await db.deleteActivity(deleteActivity.id);
    setDeleteActivity(null);
    loadData();
  };

  const visible = activities.filter(
    (a) =>
      (filter === "All" || a.type === filter) &&
      a.name.toLowerCase().includes(search.toLowerCase()),
  );

  const paginatedVisible = visible.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <div className="table-toolbar">
        <div className="chip-row">
          {FILTERS.map((f) => (
            <div
              key={f}
              className={"chip" + (filter === f ? " active" : "")}
              onClick={() => setFilter(f)}
            >
              {tr(f)}
            </div>
          ))}
        </div>
        <div className="field-inline">
          <input
            ref={searchRef}
            type="text"
            placeholder={tr("Search activities…")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "1px solid var(--stone-dark)",
              borderRadius: "9px",
              padding: "9px 12px",
              fontSize: "12.5px",
              background: "var(--ivory)",
              color: "var(--ink)",
              outline: "none",
              width: "200px",
            }}
          />
          <button
            className="btn-primary"
            onClick={() => setShowForm((s) => !s)}
          >
            {tr("+ Schedule Activity")}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="panel">
          <div className="panel-head">
            <h3>Schedule New Activity</h3>
          </div>
          <form className="panel-body" onSubmit={handleAdd}>
            <div className="form-grid">
              <div className="field">
                <label>Activity Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Sub Description</label>
                <input
                  value={form.sub}
                  onChange={(e) => setForm({ ...form, sub: e.target.value })}
                  placeholder="e.g. Sanctum sanctorum"
                />
              </div>
              <div className="field">
                <label>Priest Name</label>
                <input
                  value={form.priest}
                  onChange={(e) => setForm({ ...form, priest: e.target.value })}
                  placeholder="e.g. Ganesan Sivachariar"
                />
              </div>
              <div className="field">
                <label>Activity Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {FILTERS.filter((f) => f !== "All").map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Date & Time</label>
                <input
                  value={form.when_date}
                  onChange={(e) => setForm({ ...form, when_date: e.target.value })}
                  placeholder="e.g. 10 Aug · 10:00 AM"
                />
              </div>
              <div className="field">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Activity
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>{tr.act_activity}</th>
              <th>{tr.act_type}</th>
              <th>{tr.act_datetime}</th>
              <th>{tr.act_priest}</th>
              <th>{tr(t.act_status || "Status")}</th>
              <th style={{ textAlign: "right" }}>{tr("ACTIONS")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVisible.map((a) => (
              <ActivityRow
                key={a.id}
                activity={a}
                onView={setViewActivity}
                onEdit={openEdit}
                onDelete={setDeleteActivity}
              />
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="empty-state">{tr.act_empty}</div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={visible.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* ---------- View Details Modal ---------- */}
      {viewActivity && (
        <div className="modal-overlay" onClick={() => setViewActivity(null)}>
          <div className="modal-card profile-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewActivity(null)} aria-label="Close">
              ✕
            </button>
            <h3 className="modal-title" style={{ marginBottom: 14 }}>Activity Details</h3>
            <div className="profile-grid" style={{ borderTop: "none" }}>
              <div className="profile-row full">
                <span className="k">Activity Name</span>
                <span className="v">{viewActivity.name}</span>
              </div>
              {viewActivity.sub && (
                <div className="profile-row full">
                  <span className="k">Sub details</span>
                  <span className="v">{viewActivity.sub}</span>
                </div>
              )}
              <div className="profile-row">
                <span className="k">Type</span>
                <span className="v">{viewActivity.type}</span>
              </div>
              <div className="profile-row">
                <span className="k">Date & Time</span>
                <span className="v">{viewActivity.when_date || viewActivity.when}</span>
              </div>
              <div className="profile-row">
                <span className="k">Assigned Priest</span>
                <span className="v">{viewActivity.priest}</span>
              </div>
              <div className="profile-row">
                <span className="k">Status</span>
                <span className={pillClass(viewActivity.status)}>{viewActivity.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Edit Modal ---------- */}
      {editActivity && (
        <div className="modal-overlay" onClick={() => setEditActivity(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditActivity(null)} aria-label="Close">
              ✕
            </button>
            <h3 className="modal-title">Edit Activity</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-grid">
                <div className="field">
                  <label>Activity Name *</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Sub Description</label>
                  <input
                    value={editForm.sub}
                    onChange={(e) => setEditForm({ ...editForm, sub: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Priest Name</label>
                  <input
                    value={editForm.priest}
                    onChange={(e) => setEditForm({ ...editForm, priest: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Activity Type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  >
                    {FILTERS.filter((f) => f !== "All").map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Date & Time</label>
                  <input
                    value={editForm.when_date}
                    onChange={(e) => setEditForm({ ...editForm, when_date: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditActivity(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Delete Confirmation Modal ---------- */}
      {deleteActivity && (
        <div className="modal-overlay" onClick={() => setDeleteActivity(null)}>
          <div className="modal-card confirm-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDeleteActivity(null)} aria-label="Close">
              ✕
            </button>
            <h3 className="modal-title">Delete Activity</h3>
            <p className="muted">
              Are you sure you want to delete <strong>{deleteActivity.name}</strong>? This action cannot be undone.
            </p>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteActivity(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDeleteConfirm}
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
