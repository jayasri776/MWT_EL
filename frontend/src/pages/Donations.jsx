import { useState, useEffect, useCallback } from "react";
import Pagination from "../components/Pagination";
import { useLanguage } from "../context/LanguageContext";
import { db } from "../services/db";

const INITIAL_DONATIONS = [
  {
    id: 1,
    devotee: "Sundaram Iyer",
    purpose: "Annadhanam",
    type: "Online",
    category: "Online",
    date: "08 Aug",
    amount: "₹5,000",
    receipt: "RCT-88213",
  },
  {
    id: 2,
    devotee: "Lakshmi Narayanan",
    purpose: "General",
    type: "Cash",
    category: "Cash",
    date: "08 Aug",
    amount: "₹1,100",
    receipt: "RCT-88214",
  },
  {
    id: 3,
    devotee: "Anand Traders",
    purpose: "Annadhanam",
    type: "Kind",
    category: "Kind",
    date: "07 Aug",
    amount: "₹3,200",
    receipt: "RCT-88215",
  },
  {
    id: 4,
    devotee: "Kalpana Ramesh",
    purpose: "Renovation",
    type: "Online",
    category: "Online",
    date: "07 Aug",
    amount: "₹25,000",
    receipt: "RCT-88216",
  },
  {
    id: 5,
    devotee: "Venkatesh Prasad",
    purpose: "General",
    type: "UPI",
    category: "Online",
    date: "06 Aug",
    amount: "₹501",
    receipt: "RCT-88217",
  },
];

const INITIAL_SPONSORSHIPS = [
  {
    id: 1,
    sponsor: "Rajaraman Family",
    activity: "Ganapathy Homam — Daily",
    amount: "₹1,500",
    status: "Paid",
    name: "Rajaraman Family",
    phone: "+91 98401 30011",
    email: "rajaraman.family@example.com",
    address:
      "21, East Car Street, Tiruchendur, Thoothukudi District, Tamil Nadu",
  },
  {
    id: 2,
    sponsor: "Priya Textiles (Org)",
    activity: "Kandha Sashti Utsavam Kalasam",
    amount: "₹15,000",
    status: "Pending",
    name: "Priya Textiles (Org) — contact: Priya Ramachandran",
    phone: "+91 98402 30022",
    email: "accounts@priyatextiles.example.com",
    address:
      "Shop No. 4, Market Road, Tiruchendur, Thoothukudi District, Tamil Nadu",
  },
];

const PURPOSE_BREAKDOWN = [
  { purpose: "Annadhanam", amount: "₹2.3L", pct: 48, color: "var(--sindoor)" },
  { purpose: "General", amount: "₹1.4L", pct: 30, color: "var(--teal)" },
  { purpose: "Renovation", amount: "₹1.0L", pct: 22, color: "var(--gold)" },
];

const TOTAL_COLLECTED = "₹4.7L";

const WEEKLY_GROWTH = [
  { week: "Week 1", amount: "₹0.9L", value: 90000 },
  { week: "Week 2", amount: "₹1.1L", value: 110000 },
  { week: "Week 3", amount: "₹1.3L", value: 130000 },
  { week: "Week 4", amount: "₹1.4L", value: 140000 },
];
const GROWTH_DESCRIPTION =
  "Donations have risen steadily through August, up 55% from Week 1 to Week 4.";

const EMPTY_DONATION_FORM = {
  devotee: "",
  purpose: "General",
  type: "Online",
  category: "Online",
  date: "",
  amount: "",
  receipt: "",
};

const EMPTY_SPONSOR_FORM = {
  sponsor: "",
  activity: "",
  amount: "",
  status: "Pending",
  phone: "",
  email: "",
  address: "",
};

function defaultNotifyMessage(eventName) {
  return `Dear {name}, we are happy to invite you to ${
    eventName ? eventName : "[Event Name]"
  } at Sri Subramania Swamy Temple, Tiruchendur. Thank you for your continued support as a temple sponsor. — Temple Administration`;
}

export default function Donations() {
  const { tr } = useLanguage();
  const [filter, setFilter] = useState("All");
  const [donations, setDonations] = useState([]);
  const [sponsorships, setSponsorships] = useState([]);

  // Pagination state for donations
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals for Donation CRUD
  const [addDonationOpen, setAddDonationOpen] = useState(false);
  const [viewDonation, setViewDonation] = useState(null);
  const [editDonation, setEditDonation] = useState(null);
  const [deleteDonationTarget, setDeleteDonationTarget] = useState(null);
  const [donationForm, setDonationForm] = useState(EMPTY_DONATION_FORM);

  // Modals for Sponsor CRUD
  const [addSponsorOpen, setAddSponsorOpen] = useState(false);
  const [viewSponsor, setViewSponsor] = useState(null);
  const [editSponsor, setEditSponsor] = useState(null);
  const [deleteSponsorTarget, setDeleteSponsorTarget] = useState(null);
  const [sponsorForm, setSponsorForm] = useState(EMPTY_SPONSOR_FORM);

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [notifyMessage, setNotifyMessage] = useState(defaultNotifyMessage(""));
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [toast, setToast] = useState("");

  const loadData = useCallback(async () => {
    const list = await db.getDonations();
    const mapped = (list || []).map((d) => ({
      id: d.id,
      devotee: d.donor_name || d.devotee || "Anonymous Devotee",
      purpose: d.category || d.purpose || "General",
      type: d.payment_mode || d.type || "Online",
      category: d.category || "Online",
      date: d.date ? String(d.date).slice(0, 10) : "08 Aug",
      amount: typeof d.amount === "number" ? `₹${d.amount.toLocaleString()}` : String(d.amount || "₹0"),
      receipt: d.receipt_no || d.receipt || `RCT-${Math.floor(1000 + Math.random() * 9000)}`,
    }));
    setDonations(mapped);

    const sponsorList = await db.getSponsorships();
    const mappedSponsors = (sponsorList || []).map((s) => ({
      id: s.id,
      sponsor: s.sponsor || s.name || "Sponsor",
      activity: s.activity || "—",
      amount: s.amount || "—",
      status: s.status || "Pending",
      name: s.name || s.sponsor || "Sponsor",
      phone: s.phone || "—",
      email: s.email || "—",
      address: s.address || "—",
    }));
    setSponsorships(mappedSponsors);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleDonations =
    filter === "All"
      ? donations
      : donations.filter((d) => d.category === filter || d.type === filter || d.purpose === filter);

  const paginatedDonations = visibleDonations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function flashToast(msg) {
    setToast(msg);
    window.clearTimeout(flashToast._t);
    flashToast._t = window.setTimeout(() => setToast(""), 3200);
  }

  // Donation handlers
  async function handleAddDonation(e) {
    e.preventDefault();
    if (!donationForm.devotee.trim()) {
      flashToast("Please fill in devotee name");
      return;
    }
    const receiptNo = donationForm.receipt.trim() || `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const numAmount = parseFloat(donationForm.amount.replace(/[^0-9.]/g, "")) || 1000;
    const newDonation = {
      donor_name: donationForm.devotee.trim(),
      devotee: donationForm.devotee.trim(),
      amount: numAmount,
      category: donationForm.purpose || "General",
      purpose: donationForm.purpose || "General",
      date: donationForm.date.trim() || new Date().toISOString().slice(0, 10),
      payment_mode: donationForm.type || "UPI",
      receipt_no: receiptNo,
      receipt: receiptNo,
      status: "Completed",
    };
    await db.addDonation(newDonation);
    setAddDonationOpen(false);
    flashToast(`Donation of ₹${numAmount} recorded`);
    loadData();
  }

  async function handleEditDonation(e) {
    e.preventDefault();
    if (!editDonation) return;
    const numAmount = parseFloat(donationForm.amount.replace(/[^0-9.]/g, "")) || 1000;
    const updated = {
      donor_name: donationForm.devotee.trim(),
      devotee: donationForm.devotee.trim(),
      amount: numAmount,
      category: donationForm.purpose,
      purpose: donationForm.purpose,
      date: donationForm.date.trim(),
      payment_mode: donationForm.type,
      receipt_no: donationForm.receipt.trim(),
    };
    await db.updateDonation(editDonation.id, updated);
    flashToast("Donation updated");
    setEditDonation(null);
    loadData();
  }

  async function confirmDeleteDonation() {
    if (!deleteDonationTarget) return;
    await db.deleteDonation(deleteDonationTarget.id);
    flashToast("Donation record removed");
    setDeleteDonationTarget(null);
    loadData();
  }

  // Sponsor handlers
  async function handleAddSponsor(e) {
    e.preventDefault();
    if (!sponsorForm.sponsor.trim() || !sponsorForm.phone.trim()) {
      flashToast("Please fill in the sponsor's name and phone number");
      return;
    }
    const newSponsor = {
      sponsor: sponsorForm.sponsor.trim(),
      name: sponsorForm.sponsor.trim(),
      activity: sponsorForm.activity.trim() || "—",
      amount: sponsorForm.amount.trim() || "—",
      status: sponsorForm.status,
      phone: sponsorForm.phone.trim(),
      email: sponsorForm.email.trim() || "—",
      address: sponsorForm.address.trim() || "—",
    };
    await db.addSponsorship(newSponsor);
    setAddSponsorOpen(false);
    flashToast(`${newSponsor.sponsor} added as a sponsor`);
    loadData();
  }

  async function handleEditSponsor(e) {
    e.preventDefault();
    if (!editSponsor) return;
    const updated = {
      sponsor: sponsorForm.sponsor.trim(),
      name: sponsorForm.sponsor.trim(),
      activity: sponsorForm.activity.trim(),
      amount: sponsorForm.amount.trim(),
      status: sponsorForm.status,
      phone: sponsorForm.phone.trim(),
      email: sponsorForm.email.trim(),
      address: sponsorForm.address.trim(),
    };
    await db.updateSponsorship(editSponsor.id, updated);
    flashToast(`${sponsorForm.sponsor}'s details updated`);
    setEditSponsor(null);
    loadData();
  }

  async function confirmDeleteSponsor() {
    if (!deleteSponsorTarget) return;
    await db.deleteSponsorship(deleteSponsorTarget.id);
    flashToast(`${deleteSponsorTarget.sponsor} removed`);
    setDeleteSponsorTarget(null);
    loadData();
  }

  function openNotify() {
    setEventName("");
    setNotifyMessage(defaultNotifyMessage(""));
    setSelectedIds(new Set(sponsorships.map((s) => s.id)));
    setNotifyOpen(true);
  }

  function toggleRecipient(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleEventNameChange(value) {
    setEventName(value);
    setNotifyMessage((prev) => {
      const wasDefault =
        prev === defaultNotifyMessage(eventName) || prev.trim() === "";
      return wasDefault ? defaultNotifyMessage(value) : prev;
    });
  }

  function handleSendNotify(e) {
    e.preventDefault();
    const recipients = sponsorships.filter((s) => selectedIds.has(s.id));
    if (!eventName.trim()) {
      flashToast("Please enter the event or festival name");
      return;
    }
    if (recipients.length === 0) {
      flashToast("Select at least one sponsor to notify");
      return;
    }
    setNotifyOpen(false);
    flashToast(
      `Notified ${recipients.length} sponsor${recipients.length > 1 ? "s" : ""} about "${eventName.trim()}"`
    );
  }

  return (
    <div className="dash-grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
      <style>{`
        .recipient-list{
          max-height:180px;overflow-y:auto;border:1px solid var(--stone,#e6ddd2);
          border-radius:10px;margin:10px 0 16px;
        }
        .recipient-row{
          display:flex;align-items:center;gap:10px;padding:9px 12px;font-size:12.5px;
          border-bottom:1px dashed var(--stone,#e6ddd2);
        }
        .recipient-row:last-child{ border-bottom:none; }
        .recipient-row .rp-phone{ margin-left:auto;color:var(--ink-faint,#9a8b7c);font-size:11.5px; }
        .toolbar-actions{ display:flex; gap:8px; }
        .mini-toast{
          position:fixed;bottom:22px;right:22px;background:var(--ink,#2a1f17);color:#fff;
          padding:10px 16px;border-radius:10px;font-size:12.5px;box-shadow:0 8px 24px rgba(0,0,0,0.25);
          z-index:300;
        }
      `}</style>

      <div>
        <div className="table-toolbar">
          <div className="chip-row">
            {["All", "Cash", "Online", "Kind"].map((chip) => (
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
          <button className="btn-primary" onClick={() => { setDonationForm(EMPTY_DONATION_FORM); setAddDonationOpen(true); }}>
            {tr("+ Record Donation")}
          </button>
        </div>

        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>{tr("Devotee")}</th>
                <th>{tr("Purpose")}</th>
                <th>{tr("Type")}</th>
                <th>{tr("Date")}</th>
                <th>{tr("Amount")}</th>
                <th>{tr("Receipt")}</th>
                <th style={{ textAlign: "right" }}>{tr("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDonations.map((d) => (
                <tr key={d.id}>
                  <td className="cell-name">{tr(d.devotee)}</td>
                  <td>{tr(d.purpose)}</td>
                  <td>
                    <span className="pill grey">{tr(d.type)}</span>
                  </td>
                  <td className="mono">{d.date}</td>
                  <td className="mono">{d.amount}</td>
                  <td className="mono">{d.receipt}</td>
                  <td style={{ textAlign: "right" }}>
                    <div className="action-btn-group" style={{ justifyContent: "flex-end" }}>
                      <button
                        className="icon-action-btn view-btn"
                        title={tr("View Donation")}
                        aria-label={`View donation from ${d.devotee}`}
                        onClick={() => setViewDonation(d)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        className="icon-action-btn edit-btn"
                        title="Edit Donation"
                        aria-label={`Edit donation from ${d.devotee}`}
                        onClick={() => {
                          setEditDonation(d);
                          setDonationForm({
                            devotee: d.devotee,
                            purpose: d.purpose,
                            type: d.type,
                            category: d.category,
                            date: d.date,
                            amount: d.amount.replace("₹", ""),
                            receipt: d.receipt,
                          });
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="icon-action-btn delete-btn"
                        title="Delete Donation"
                        aria-label={`Delete donation from ${d.devotee}`}
                        onClick={() => setDeleteDonationTarget(d)}
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
              {visibleDonations.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted" style={{ padding: 20 }}>
                    No {filter.toLowerCase()} donations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalItems={visibleDonations.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Pooja Sponsorships</h3>
            <div className="toolbar-actions">
              <button className="btn-ghost" onClick={openNotify}>
                🔔 Notify Sponsors
              </button>
              <button className="btn-ghost" onClick={() => { setSponsorForm(EMPTY_SPONSOR_FORM); setAddSponsorOpen(true); }}>
                + New Sponsor
              </button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Sponsor</th>
                <th>Activity</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sponsorships.map((s) => (
                <tr key={s.id}>
                  <td className="cell-name">{s.sponsor}</td>
                  <td>{s.activity}</td>
                  <td className="mono">{s.amount}</td>
                  <td>
                    <span
                      className={`pill ${s.status === "Paid" ? "green" : "amber"}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="action-btn-group" style={{ justifyContent: "flex-end" }}>
                      <button
                        className="icon-action-btn view-btn"
                        title="View Sponsor Details"
                        aria-label={`View ${s.sponsor}'s details`}
                        onClick={() => setViewSponsor(s)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        className="icon-action-btn edit-btn"
                        title="Edit Sponsor"
                        aria-label={`Edit ${s.sponsor}`}
                        onClick={() => {
                          setEditSponsor(s);
                          setSponsorForm({
                            sponsor: s.sponsor,
                            activity: s.activity,
                            amount: s.amount,
                            status: s.status,
                            phone: s.phone || "",
                            email: s.email || "",
                            address: s.address || "",
                          });
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="icon-action-btn delete-btn"
                        title="Delete Sponsor"
                        aria-label={`Delete ${s.sponsor}`}
                        onClick={() => setDeleteSponsorTarget(s)}
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
        </div>
      </div>

      <div>
        <div className="panel">
          <div className="panel-head">
            <h3>Purpose Breakdown — Aug</h3>
          </div>
          <div className="panel-body">
            <div className="temple-fact-row" style={{ marginBottom: 6 }}>
              <span className="k">Total collected this month</span>
              <span className="v">{TOTAL_COLLECTED}</span>
            </div>
            {PURPOSE_BREAKDOWN.map((p) => (
              <div className="bar-row" key={p.purpose}>
                <div className="bar-label">{p.purpose}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${p.pct}%`, background: p.color }}
                  ></div>
                </div>
                <div className="bar-val">{p.amount}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>This Month's Growth</h3>
          </div>
          <div className="panel-body">
            <p
              className="muted"
              style={{ fontSize: 12, marginTop: 0, marginBottom: 16 }}
            >
              {GROWTH_DESCRIPTION}
            </p>
            <div className="growth-chart">
              {WEEKLY_GROWTH.map((w) => {
                const maxValue = Math.max(...WEEKLY_GROWTH.map((x) => x.value));
                const heightPct = (w.value / maxValue) * 100;
                return (
                  <div className="growth-bar-col" key={w.week}>
                    <span className="growth-bar-amount">{w.amount}</span>
                    <div
                      className="growth-bar"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                    <span className="growth-bar-label">{w.week}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- View Donation Modal ---------- */}
      {viewDonation && (
        <div className="modal-overlay" onClick={() => setViewDonation(null)}>
          <div className="modal-card profile-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewDonation(null)} aria-label="Close">
              ✕
            </button>
            <h3 className="modal-title" style={{ marginBottom: 14 }}>Donation Details</h3>
            <div className="profile-grid" style={{ borderTop: "none" }}>
              <div className="profile-row full">
                <span className="k">Devotee Name</span>
                <span className="v">{viewDonation.devotee}</span>
              </div>
              <div className="profile-row">
                <span className="k">Purpose</span>
                <span className="v">{viewDonation.purpose}</span>
              </div>
              <div className="profile-row">
                <span className="k">Payment Mode / Type</span>
                <span className="v">{viewDonation.type}</span>
              </div>
              <div className="profile-row">
                <span className="k">Amount</span>
                <span className="v">{viewDonation.amount}</span>
              </div>
              <div className="profile-row">
                <span className="k">Receipt Number</span>
                <span className="v">{viewDonation.receipt}</span>
              </div>
              <div className="profile-row">
                <span className="k">Date</span>
                <span className="v">{viewDonation.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Add Donation Modal ---------- */}
      {addDonationOpen && (
        <div className="modal-overlay" onClick={() => setAddDonationOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setAddDonationOpen(false)} aria-label="Close">
              ✕
            </button>
            <h3 className="modal-title">Record New Donation</h3>
            <form onSubmit={handleAddDonation}>
              <div className="form-grid">
                <div className="field">
                  <label>Devotee Name *</label>
                  <input
                    value={donationForm.devotee}
                    onChange={(e) => setDonationForm({ ...donationForm, devotee: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Amount (₹) *</label>
                  <input
                    value={donationForm.amount}
                    onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                    placeholder="e.g. 5000"
                    required
                  />
                </div>
                <div className="field">
                  <label>Purpose</label>
                  <select
                    value={donationForm.purpose}
                    onChange={(e) => setDonationForm({ ...donationForm, purpose: e.target.value })}
                  >
                    <option>Annadhanam</option>
                    <option>General</option>
                    <option>Renovation</option>
                    <option>Daily Pooja</option>
                    <option>Kumbhabhishekam</option>
                  </select>
                </div>
                <div className="field">
                  <label>Payment Type</label>
                  <select
                    value={donationForm.type}
                    onChange={(e) => setDonationForm({ ...donationForm, type: e.target.value })}
                  >
                    <option>Online</option>
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Kind</option>
                    <option>Cheque</option>
                  </select>
                </div>
                <div className="field">
                  <label>Date</label>
                  <input
                    value={donationForm.date}
                    onChange={(e) => setDonationForm({ ...donationForm, date: e.target.value })}
                    placeholder="e.g. 08 Aug"
                  />
                </div>
                <div className="field">
                  <label>Receipt Number</label>
                  <input
                    value={donationForm.receipt}
                    onChange={(e) => setDonationForm({ ...donationForm, receipt: e.target.value })}
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setAddDonationOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Edit Donation Modal ---------- */}
      {editDonation && (
        <div className="modal-overlay" onClick={() => setEditDonation(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditDonation(null)} aria-label="Close">
              ✕
            </button>
            <h3 className="modal-title">Edit Donation Details</h3>
            <form onSubmit={handleEditDonation}>
              <div className="form-grid">
                <div className="field">
                  <label>Devotee Name *</label>
                  <input
                    value={donationForm.devotee}
                    onChange={(e) => setDonationForm({ ...donationForm, devotee: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Amount *</label>
                  <input
                    value={donationForm.amount}
                    onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Purpose</label>
                  <select
                    value={donationForm.purpose}
                    onChange={(e) => setDonationForm({ ...donationForm, purpose: e.target.value })}
                  >
                    <option>Annadhanam</option>
                    <option>General</option>
                    <option>Renovation</option>
                    <option>Daily Pooja</option>
                    <option>Kumbhabhishekam</option>
                  </select>
                </div>
                <div className="field">
                  <label>Payment Type</label>
                  <select
                    value={donationForm.type}
                    onChange={(e) => setDonationForm({ ...donationForm, type: e.target.value })}
                  >
                    <option>Online</option>
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Kind</option>
                    <option>Cheque</option>
                  </select>
                </div>
                <div className="field">
                  <label>Date</label>
                  <input
                    value={donationForm.date}
                    onChange={(e) => setDonationForm({ ...donationForm, date: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Receipt Number</label>
                  <input
                    value={donationForm.receipt}
                    onChange={(e) => setDonationForm({ ...donationForm, receipt: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditDonation(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Delete Donation Modal ---------- */}
      {deleteDonationTarget && (
        <div className="modal-overlay" onClick={() => setDeleteDonationTarget(null)}>
          <div className="modal-card confirm-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDeleteDonationTarget(null)} aria-label="Close">
              ✕
            </button>
            <h3 className="modal-title">Delete Donation</h3>
            <p className="muted">
              Are you sure you want to remove donation record from <strong>{deleteDonationTarget.devotee}</strong> ({deleteDonationTarget.receipt})?
            </p>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteDonationTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteDonation}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- View Sponsor Modal ---------- */}
      {viewSponsor && (
        <div className="modal-overlay" onClick={() => setViewSponsor(null)}>
          <div className="modal-card profile-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewSponsor(null)} aria-label="Close">
              ✕
            </button>
            <h3 className="modal-title" style={{ marginBottom: 14 }}>Sponsor Details</h3>
            <div className="profile-grid" style={{ borderTop: "none" }}>
              <div className="profile-row full">
                <span className="k">Sponsor Name</span>
                <span className="v">{viewSponsor.name || viewSponsor.sponsor}</span>
              </div>
              <div className="profile-row">
                <span className="k">Phone Number</span>
                <span className="v">{viewSponsor.phone}</span>
              </div>
              <div className="profile-row">
                <span className="k">Email</span>
                <span className="v">{viewSponsor.email}</span>
              </div>
              <div className="profile-row full">
                <span className="k">Address</span>
                <span className="v">{viewSponsor.address}</span>
              </div>
              <div className="profile-row">
                <span className="k">Sponsored Activity</span>
                <span className="v">{viewSponsor.activity}</span>
              </div>
              <div className="profile-row">
                <span className="k">Amount</span>
                <span className="v">{viewSponsor.amount}</span>
              </div>
              <div className="profile-row">
                <span className="k">Status</span>
                <span className={`pill ${viewSponsor.status === "Paid" ? "green" : "amber"}`}>{viewSponsor.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Add Sponsorship Modal ---------- */}
      {addSponsorOpen && (
        <div className="modal-overlay" onClick={() => setAddSponsorOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setAddSponsorOpen(false)} aria-label="Close">
              ✕
            </button>
            <h3 className="modal-title">Add Pooja Sponsorship</h3>
            <form onSubmit={handleAddSponsor}>
              <div className="form-grid">
                <div className="field">
                  <label>Sponsor Name *</label>
                  <input
                    value={sponsorForm.sponsor}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, sponsor: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={sponsorForm.phone}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
                <div className="field">
                  <label>Sponsored Activity</label>
                  <input
                    value={sponsorForm.activity}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, activity: e.target.value })}
                    placeholder="e.g. Ganapathy Homam — Daily"
                  />
                </div>
                <div className="field">
                  <label>Amount</label>
                  <input
                    value={sponsorForm.amount}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, amount: e.target.value })}
                    placeholder="e.g. ₹5,000"
                  />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={sponsorForm.status}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, status: e.target.value })}
                  >
                    <option>Paid</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={sponsorForm.email}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, email: e.target.value })}
                  />
                </div>
                <div className="field field-full">
                  <label>Address</label>
                  <textarea
                    rows={2}
                    value={sponsorForm.address}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setAddSponsorOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Sponsorship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Edit Sponsor Modal ---------- */}
      {editSponsor && (
        <div className="modal-overlay" onClick={() => setEditSponsor(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditSponsor(null)} aria-label="Close">
              ✕
            </button>
            <h3 className="modal-title">Edit Sponsor Details</h3>
            <form onSubmit={handleEditSponsor}>
              <div className="form-grid">
                <div className="field">
                  <label>Sponsor Name *</label>
                  <input
                    value={sponsorForm.sponsor}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, sponsor: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={sponsorForm.phone}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Sponsored Activity</label>
                  <input
                    value={sponsorForm.activity}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, activity: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Amount</label>
                  <input
                    value={sponsorForm.amount}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, amount: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={sponsorForm.status}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, status: e.target.value })}
                  >
                    <option>Paid</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={sponsorForm.email}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, email: e.target.value })}
                  />
                </div>
                <div className="field field-full">
                  <label>Address</label>
                  <textarea
                    rows={2}
                    value={sponsorForm.address}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditSponsor(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Sponsor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Delete Sponsor Modal ---------- */}
      {deleteSponsorTarget && (
        <div className="modal-overlay" onClick={() => setDeleteSponsorTarget(null)}>
          <div className="modal-card confirm-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDeleteSponsorTarget(null)} aria-label="Close">
              ✕
            </button>
            <h3 className="modal-title">Delete Sponsor</h3>
            <p className="muted">
              Are you sure you want to remove <strong>{deleteSponsorTarget.sponsor}</strong> from sponsorships?
            </p>
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteSponsorTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteSponsor}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Notify sponsors modal ---------- */}
      {notifyOpen && (
        <div className="modal-overlay" onClick={() => setNotifyOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setNotifyOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="modal-title">Notify Sponsors about an Event</h3>
            <form onSubmit={handleSendNotify}>
              <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div className="field">
                  <label>Festival / Event Name *</label>
                  <input
                    value={eventName}
                    onChange={(e) => handleEventNameChange(e.target.value)}
                    placeholder="e.g. Skanda Sashti 2026"
                    required
                  />
                </div>
                <div className="field">
                  <label>
                    Message ({"{name}"} is replaced with each sponsor's name)
                  </label>
                  <textarea
                    rows={4}
                    value={notifyMessage}
                    onChange={(e) => setNotifyMessage(e.target.value)}
                  />
                </div>
              </div>

              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-soft, #6b5c50)",
                }}
              >
                Send to
              </label>
              <div className="recipient-list">
                {sponsorships.map((s) => (
                  <label className="recipient-row" key={s.id}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s.id)}
                      onChange={() => toggleRecipient(s.id)}
                    />
                    <span>{s.sponsor}</span>
                    <span className="rp-phone">{s.phone}</span>
                  </label>
                ))}
                {sponsorships.length === 0 && (
                  <div className="recipient-row">
                    <span className="muted">No sponsors yet.</span>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setNotifyOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="mini-toast">{toast}</div>}
    </div>
  );
}
