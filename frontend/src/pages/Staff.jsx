import { useMemo, useState, useEffect, useCallback } from "react";
import { useToast } from "../context/ToastContext";
import Pagination from "../components/Pagination";
import { useLanguage } from "../context/LanguageContext";
import { db } from "../services/db";

const DEPARTMENTS = [
  "All Departments",
  "Security",
  "Cleaning",
  "Accounts",
  "Volunteer",
];

const ROLES = [
  "Security",
  "Cleaning",
  "Accounts",
  "Volunteer",
  "Office Manager",
  "Accountant",
  "Store Keeper",
  "Kitchen Supervisor",
  "Administration",
];

const INITIAL_STAFF = [
  {
    id: "s1",
    name: "Muthu Kumar",
    initial: "M",
    category: "Security",
    department: "Security",
    shift: "Morning",
    status: "Active",
    age: 34,
    gender: "Male",
    qualification: "ITI - Security Management",
    joinedDate: "2016-03-12",
    experience: "8 years",
  },
  {
    id: "s2",
    name: "Selvi R.",
    initial: "S",
    category: "Cleaning",
    department: "Housekeeping",
    shift: "Full Day",
    status: "Active",
    age: 41,
    gender: "Female",
    qualification: "SSLC",
    joinedDate: "2012-07-01",
    experience: "12 years",
  },
  {
    id: "s3",
    name: "Bhaskaran N.",
    initial: "B",
    category: "Accounts",
    department: "Administration",
    shift: "Morning",
    status: "Active",
    age: 38,
    gender: "Male",
    qualification: "B.Com",
    joinedDate: "2015-01-20",
    experience: "9 years",
  },
  {
    id: "s4",
    name: "Deepa V.",
    initial: "D",
    category: "Volunteer",
    department: "Annadhanam",
    shift: "Evening",
    status: "On Leave",
    age: 27,
    gender: "Female",
    qualification: "B.Sc Nutrition",
    joinedDate: "2021-09-05",
    experience: "3 years",
  },
  {
    id: "s5",
    name: "Ramesh K.",
    initial: "R",
    category: "Security",
    department: "Security",
    shift: "Evening",
    status: "Active",
    age: 45,
    gender: "Male",
    qualification: "Diploma - Fire & Safety",
    joinedDate: "2009-11-18",
    experience: "15 years",
  },
];

const EMPTY_FORM = {
  name: "",
  age: "",
  gender: "Male",
  qualification: "",
  category: "Security",
  department: "",
  shift: "Morning",
  status: "Active",
  joinedDate: "",
  experience: "",
};

function pillClass(status) {
  if (status === "Active") return "pill green";
  if (status === "On Leave") return "pill amber";
  return "pill grey";
}

export default function Staff() {
  const { showToast } = useToast();
  const [staff, setStaff] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All Departments");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    const list = await db.getStaff();
    const mapped = (list || []).map((s) => {
      const name = s.name || "Staff Member";
      const role = s.role || s.category || "Staff";
      const category = s.category || s.role || "Security";
      const shift = s.shift || "Morning";
      return {
        ...s,
        name,
        initial: s.initial || name.charAt(0).toUpperCase(),
        role,
        category,
        department: s.department || "General",
        shift,
        status: s.status || "Active",
        age: s.age || "",
        gender: s.gender || "Male",
        qualification: s.qualification || "—",
        joinedDate: s.joinedDate || "—",
        experience: s.experience || "—",
      };
    });
    setStaff(mapped);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    if (activeFilter === "All Departments") return staff;
    return staff.filter((s) => s.category === activeFilter || s.role === activeFilter || s.department === activeFilter);
  }, [staff, activeFilter]);

  const paginatedStaff = useMemo(() => {
    return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filtered, currentPage, pageSize]);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAddSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Please fill in staff name");
      return;
    }
    const initial = form.name.trim().charAt(0).toUpperCase();
    const newStaff = {
      name: form.name.trim(),
      initial,
      role: form.category || "Staff",
      category: form.category || "Security",
      department: form.department.trim() || "General",
      shift: form.shift || "Morning",
      status: form.status || "Active",
      age: form.age ? Number(form.age) : "",
      gender: form.gender || "Male",
      qualification: form.qualification.trim() || "—",
      joinedDate: form.joinedDate || "—",
      experience: form.experience ? `${form.experience} years` : "—",
    };
    await db.addStaff(newStaff);
    setShowAddForm(false);
    setForm(EMPTY_FORM);
    showToast(`${newStaff.name} added to staff`);
    loadData();
  }

  function openEdit(person) {
    setEditing(person);
    setForm({
      name: person.name || "",
      age: person.age || "",
      gender: person.gender || "Male",
      qualification: person.qualification && person.qualification !== "—" ? person.qualification : "",
      category: person.category || person.role || "Security",
      department: person.department || "",
      shift: person.shift || "Morning",
      status: person.status || "Active",
      joinedDate: person.joinedDate && person.joinedDate !== "—" ? person.joinedDate : "",
      experience: person.experience && person.experience !== "—" ? String(person.experience).replace(" years", "") : "",
    });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editing || !form.name.trim()) return;
    const updatedStaff = {
      name: form.name.trim(),
      initial: form.name.trim().charAt(0).toUpperCase(),
      role: form.category || "Staff",
      category: form.category || "Security",
      department: form.department.trim() || "General",
      shift: form.shift || "Morning",
      status: form.status || "Active",
      age: form.age ? Number(form.age) : "",
      gender: form.gender || "Male",
      qualification: form.qualification.trim() || "—",
      joinedDate: form.joinedDate || "—",
      experience: form.experience ? `${form.experience} years` : "—",
    };
    await db.updateStaff(editing.id, updatedStaff);
    showToast(`${form.name}'s details updated`);
    setEditing(null);
    loadData();
  }

  async function handleConfirmDelete() {
    if (!deleting) return;
    await db.deleteStaff(deleting.id);
    showToast(`${deleting.name} removed`);
    setDeleting(null);
    if (viewing?.id === deleting.id) setViewing(null);
    loadData();
  }

  const { tr } = useLanguage();

  return (
    <div className="staff-page">
      <style>{`
        .modal-overlay{
          position:fixed;inset:0;background:rgba(42,31,23,0.45);backdrop-filter:blur(2px);
          display:flex;align-items:center;justify-content:center;z-index:200;padding:20px;
          animation:fadeIn 0.2s ease;
        }
        .modal-box{
          background:var(--paper);border-radius:18px;box-shadow:var(--shadow-lg);
          width:100%;max-width:460px;max-height:88vh;overflow-y:auto;padding:24px 26px;
        }
        .modal-box h3{font-family:'Marcellus SC',serif;font-weight:400;font-size:18px;margin:0 0 4px;}
        .modal-close{
          float:right;background:none;border:none;font-size:18px;color:var(--ink-faint);
          cursor:pointer;line-height:1;
        }
        .detail-head{display:flex;align-items:center;gap:14px;margin-bottom:18px;}
        .detail-avatar{
          width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--sindoor),var(--sindoor-dark));
          color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600;flex-shrink:0;
        }
        .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 16px;}
        .detail-grid .dg-full{grid-column:1 / -1;}
        .detail-grid .k{font-size:10.5px;text-transform:uppercase;letter-spacing:0.6px;color:var(--ink-faint);display:block;margin-bottom:3px;}
        .detail-grid .v{font-size:13px;color:var(--ink);font-weight:500;}
        .confirm-box{max-width:360px;text-align:center;}
        .confirm-box p{font-size:13px;color:var(--ink-soft);margin:6px 0 18px;}
      `}</style>

      <div className="table-toolbar">
        <div className="chip-row">
          {DEPARTMENTS.map((dept) => (
            <div
              key={dept}
              className={`chip${activeFilter === dept ? " active" : ""}`}
              onClick={() => {
                setActiveFilter(dept);
                setCurrentPage(1);
              }}
              style={{ cursor: "pointer" }}
            >
              {tr(dept)}
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY_FORM); setShowAddForm(true); }}>
          {tr("+ Add Staff")}
        </button>
      </div>

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>{tr("STAFF")}</th>
              <th>{tr("ROLE")}</th>
              <th>{tr("DEPARTMENT")}</th>
              <th>{tr("SHIFT")}</th>
              <th>{tr("STATUS")}</th>
              <th style={{ textAlign: "right" }}>{tr("ACTIONS")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "var(--ink-faint)",
                  }}
                >
                  {tr("No staff in this department yet.")}
                </td>
              </tr>
            )}
            {paginatedStaff.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="row-flex">
                    <div className="avatar-sm">{s.initial}</div>
                    <div className="cell-name">{tr(s.name)}</div>
                  </div>
                </td>
                <td>{tr(s.role || s.category)}</td>
                <td>{tr(s.department)}</td>
                <td>{tr(s.shift || "Morning")}</td>
                <td>
                  <span className={pillClass(s.status)}>{tr(s.status)}</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div className="action-btn-group" style={{ justifyContent: "flex-end" }}>
                    <button
                      className="icon-action-btn view-btn"
                      title="View Details"
                      aria-label={`View details of ${s.name}`}
                      onClick={() => setViewing(s)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      className="icon-action-btn edit-btn"
                      title="Edit Staff"
                      aria-label={`Edit ${s.name}`}
                      onClick={() => openEdit(s)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="icon-action-btn delete-btn"
                      title="Remove Staff"
                      aria-label={`Remove ${s.name}`}
                      onClick={() => setDeleting(s)}
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
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* ---------- View Details Modal ---------- */}
      {viewing && (
        <div className="modal-overlay" onClick={() => setViewing(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewing(null)}>
              ✕
            </button>
            <div className="detail-head">
              <div className="detail-avatar">{viewing.initial}</div>
              <div>
                <h3>{viewing.name}</h3>
                <span className={pillClass(viewing.status)}>
                  {viewing.status}
                </span>
              </div>
            </div>
            <div className="detail-grid">
              <div>
                <span className="k">Age</span>
                <span className="v">{viewing.age || "—"}</span>
              </div>
              <div>
                <span className="k">Gender</span>
                <span className="v">{viewing.gender}</span>
              </div>
              <div className="dg-full">
                <span className="k">Qualification</span>
                <span className="v">{viewing.qualification}</span>
              </div>
              <div>
                <span className="k">Role</span>
                <span className="v">{viewing.category}</span>
              </div>
              <div>
                <span className="k">Department</span>
                <span className="v">{viewing.department}</span>
              </div>
              <div>
                <span className="k">Shift</span>
                <span className="v">{viewing.shift}</span>
              </div>
              <div>
                <span className="k">Joined On</span>
                <span className="v">{viewing.joinedDate}</span>
              </div>
              <div>
                <span className="k">Experience</span>
                <span className="v">{viewing.experience}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Delete Confirmation Modal ---------- */}
      {deleting && (
        <div className="modal-overlay" onClick={() => setDeleting(null)}>
          <div
            className="modal-box confirm-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Remove {deleting.name}?</h3>
            <p>
              This will remove them from the staff list. This action cannot be undone.
            </p>
            <div className="form-actions" style={{ justifyContent: "center" }}>
              <button
                className="btn-secondary"
                onClick={() => setDeleting(null)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ background: "var(--sindoor-dark)" }}
                onClick={handleConfirmDelete}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Add Staff Modal ---------- */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowAddForm(false)}
            >
              ✕
            </button>
            <h3 style={{ marginBottom: 16 }}>Add Staff / Volunteer</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="form-grid">
                <div className="field">
                  <label>Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Age</label>
                  <input
                    type="number"
                    min="16"
                    max="80"
                    value={form.age}
                    onChange={(e) => updateField("age", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Role / Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Department *</label>
                  <input
                    placeholder="e.g. Security, Housekeeping"
                    value={form.department}
                    onChange={(e) => updateField("department", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Shift</label>
                  <select
                    value={form.shift}
                    onChange={(e) => updateField("shift", e.target.value)}
                  >
                    <option>Morning</option>
                    <option>Evening</option>
                    <option>Full Day</option>
                    <option>Night</option>
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                  >
                    <option>Active</option>
                    <option>On Leave</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div className="field">
                  <label>Joined Date</label>
                  <input
                    type="date"
                    value={form.joinedDate}
                    onChange={(e) => updateField("joinedDate", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Experience (years)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={form.experience}
                    onChange={(e) => updateField("experience", e.target.value)}
                  />
                </div>
                <div className="field field-full">
                  <label>Qualification</label>
                  <input
                    value={form.qualification}
                    onChange={(e) =>
                      updateField("qualification", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Edit Staff Modal ---------- */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditing(null)}>
              ✕
            </button>
            <h3 style={{ marginBottom: 16 }}>Edit Staff Details</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-grid">
                <div className="field">
                  <label>Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Age</label>
                  <input
                    type="number"
                    min="16"
                    max="80"
                    value={form.age}
                    onChange={(e) => updateField("age", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Role / Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Department *</label>
                  <input
                    value={form.department}
                    onChange={(e) => updateField("department", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Shift</label>
                  <select
                    value={form.shift}
                    onChange={(e) => updateField("shift", e.target.value)}
                  >
                    <option>Morning</option>
                    <option>Evening</option>
                    <option>Full Day</option>
                    <option>Night</option>
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                  >
                    <option>Active</option>
                    <option>On Leave</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div className="field">
                  <label>Joined Date</label>
                  <input
                    type="date"
                    value={form.joinedDate}
                    onChange={(e) => updateField("joinedDate", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Experience (years)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={form.experience}
                    onChange={(e) => updateField("experience", e.target.value)}
                  />
                </div>
                <div className="field field-full">
                  <label>Qualification</label>
                  <input
                    value={form.qualification}
                    onChange={(e) =>
                      updateField("qualification", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
