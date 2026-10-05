import { useState, useEffect, useCallback } from "react";
import { useToast } from "../context/ToastContext";
import Pagination from "../components/Pagination";
import { useLanguage } from "../context/LanguageContext";
import { db } from "../services/db";

const CATEGORIES = [
  "Pooja Essentials",
  "Kitchen Items",
  "Pooja Utensils",
  "Cleaning Materials",
  "Decoration Materials",
];

const UNITS = [
  "pcs",
  "Kg",
  "Liters",
  "g",
  "litre",
  "ml",
  "box",
  "packet",
  "roll",
  "Pieces",
];
const CARD_TOP_CLASSES = ["", "gold", "sindoor"];

const VENDOR_DATABASE = {
  "Pure Cow Ghee": [
    {
      name: "Aavin Temple Wholesale Depot",
      pricePerUnit: 465,
      unit: "Liter",
      leadTime: "2 Days",
      rating: 4.9,
      purityTag: "Government Dairy Board Certified",
      isBestValue: true,
      minOrder: 10,
    },
    {
      name: "Sri Lakshmi Dairy",
      pricePerUnit: 520,
      unit: "Liter",
      leadTime: "1 Day",
      rating: 4.8,
      purityTag: "100% Pure Cow Ghee",
      isBestValue: false,
      minOrder: 5,
    },
    {
      name: "Tiruchendur Organic Ghee Supplies",
      pricePerUnit: 490,
      unit: "Liter",
      leadTime: "1 Day",
      rating: 4.7,
      purityTag: "Vedic Bilona Ghee",
      isBestValue: false,
      minOrder: 5,
    },
  ],
  "Camphor (Karpuram)": [
    {
      name: "Bhimseni Pure Camphor Depot",
      pricePerUnit: 340,
      unit: "Kg",
      leadTime: "1 Day",
      rating: 4.9,
      purityTag: "100% Refined Bhimseni Grade",
      isBestValue: true,
      minOrder: 5,
    },
    {
      name: "Sri Balaji Traders",
      pricePerUnit: 380,
      unit: "Kg",
      leadTime: "2 Days",
      rating: 4.7,
      purityTag: "Temple Deepam Quality",
      isBestValue: false,
      minOrder: 2,
    },
    {
      name: "Tirupati Pooja Store",
      pricePerUnit: 365,
      unit: "Kg",
      leadTime: "3 Days",
      rating: 4.5,
      purityTag: "Standard Camphor",
      isBestValue: false,
      minOrder: 5,
    },
  ],
  "Sandalwood Paste": [
    {
      name: "Tamil Nadu Forest Craft Depot",
      pricePerUnit: 1650,
      unit: "Kg",
      leadTime: "2 Days",
      rating: 4.8,
      purityTag: "Agmark Grade A Chandanam",
      isBestValue: true,
      minOrder: 2,
    },
    {
      name: "Mysore Sandal Depot",
      pricePerUnit: 1850,
      unit: "Kg",
      leadTime: "3 Days",
      rating: 4.9,
      purityTag: "Pure Mysore Sandalwood",
      isBestValue: false,
      minOrder: 1,
    },
  ],
  "Raw Rice (Annadhanam)": [
    {
      name: "Tanjore Rice Traders",
      pricePerUnit: 52,
      unit: "Kg",
      leadTime: "1 Day",
      rating: 4.8,
      purityTag: "Sona Masuri Aged Rice",
      isBestValue: true,
      minOrder: 50,
    },
    {
      name: "Cauvery Grain Mills",
      pricePerUnit: 56,
      unit: "Kg",
      leadTime: "2 Days",
      rating: 4.7,
      purityTag: "Premium Ponni Rice",
      isBestValue: false,
      minOrder: 50,
    },
  ],
  Jaggery: [
    {
      name: "Erode Organic Jaggery Depot",
      pricePerUnit: 58,
      unit: "Kg",
      leadTime: "2 Days",
      rating: 4.9,
      purityTag: "Chemical-free Nattu Sakkarai",
      isBestValue: true,
      minOrder: 10,
    },
    {
      name: "Local Wholesale Market",
      pricePerUnit: 65,
      unit: "Kg",
      leadTime: "1 Day",
      rating: 4.6,
      purityTag: "Standard Temple Prasadam Grade",
      isBestValue: false,
      minOrder: 10,
    },
  ],
  "Brass Oil Lamps (Dheepam)": [
    {
      name: "Swamimalai Metal Artisans",
      pricePerUnit: 390,
      unit: "Piece",
      leadTime: "3 Days",
      rating: 4.8,
      purityTag: "Heavy Brass Traditional Cast",
      isBestValue: true,
      minOrder: 5,
    },
    {
      name: "Kumbakonam Brass Works",
      pricePerUnit: 420,
      unit: "Piece",
      leadTime: "2 Days",
      rating: 4.9,
      purityTag: "Polished Temple Brassware",
      isBestValue: false,
      minOrder: 2,
    },
  ],
};

const INITIAL_ITEMS = [
  {
    id: 1,
    name: "Pure Cow Ghee",
    category: "Pooja Essentials",
    quantity: 45,
    unit: "Liters",
    reorderLevel: 10,
    supplier: "Sri Lakshmi Dairy",
    lastUpdated: "2026-08-20",
    notes: "Daily Abhishekam & Pooja",
    batchNo: "BATCH-2026-08A",
    expiryDate: "2026-12-15",
    purityTag: "Agmark Grade A Organic",
  },
  {
    id: 2,
    name: "Camphor (Karpuram)",
    category: "Pooja Essentials",
    quantity: 12,
    unit: "Kg",
    reorderLevel: 5,
    supplier: "Sri Balaji Traders",
    lastUpdated: "2026-08-20",
    notes: "Used daily for Deepa Aradhana",
    batchNo: "BATCH-2026-08B",
    expiryDate: "2027-08-01",
    purityTag: "Refined Bhimseni Grade",
  },
  {
    id: 3,
    name: "Sandalwood Paste",
    category: "Pooja Essentials",
    quantity: 8,
    unit: "Kg",
    reorderLevel: 10,
    supplier: "Mysore Sandal Depot",
    lastUpdated: "2026-08-18",
    notes: "For Alankaram & Abhishekam",
    batchNo: "BATCH-2026-07C",
    expiryDate: "2026-10-10",
    purityTag: "Pure Mysore Sandalwood",
  },
  {
    id: 4,
    name: "Raw Rice (Annadhanam)",
    category: "Kitchen Items",
    quantity: 450,
    unit: "Kg",
    reorderLevel: 100,
    supplier: "Tanjore Rice Traders",
    lastUpdated: "2026-08-25",
    notes: "For Daily Annadhanam",
    batchNo: "BATCH-2026-08D",
    expiryDate: "2027-02-28",
    purityTag: "Aged Sona Masuri Rice",
  },
  {
    id: 5,
    name: "Jaggery",
    category: "Kitchen Items",
    quantity: 85,
    unit: "Kg",
    reorderLevel: 20,
    supplier: "Local Wholesale Market",
    lastUpdated: "2026-09-01",
    notes: "For Prasadam Preparation",
    batchNo: "BATCH-2026-08E",
    expiryDate: "2026-11-30",
    purityTag: "Chemical-free Organic",
  },
  {
    id: 6,
    name: "Brass Oil Lamps (Dheepam)",
    category: "Pooja Utensils",
    quantity: 30,
    unit: "Pieces",
    reorderLevel: 5,
    supplier: "Kumbakonam Brass Works",
    lastUpdated: "2026-08-10",
    notes: "Temple Deepam Rites",
    batchNo: "BATCH-2026-05F",
    expiryDate: "N/A",
    purityTag: "Heavy Cast Brassware",
  },
];

const EMPTY_FORM = {
  name: "",
  category: "Pooja Essentials",
  quantity: "",
  unit: "Kg",
  reorderLevel: "",
  supplier: "",
  notes: "",
  batchNo: "",
  expiryDate: "",
  purityTag: "",
};

function formatDate(value) {
  if (!value || value === "N/A") return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getExpiryStatus(expiryDate) {
  if (!expiryDate || expiryDate === "N/A")
    return { label: "Non-perishable", class: "grey" };
  const today = new Date();
  const exp = new Date(expiryDate);
  const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: "Expired", class: "red" };
  if (diffDays <= 30)
    return { label: `Expiring in ${diffDays} days`, class: "amber" };
  return { label: `Fresh (${diffDays} days left)`, class: "green" };
}

const STOCK_CLASS = (item) => {
  if (item.quantity <= item.reorderLevel) return "red";
  if (item.quantity <= item.reorderLevel * 2) return "amber";
  return "green";
};

const STOCK_LABEL = (item) => {
  if (item.quantity <= item.reorderLevel) return "Low Stock";
  if (item.quantity <= item.reorderLevel * 2) return "Reorder Soon";
  return "In Stock";
};

export default function Inventory() {
  const { showToast } = useToast();
  const { tr } = useLanguage();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [compareItem, setCompareItem] = useState(null);
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [showPredictor, setShowPredictor] = useState(true);

  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    const list = await db.getInventory();
    const mapped = (list || []).map((it) => ({
      ...it,
      name: it.name || it.item_name || "Item",
      category: it.category || "Pooja Essentials",
      quantity: Number(it.quantity) || 0,
      unit: it.unit || "Kg",
      reorderLevel: it.reorderLevel !== undefined ? Number(it.reorderLevel) : 10,
    }));
    setItems(mapped);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visible =
    filter === "All" ? items : items.filter((it) => it.category === filter);

  const paginatedVisible = visible.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const reorderItems = items.filter((it) => it.quantity <= (it.reorderLevel !== undefined ? it.reorderLevel : 10));
  const expiringItems = items.filter((it) => {
    if (!it.expiryDate || it.expiryDate === "N/A") return false;
    const today = new Date();
    const exp = new Date(it.expiryDate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  });

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const openAddForm = () => {
    setForm({
      ...EMPTY_FORM,
      category: filter === "All" ? "Pooja Essentials" : filter,
    });
    setAddOpen(true);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Please fill in item name");
      return;
    }
    const newItem = {
      item_name: form.name.trim(),
      name: form.name.trim(),
      category: form.category,
      quantity: Number(form.quantity || 0),
      unit: form.unit || "Kg",
      reorderLevel: form.reorderLevel === "" ? 10 : Number(form.reorderLevel),
      supplier: form.supplier.trim() || "Local Vendor",
      lastUpdated: new Date().toISOString().slice(0, 10),
      notes: form.notes.trim(),
      batchNo:
        form.batchNo.trim() ||
        `BATCH-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
      expiryDate: form.expiryDate || "N/A",
      purityTag: form.purityTag.trim() || "Standard Quality",
      status: Number(form.quantity || 0) <= 10 ? "Low Stock" : "In Stock",
    };
    await db.addInventory(newItem);
    setAddOpen(false);
    showToast(`${newItem.name} has been added to inventory`);
    loadData();
  };

  const openEditForm = (item) => {
    setEditItem(item);
    setForm({
      name: item.name || item.item_name || "",
      category: item.category || "Pooja Essentials",
      quantity: item.quantity,
      unit: item.unit || "Kg",
      reorderLevel: item.reorderLevel !== undefined ? item.reorderLevel : 10,
      supplier: item.supplier || "",
      notes: item.notes || "",
      batchNo: item.batchNo || "",
      expiryDate: item.expiryDate || "",
      purityTag: item.purityTag || "",
    });
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    const updated = {
      item_name: form.name.trim(),
      name: form.name.trim(),
      category: form.category,
      quantity: Number(form.quantity || 0),
      unit: form.unit,
      reorderLevel: form.reorderLevel === "" ? 10 : Number(form.reorderLevel),
      supplier: form.supplier.trim(),
      lastUpdated: new Date().toISOString().slice(0, 10),
      notes: form.notes.trim(),
      batchNo: form.batchNo.trim(),
      expiryDate: form.expiryDate || "N/A",
      purityTag: form.purityTag.trim(),
      status: Number(form.quantity || 0) <= 10 ? "Low Stock" : "In Stock",
    };
    await db.updateInventory(editItem.id, updated);
    showToast(`${form.name} updated`);
    setEditItem(null);
    loadData();
  };

  const requestDelete = (item) => setDeleteTarget(item);
  const cancelDelete = () => setDeleteTarget(null);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await db.deleteInventory(deleteTarget.id);
    showToast(`${deleteTarget.name || deleteTarget.item_name} removed from inventory`);
    setDeleteTarget(null);
    loadData();
  };

  // Place Purchase Order with Best Seller
  const handlePlaceOrder = async (vendor, item) => {
    const addQty = vendor.minOrder || 10;
    const poNumber = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalCost = addQty * vendor.pricePerUnit;

    const newQty = (item.quantity || 0) + addQty;
    await db.updateInventory(item.id, {
      quantity: newQty,
      supplier: vendor.name,
      lastUpdated: new Date().toISOString().slice(0, 10),
      status: newQty <= (item.reorderLevel || 10) ? "Low Stock" : "In Stock",
    });

    setOrderReceipt({
      poNumber,
      item: item.name,
      category: item.category,
      unit: item.unit,
      quantity: addQty,
      pricePerUnit: vendor.pricePerUnit,
      totalAmount: totalCost,
      supplier: vendor.name,
      purityTag: vendor.purityTag,
      leadTime: vendor.leadTime,
      date: new Date().toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });

    setCompareItem(null);
    showToast(`Purchase Order ${poNumber} placed with ${vendor.name}!`);
    loadData();
  };

  // Auto-Restock Shortages for Kandha Sashti
  const handleAutoRestockKandhaSashti = async () => {
    for (const it of items) {
      if (it.name === "Pure Cow Ghee") {
        await db.updateInventory(it.id, { quantity: 120, supplier: "Aavin Temple Wholesale Depot", status: "In Stock" });
      } else if (it.name === "Sandalwood Paste") {
        await db.updateInventory(it.id, { quantity: 25, supplier: "Tamil Nadu Forest Craft Depot", status: "In Stock" });
      } else if (it.name === "Camphor (Karpuram)") {
        await db.updateInventory(it.id, { quantity: 30, supplier: "Bhimseni Pure Camphor Depot", status: "In Stock" });
      } else if (it.name === "Raw Rice (Annadhanam)") {
        await db.updateInventory(it.id, { quantity: 1000, supplier: "Tanjore Rice Traders", status: "In Stock" });
      }
    }
    showToast(
      "Auto-restock order placed for Kandha Sashti Utsavam! Shortages fulfilled.",
    );
    loadData();
  };

  return (
    <div>
      {/* ---------- Top Notifications: Reorder Alerts & Expiry Alerts ---------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* Card 1: Items Under Reorder Level */}
        <div
          className="panel"
          style={{
            margin: 0,
            borderLeft: "4px solid var(--sindoor, #900)",
            padding: "14px 18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 20 }}>📦</span>
            <h3
              style={{
                margin: 0,
                fontSize: 14,
                color: "var(--ink)",
                fontWeight: 700,
              }}
            >
              Items Requiring Reorder ({reorderItems.length})
            </h3>
          </div>
          {reorderItems.length === 0 ? (
            <p className="muted" style={{ margin: 0, fontSize: 12 }}>
              All inventory stock levels are optimal.
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {reorderItems.map((it) => (
                <div
                  key={it.id}
                  style={{
                    background: "rgba(192, 57, 43, 0.08)",
                    border: "1px solid rgba(192, 57, 43, 0.2)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 12,
                  }}
                >
                  <strong>{it.name}</strong>: {it.quantity} {it.unit}{" "}
                  <span
                    style={{ color: "var(--sindoor, #900)", fontWeight: 600 }}
                  >
                    (Reorder Level: {it.reorderLevel} {it.unit})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: Items Expiring Within 1 Month */}
        <div
          className="panel"
          style={{
            margin: 0,
            borderLeft: "4px solid var(--gold, #d4ac0d)",
            padding: "14px 18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 20 }}>⏳</span>
            <h3
              style={{
                margin: 0,
                fontSize: 14,
                color: "var(--ink)",
                fontWeight: 700,
              }}
            >
              Items Expiring Within 1 Month ({expiringItems.length})
            </h3>
          </div>
          {expiringItems.length === 0 ? (
            <p className="muted" style={{ margin: 0, fontSize: 12 }}>
              No items expiring within 30 days.
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {expiringItems.map((it) => (
                <div
                  key={it.id}
                  style={{
                    background: "rgba(212, 172, 13, 0.1)",
                    border: "1px solid rgba(212, 172, 13, 0.3)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 12,
                  }}
                >
                  <strong>{it.name}</strong>: Expires {it.expiryDate}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Table Toolbar ---------- */}
      <div className="table-toolbar">
        <div className="chip-row">
          <div
            className={`chip${filter === "All" ? " active" : ""}`}
            onClick={() => {
              setFilter("All");
              setCurrentPage(1);
            }}
          >
            {tr("All")}
          </div>
          {CATEGORIES.map((cat) => (
            <div
              key={cat}
              className={`chip${filter === cat ? " active" : ""}`}
              onClick={() => {
                setFilter(cat);
                setCurrentPage(1);
              }}
            >
              {tr(cat)}
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={openAddForm}>
          {tr("+ Add Item")}
        </button>
      </div>

      {/* ---------- Item Cards Grid ---------- */}
      <div className="card-grid">
        {paginatedVisible.map((item, i) => {
          const expStatus = getExpiryStatus(item.expiryDate);
          return (
            <div className="entity-card" key={item.id}>
              <div
                className={`entity-card-top ${CARD_TOP_CLASSES[i % CARD_TOP_CLASSES.length]}`}
              >
                <span className="ec-tag">{item.category}</span>
              </div>
              <div className="entity-body">
                <p className="entity-name">{item.name}</p>
                <p className="entity-role">
                  {item.quantity} {item.unit} available
                </p>

                {/* Feature 3: Batch No, Expiry & Purity Tag */}
                <div className="entity-meta-row">
                  <span>Purity / Grade</span>
                  <span
                    className="v"
                    style={{ color: "var(--teal)", fontWeight: 600 }}
                  >
                    {item.purityTag || "Temple Grade"}
                  </span>
                </div>
                <div className="entity-meta-row">
                  <span>Batch No</span>
                  <span className="v mono">
                    {item.batchNo || "BATCH-2026-08"}
                  </span>
                </div>
                <div className="entity-meta-row">
                  <span>Quality / Expiry</span>
                  <span className={`pill ${expStatus.class}`}>
                    {expStatus.label}
                  </span>
                </div>
                <div className="entity-meta-row">
                  <span>Reorder Level</span>
                  <span className="v">
                    {item.reorderLevel} {item.unit}
                  </span>
                </div>
                <div className="entity-meta-row">
                  <span>Current Supplier</span>
                  <span className="v">{item.supplier || "—"}</span>
                </div>
                <div className="entity-meta-row">
                  <span>Status</span>
                  <span className={`pill ${STOCK_CLASS(item)}`}>
                    {STOCK_LABEL(item)}
                  </span>
                </div>
                {item.notes && (
                  <div className="entity-meta-row">
                    <span>Notes</span>
                    <span className="v">{item.notes}</span>
                  </div>
                )}

                <div
                  className="entity-foot"
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* Feature 2: Compare Sellers Button */}
                  <button
                    className="btn-secondary"
                    style={{
                      fontSize: 11,
                      padding: "6px 10px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                    onClick={() => setCompareItem(item)}
                  >
                    <span>🛒 Best Seller</span>
                  </button>

                  {/* Standard CRUD Action Icons */}
                  <div className="action-btn-group">
                    <button
                      className="icon-action-btn view-btn"
                      title="View Details"
                      aria-label={`View ${item.name}`}
                      onClick={() => setViewItem(item)}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      className="icon-action-btn edit-btn"
                      title="Edit Item"
                      aria-label={`Edit ${item.name}`}
                      onClick={() => openEditForm(item)}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="icon-action-btn delete-btn"
                      title="Delete Item"
                      aria-label={`Delete ${item.name}`}
                      onClick={() => requestDelete(item)}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
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
          );
        })}
        {visible.length === 0 && (
          <p className="muted" style={{ padding: 20 }}>
            No items in this category.
          </p>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={visible.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[3, 6, 12, 24]}
      />

      {/* ---------- Feature 2: Vendor Price Comparison & Best Seller Finder Modal ---------- */}
      {compareItem && (
        <div className="modal-overlay" onClick={() => setCompareItem(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setCompareItem(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="modal-title" style={{ marginBottom: 4 }}>
              Compare Suppliers & Best Seller
            </h3>
            <p className="muted" style={{ fontSize: 12, marginBottom: 16 }}>
              Comparing registered suppliers for{" "}
              <strong>{compareItem.name}</strong> to highlight the most
              profitable and certified high-quality sellers.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(
                VENDOR_DATABASE[compareItem.name] || [
                  {
                    name: compareItem.supplier || "Local Wholesale Market",
                    pricePerUnit: 350,
                    unit: compareItem.unit,
                    leadTime: "1 Day",
                    rating: 4.8,
                    purityTag: compareItem.purityTag || "Temple Grade",
                    isBestValue: true,
                    minOrder: 10,
                  },
                  {
                    name: "Tamil Nadu Wholesale Depot",
                    pricePerUnit: 380,
                    unit: compareItem.unit,
                    leadTime: "2 Days",
                    rating: 4.6,
                    purityTag: "Standard Certified",
                    isBestValue: false,
                    minOrder: 10,
                  },
                ]
              ).map((vendor, idx) => (
                <div
                  key={idx}
                  style={{
                    background: vendor.isBestValue
                      ? "var(--teal-tint)"
                      : "var(--ivory)",
                    border: vendor.isBestValue
                      ? "1.5px solid var(--teal)"
                      : "1px solid var(--stone)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    position: "relative",
                  }}
                >
                  {vendor.isBestValue && (
                    <span
                      style={{
                        position: "absolute",
                        top: -10,
                        right: 14,
                        background: "var(--teal)",
                        color: "#fff",
                        fontSize: 9.5,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 10,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      ⭐ Best Value Seller
                    </span>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: "0 0 2px",
                          fontSize: 14,
                          color: "var(--ink)",
                        }}
                      >
                        {vendor.name}
                      </h4>
                      <p className="muted" style={{ margin: 0, fontSize: 11 }}>
                        {vendor.purityTag} · Delivery: {vendor.leadTime} ·
                        Rating: ⭐ {vendor.rating}/5
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        className="mono"
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "var(--sindoor)",
                        }}
                      >
                        ₹{vendor.pricePerUnit}
                      </span>
                      <span className="muted" style={{ fontSize: 10 }}>
                        {" "}
                        / {vendor.unit}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px dashed var(--stone)",
                      paddingTop: 10,
                    }}
                  >
                    <span className="muted" style={{ fontSize: 11 }}>
                      Min Order: {vendor.minOrder} {compareItem.unit}
                    </span>
                    {vendor.isBestValue && (
                      <span
                        className="pill green"
                        style={{ fontSize: 10.5, fontWeight: 600 }}
                      >
                        ✓ Recommended: Most Profitable & Certified Quality
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- View item modal ---------- */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div
            className="modal-card profile-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setViewItem(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="modal-title" style={{ marginBottom: 14 }}>
              Inventory Item Details
            </h3>
            <div className="profile-grid" style={{ borderTop: "none" }}>
              <div className="profile-row full">
                <span className="k">Item Name</span>
                <span className="v">{viewItem.name}</span>
              </div>
              <div className="profile-row">
                <span className="k">Category</span>
                <span className="v">{viewItem.category}</span>
              </div>
              <div className="profile-row">
                <span className="k">Stock Available</span>
                <span className="v">
                  {viewItem.quantity} {viewItem.unit}
                </span>
              </div>
              <div className="profile-row">
                <span className="k">Purity / Grade</span>
                <span className="v">
                  {viewItem.purityTag || "Temple Grade"}
                </span>
              </div>
              <div className="profile-row">
                <span className="k">Batch Number</span>
                <span className="v mono">
                  {viewItem.batchNo || "BATCH-2026-08"}
                </span>
              </div>
              <div className="profile-row">
                <span className="k">Expiry Status</span>
                <span
                  className={`pill ${getExpiryStatus(viewItem.expiryDate).class}`}
                >
                  {getExpiryStatus(viewItem.expiryDate).label}
                </span>
              </div>
              <div className="profile-row">
                <span className="k">Reorder Level</span>
                <span className="v">
                  {viewItem.reorderLevel} {viewItem.unit}
                </span>
              </div>
              <div className="profile-row">
                <span className="k">Current Supplier</span>
                <span className="v">{viewItem.supplier || "—"}</span>
              </div>
              <div className="profile-row">
                <span className="k">Last Updated</span>
                <span className="v">{formatDate(viewItem.lastUpdated)}</span>
              </div>
              {viewItem.notes && (
                <div className="profile-row full">
                  <span className="k">Notes</span>
                  <span className="v">{viewItem.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Add item modal ---------- */}
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
            <h3 className="modal-title">Add Item</h3>
            <form onSubmit={handleAddItem}>
              <div className="form-grid">
                <div className="field">
                  <label>Item Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => updateForm("category", e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.quantity}
                    onChange={(e) => updateForm("quantity", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Unit *</label>
                  <select
                    value={form.unit}
                    onChange={(e) => updateForm("unit", e.target.value)}
                  >
                    {UNITS.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.reorderLevel}
                    onChange={(e) => updateForm("reorderLevel", e.target.value)}
                    placeholder="Alert when stock falls below this"
                  />
                </div>
                <div className="field">
                  <label>Supplier</label>
                  <input
                    value={form.supplier}
                    onChange={(e) => updateForm("supplier", e.target.value)}
                    placeholder="e.g. Sri Balaji Traders"
                  />
                </div>
                <div className="field">
                  <label>Purity / Grade Tag</label>
                  <input
                    value={form.purityTag}
                    onChange={(e) => updateForm("purityTag", e.target.value)}
                    placeholder="e.g. Agmark Grade A Organic"
                  />
                </div>
                <div className="field">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => updateForm("expiryDate", e.target.value)}
                  />
                </div>
                <div className="field field-full">
                  <label>Notes</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => updateForm("notes", e.target.value)}
                    placeholder="Any additional details"
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Edit item modal ---------- */}
      {editItem && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setEditItem(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="modal-title">Edit Item</h3>
            <form onSubmit={handleEditItem}>
              <div className="form-grid">
                <div className="field">
                  <label>Item Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => updateForm("category", e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.quantity}
                    onChange={(e) => updateForm("quantity", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Unit *</label>
                  <select
                    value={form.unit}
                    onChange={(e) => updateForm("unit", e.target.value)}
                  >
                    {UNITS.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.reorderLevel}
                    onChange={(e) => updateForm("reorderLevel", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Supplier</label>
                  <input
                    value={form.supplier}
                    onChange={(e) => updateForm("supplier", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Purity / Grade Tag</label>
                  <input
                    value={form.purityTag}
                    onChange={(e) => updateForm("purityTag", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => updateForm("expiryDate", e.target.value)}
                  />
                </div>
                <div className="field field-full">
                  <label>Notes</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => updateForm("notes", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditItem(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Item
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
            <h3 className="modal-title">Remove Item</h3>
            <p className="muted">
              Are you sure you want to remove{" "}
              <strong>{deleteTarget.name}</strong> from inventory? This action
              cannot be undone.
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

      {/* ---------- Digital Purchase Order Receipt Modal ---------- */}
      {orderReceipt && (
        <div className="modal-overlay" onClick={() => setOrderReceipt(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: "600px", padding: "1.75rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setOrderReceipt(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "2.5rem", display: "block" }}>📜</span>
              <h3
                className="modal-title"
                style={{ margin: "0.25rem 0", color: "var(--teal)" }}
              >
                Official Purchase Order Issued
              </h3>
              <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
                Subramanya Swamy Temple Procurement System
              </p>
            </div>

            <div
              style={{
                background: "var(--paper)",
                border: "1px dashed var(--sand-dark, #d2c4b0)",
                borderRadius: "10px",
                padding: "1.25rem",
                fontSize: "0.9rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px dotted #ccc",
                  paddingBottom: "0.5rem",
                }}
              >
                <span className="muted">PO Reference No:</span>
                <strong>{orderReceipt.poNumber}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Order Date:</span>
                <span>{orderReceipt.date}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Supplier Name:</span>
                <strong style={{ color: "var(--teal)" }}>
                  {orderReceipt.supplier}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Item Ordered:</span>
                <span>
                  {orderReceipt.item} ({orderReceipt.category})
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Purity / Certification:</span>
                <span style={{ fontStyle: "italic" }}>
                  {orderReceipt.purityTag}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Quantity Added:</span>
                <strong>
                  + {orderReceipt.quantity} {orderReceipt.unit}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Unit Price:</span>
                <span>
                  ₹{orderReceipt.pricePerUnit} / {orderReceipt.unit}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Estimated Delivery:</span>
                <span>{orderReceipt.leadTime}</span>
              </div>

              <div
                style={{
                  marginTop: "0.75rem",
                  paddingTop: "0.75rem",
                  borderTop: "2px solid var(--teal)",
                  display: "flex",
                  justify: "space-between",
                  fontSize: "1.1rem",
                }}
              >
                <strong>Total Order Value:</strong>
                <strong style={{ color: "var(--sindoor, #900)" }}>
                  ₹{orderReceipt.totalAmount.toLocaleString()}
                </strong>
              </div>
            </div>

            <div
              style={{
                marginTop: "1rem",
                padding: "0.6rem 0.8rem",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "6px",
                textAlign: "center",
                color: "#065f46",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              ✅ Status: ORDER CONFIRMED & DISPATCHED TO SUPPLIER
            </div>

            <div className="form-actions" style={{ marginTop: "1.25rem" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  window.print();
                }}
              >
                🖨️ Print Purchase Order
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setOrderReceipt(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
