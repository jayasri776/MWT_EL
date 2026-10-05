import { useState, useEffect, useCallback } from "react";
import { useToast } from "../context/ToastContext";
import Pagination from "../components/Pagination";
import { useLanguage } from "../context/LanguageContext";
import { db } from "../services/db";

const DEPARTMENTS = ["Archaka Vibhagam", "Utsavam Vibhagam", "Agama Vibhagam"];
const DESIGNATIONS = ["Chief Priest", "Assistant Priest", "Priest"];
const SHIFTS = ["Morning", "Evening", "Full Day"];
const AVAILABILITY = ["Available", "On Duty", "On Leave"];
const CARD_TOP_CLASSES = ["", "gold", "sindoor"];
const PILL_CLASS = {
  Available: "green",
  "On Duty": "amber",
  "On Leave": "red",
};
const INITIAL_PRIESTS = [
  {
    id: 1,
    name: "Ganesan Sivachariar",
    designation: "Chief Priest",
    department: "Archaka Vibhagam",
    specialization: "Abhishekam, Homam",
    gender: "Male",
    dob: "1968-04-12",
    address: "12, Kovil Street, Tiruchendur, Thoothukudi District, Tamil Nadu",
    contact: "+91 98401 23456",
    qualification: "Agama Sastra Diploma, Tiruchendur Veda Patasala",
    joinedOn: "2003-06-01",
    experience: "22 years",
    shift: "Morning",
    availability: "Available",
    photo: "",
  },
  {
    id: 2,
    name: "Krishnamurthy Bhat",
    designation: "Assistant Priest",
    department: "Archaka Vibhagam",
    specialization: "Aarti, Homam",
    gender: "Male",
    dob: "1981-09-05",
    address: "34, Agraharam Street, Tiruchendur, Thoothukudi District, Tamil Nadu",
    contact: "+91 98402 34567",
    qualification: "Vedic Studies Certificate, Kumbakonam Veda Patasala",
    joinedOn: "2015-03-10",
    experience: "9 years",
    shift: "Full Day",
    availability: "On Duty",
    photo: "",
  },
  {
    id: 3,
    name: "Ravishankar Gurukkal",
    designation: "Assistant Priest",
    department: "Utsavam Vibhagam",
    specialization: "Abhishekam",
    gender: "Male",
    dob: "1975-01-20",
    address: "8, Temple East Street, Tiruchendur, Thoothukudi District, Tamil Nadu",
    contact: "+91 98403 45678",
    qualification: "Agama Sastra Certificate, Chidambaram Patasala",
    joinedOn: "2010-07-15",
    experience: "14 years",
    shift: "Evening",
    availability: "On Leave",
    photo: "",
  },
];

const EMPTY_FORM = {
  name: "",
  designation: "Assistant Priest",
  department: "Archaka Vibhagam",
  specialization: "",
  gender: "Male",
  dob: "",
  address: "",
  contact: "",
  qualification: "",
  joinedOn: "",
  experience: "",
  shift: "Morning",
  availability: "Available",
  photo: "",
};

function initialsOf(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function calcAge(dob) {
  if (!dob) return "—";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "—";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

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

export default function Priests() {
  const { showToast } = useToast();
  const [priests, setPriests] = useState([]);
  const [filter, setFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const [profileId, setProfileId] = useState(null);
  const [editPriest, setEditPriest] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    const list = await db.getPriests();
    setPriests(list || []);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visible =
    filter === "All"
      ? priests
      : priests.filter((p) => p.availability === filter || p.status === filter);

  const paginatedVisible = visible.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const profilePriest = priests.find((p) => p.id === profileId) || null;

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateForm("photo", reader.result);
    reader.readAsDataURL(file);
  };

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setAddOpen(true);
  };

  const handleAddPriest = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Please fill in priest name");
      return;
    }
    await db.addPriest({
      ...form,
      availability: form.availability || "Available",
      status: form.availability || "Active",
    });
    setAddOpen(false);
    showToast(`${form.name} has been added as a priest`);
    loadData();
  };

  const openEditForm = (priest) => {
    setEditPriest(priest);
    setForm({
      name: priest.name,
      designation: priest.designation || "Assistant Priest",
      department: priest.department || "Archaka Vibhagam",
      specialization: priest.specialization || "",
      gender: priest.gender || "Male",
      dob: priest.dob || "",
      address: priest.address || "",
      contact: priest.contact || priest.phone || "",
      qualification: priest.qualification || "",
      joinedOn: priest.joinedOn || "",
      experience: priest.experience || "",
      shift: priest.shift || "Morning",
      availability: priest.availability || priest.status || "Available",
      photo: priest.photo || "",
    });
  };

  const handleEditPriest = async (e) => {
    e.preventDefault();
    if (!editPriest) return;
    await db.updatePriest(editPriest.id, {
      ...form,
      status: form.availability || "Active",
    });
    showToast(`${form.name}'s details updated`);
    setEditPriest(null);
    loadData();
  };

  const requestDelete = (priest) => setDeleteTarget(priest);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await db.deletePriest(deleteTarget.id);
    showToast(`${deleteTarget.name} has been removed`);
    setDeleteTarget(null);
    setProfileId((id) => (id === deleteTarget.id ? null : id));
    loadData();
  };

  const cancelDelete = () => setDeleteTarget(null);

  const { tr } = useLanguage();

  return (
    <div>
      <div className="table-toolbar">
        <div className="chip-row">
          {["All", "Available", "On Duty", "On Leave"].map((chip) => (
            <div
              key={chip}
              className={`chip${filter === chip ? " active" : ""}`}
              onClick={() => {
                setFilter(chip);
                setCurrentPage(1);
              }}
            >
              {tr(chip)}
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={openAddForm}>
          {tr("+ Add Priest")}
        </button>
      </div>

      <div className="card-grid">
        {paginatedVisible.map((priest, i) => (
          <div className="entity-card" key={priest.id}>
            <div
              className={`entity-card-top ${CARD_TOP_CLASSES[i % CARD_TOP_CLASSES.length]}`}
            >
              <span className="ec-tag">{tr(priest.department)}</span>
              {priest.photo ? (
                <img
                  className="entity-avatar entity-avatar-img"
                  src={priest.photo}
                  alt={priest.name}
                />
              ) : (
                <div className="entity-avatar">{initialsOf(priest.name)}</div>
              )}
            </div>
            <div className="entity-body">
              <p className="entity-name">{tr(priest.name)}</p>
              <p className="entity-role">
                {tr(priest.designation)} · {tr(priest.specialization || "—")}
              </p>
              <div className="entity-meta-row">
                <span>{tr("Experience")}</span>
                <span className="v">{tr(priest.experience || "—")}</span>
              </div>
              <div className="entity-meta-row">
                <span>{tr("Shift")}</span>
                <span className="v">{tr(priest.shift)}</span>
              </div>
              <div className="entity-meta-row">
                <span>{tr("Availability")}</span>
                <span
                  className={`pill ${PILL_CLASS[priest.availability] || "grey"}`}
                >
                  {tr(priest.availability)}
                </span>
              </div>
              <div className="entity-foot" style={{ justifyContent: "flex-end" }}>
                <div className="action-btn-group">
                  <button
                    className="icon-action-btn view-btn"
                    title="View Profile"
                    aria-label={`View profile of ${priest.name}`}
                    onClick={() => setProfileId(priest.id)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button
                    className="icon-action-btn edit-btn"
                    title="Edit Priest"
                    aria-label={`Edit ${priest.name}`}
                    onClick={() => openEditForm(priest)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    className="icon-action-btn delete-btn"
                    title="Delete Priest"
                    aria-label={`Delete ${priest.name}`}
                    onClick={() => requestDelete(priest)}
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
            No priests match this filter.
          </p>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={visible.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[3, 6, 12]}
      />

      {/* ---------- Full profile modal ---------- */}
      {profilePriest && (
        <div className="modal-overlay" onClick={() => setProfileId(null)}>
          <div
            className="modal-card profile-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setProfileId(null)}
              aria-label="Close"
            >
              ✕
            </button>

            <div className="profile-header">
              {profilePriest.photo ? (
                <img
                  className="profile-photo"
                  src={profilePriest.photo}
                  alt={profilePriest.name}
                />
              ) : (
                <div className="profile-photo profile-photo-placeholder">
                  {initialsOf(profilePriest.name)}
                </div>
              )}
              <div>
                <p className="profile-name">{profilePriest.name}</p>
                <p className="profile-role">
                  {profilePriest.designation} · {profilePriest.department}
                </p>
                <span
                  className={`pill ${PILL_CLASS[profilePriest.availability] || "grey"}`}
                >
                  {profilePriest.availability}
                </span>
              </div>
            </div>

            <div className="profile-grid">
              <div className="profile-row">
                <span className="k">Age</span>
                <span className="v">{calcAge(profilePriest.dob)} years</span>
              </div>
              <div className="profile-row">
                <span className="k">Date of Birth</span>
                <span className="v">{formatDate(profilePriest.dob)}</span>
              </div>
              <div className="profile-row">
                <span className="k">Gender</span>
                <span className="v">{profilePriest.gender}</span>
              </div>
              <div className="profile-row">
                <span className="k">Contact Number</span>
                <span className="v">{profilePriest.contact || "—"}</span>
              </div>
              <div className="profile-row full">
                <span className="k">Address</span>
                <span className="v">{profilePriest.address}</span>
              </div>
              <div className="profile-row">
                <span className="k">Specialization</span>
                <span className="v">{profilePriest.specialization || "—"}</span>
              </div>
              <div className="profile-row">
                <span className="k">Qualification</span>
                <span className="v">{profilePriest.qualification || "—"}</span>
              </div>
              <div className="profile-row">
                <span className="k">Joined Temple On</span>
                <span className="v">{formatDate(profilePriest.joinedOn)}</span>
              </div>
              <div className="profile-row">
                <span className="k">Years of Experience</span>
                <span className="v">{profilePriest.experience || "—"}</span>
              </div>
              <div className="profile-row">
                <span className="k">Shift</span>
                <span className="v">{profilePriest.shift}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Add priest modal ---------- */}
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
            <h3 className="modal-title">Add Priest</h3>
            <form onSubmit={handleAddPriest}>
              <div className="avatar-upload">
                {form.photo ? (
                  <img
                    src={form.photo}
                    alt="Preview"
                    className="avatar-upload-preview"
                  />
                ) : (
                  <div className="avatar-upload-preview avatar-upload-placeholder">
                    Photo
                  </div>
                )}
                <label className="btn-secondary avatar-upload-btn">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    hidden
                  />
                </label>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label>Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => updateForm("gender", e.target.value)}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => updateForm("dob", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    value={form.contact}
                    onChange={(e) => updateForm("contact", e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="field">
                  <label>Designation</label>
                  <select
                    value={form.designation}
                    onChange={(e) => updateForm("designation", e.target.value)}
                  >
                    {DESIGNATIONS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => updateForm("department", e.target.value)}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Specialization</label>
                  <input
                    value={form.specialization}
                    onChange={(e) =>
                      updateForm("specialization", e.target.value)
                    }
                    placeholder="e.g. Abhishekam, Homam"
                  />
                </div>
                <div className="field">
                  <label>Qualification</label>
                  <input
                    value={form.qualification}
                    onChange={(e) =>
                      updateForm("qualification", e.target.value)
                    }
                    placeholder="e.g. Agama Sastra Diploma"
                  />
                </div>
                <div className="field">
                  <label>Joined Temple On</label>
                  <input
                    type="date"
                    value={form.joinedOn}
                    onChange={(e) => updateForm("joinedOn", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Years of Experience</label>
                  <input
                    value={form.experience}
                    onChange={(e) => updateForm("experience", e.target.value)}
                    placeholder="e.g. 5 years"
                  />
                </div>
                <div className="field">
                  <label>Shift</label>
                  <select
                    value={form.shift}
                    onChange={(e) => updateForm("shift", e.target.value)}
                  >
                    {SHIFTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Availability</label>
                  <select
                    value={form.availability}
                    onChange={(e) => updateForm("availability", e.target.value)}
                  >
                    {AVAILABILITY.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div className="field field-full">
                  <label>Address *</label>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                    required
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
                  Save Priest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Edit priest modal ---------- */}
      {editPriest && (
        <div className="modal-overlay" onClick={() => setEditPriest(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setEditPriest(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="modal-title">Edit Priest Details</h3>
            <form onSubmit={handleEditPriest}>
              <div className="form-grid">
                <div className="field">
                  <label>Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => updateForm("gender", e.target.value)}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => updateForm("dob", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    value={form.contact}
                    onChange={(e) => updateForm("contact", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Designation</label>
                  <select
                    value={form.designation}
                    onChange={(e) => updateForm("designation", e.target.value)}
                  >
                    {DESIGNATIONS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => updateForm("department", e.target.value)}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Specialization</label>
                  <input
                    value={form.specialization}
                    onChange={(e) => updateForm("specialization", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Qualification</label>
                  <input
                    value={form.qualification}
                    onChange={(e) => updateForm("qualification", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Shift</label>
                  <select
                    value={form.shift}
                    onChange={(e) => updateForm("shift", e.target.value)}
                  >
                    {SHIFTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Availability</label>
                  <select
                    value={form.availability}
                    onChange={(e) => updateForm("availability", e.target.value)}
                  >
                    {AVAILABILITY.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div className="field field-full">
                  <label>Address</label>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditPriest(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Priest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Delete confirmation modal ---------- */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div
            className="modal-card confirm-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={cancelDelete}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="modal-title">Remove Priest</h3>
            <p className="muted">
              Are you sure you want to remove{" "}
              <strong>{deleteTarget.name}</strong> from the priest records? This
              action cannot be undone.
            </p>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDelete}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
