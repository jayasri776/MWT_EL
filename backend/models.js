import mongoose from "mongoose";

const options = { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, strict: false };

// User Schema
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: "Staff" },
    name: { type: String, required: true },
  },
  options
);

// Activity Schema
const activitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sub: { type: String, default: "" },
    type: { type: String, required: true },
    when_date: { type: String },
    when: { type: String },
    priest: { type: String },
    status: { type: String, default: "Scheduled" },
  },
  options
);

// Donation Schema
const donationSchema = new mongoose.Schema(
  {
    donor_name: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: String },
    payment_mode: { type: String },
    receipt_no: { type: String },
    status: { type: String, default: "Completed" },
  },
  options
);

// Priest Schema
const priestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: { type: String },
    department: { type: String },
    specialization: { type: String },
    gender: { type: String },
    dob: { type: String },
    address: { type: String },
    phone: { type: String },
    contact: { type: String },
    qualification: { type: String },
    joinedOn: { type: String },
    experience: { type: String },
    shift: { type: String },
    status: { type: String, default: "Active" },
    availability: { type: String, default: "Available" },
    photo: { type: String },
  },
  options
);

// Staff Schema
const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String },
    category: { type: String },
    department: { type: String },
    shift: { type: String },
    phone: { type: String },
    contact: { type: String },
    age: { type: mongoose.Schema.Types.Mixed },
    gender: { type: String },
    qualification: { type: String },
    joinedDate: { type: String },
    experience: { type: String },
    status: { type: String, default: "Active" },
  },
  options
);

// Inventory Schema
const inventorySchema = new mongoose.Schema(
  {
    item_name: { type: String, required: true },
    name: { type: String },
    category: { type: String },
    quantity: { type: Number, default: 0 },
    unit: { type: String },
    status: { type: String, default: "In Stock" },
  },
  options
);

// Festival Schema
const festivalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    start_date: { type: String },
    end_date: { type: String },
    description: { type: String },
    status: { type: String, default: "Upcoming" },
  },
  options
);

// Annadhanam Schema
const annadhanamSchema = new mongoose.Schema(
  {
    date: { type: String },
    count: { type: Number },
    sponsor_name: { type: String },
    amount: { type: Number },
    status: { type: String, default: "Scheduled" },
  },
  options
);

// Temple Details Schema
const templeDetailSchema = new mongoose.Schema(
  {
    id: { type: Number, default: 1, unique: true },
    name: { type: String },
    location: { type: String },
    timings: { type: String },
    phone: { type: String },
    email: { type: String },
    trust_info: { type: String },
  },
  options
);

// Sponsorship Schema
const sponsorshipSchema = new mongoose.Schema(
  {
    sponsor: { type: String, required: true },
    name: { type: String },
    activity: { type: String },
    amount: { type: String },
    status: { type: String, default: "Pending" },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
  },
  options
);

// Panchangam Schema
const panchangamSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD
    tithi: { type: String, required: true },
    tithi_end: { type: String },
    nakshatram: { type: String, required: true },
    nakshatram_end: { type: String },
    rahu_kalam: { type: String, required: true },
    yamagandam: { type: String, required: true },
    durmuhurtham: { type: String },
    yogam: { type: String },
    karanam: { type: String },
    sunrise: { type: String, default: "06:05 AM" },
    sunset: { type: String, default: "06:15 PM" },
    auspicious_time: { type: String },
    special_events: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  options
);

// Sacred Ornaments & Jewelry (Abharanam) Schema
const abharanamSchema = new mongoose.Schema(
  {
    item_code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    deity: { type: String, required: true },
    category: { type: String, required: true }, // Crown (Kireedam), Lance (Vel), Necklace (Haaram), Armlet, Kavacham, etc.
    metal_type: { type: String, required: true }, // 22K Gold, 24K Gold, 925 Sterling Silver, Platinum
    gross_weight_grams: { type: Number, required: true, default: 0 },
    net_weight_grams: { type: Number, required: true, default: 0 },
    stone_weight_carats: { type: Number, default: 0 },
    hallmark_cert: { type: String, default: "BIS-HM-PENDING" },
    estimated_value_inr: { type: Number, default: 0 },
    insurance_policy: { type: String, default: "N/A" },
    insurance_expiry: { type: String },
    vault_location: { type: String, default: "Main Vault Locker 01" },
    status: { type: String, default: "In Vault" }, // In Vault, Adorning Deity, Under Maintenance, In Transit
    photo_url: { type: String },
    last_inspection_date: { type: String },
    notes: { type: String },
  },
  options
);

// Vault Access & Alankaram Movement Log Schema
const abharanamMovementSchema = new mongoose.Schema(
  {
    abharanam_id: { type: String, required: true },
    item_code: { type: String, required: true },
    abharanam_name: { type: String, required: true },
    action: { type: String, required: true }, // Vault Check Out (Issue), Vault Check In (Return), Maintenance
    timestamp: { type: String, required: true },
    issued_to_priest: { type: String, required: true },
    authorized_by: { type: String, required: true },
    deity_adorned: { type: String },
    purpose: { type: String, default: "Daily Alankaram" },
    security_witness: { type: String },
    condition: { type: String, default: "Excellent / Intact" },
    status: { type: String, default: "Completed" },
    notes: { type: String },
  },
  options
);

// Audit Log Schema
const auditLogSchema = new mongoose.Schema(
  {
    timestamp: { type: String, required: true },
    action: { type: String, required: true }, // CREATE, UPDATE, DELETE, LOGIN, VAULT_CHECKOUT, VAULT_CHECKIN
    module: { type: String, required: true }, // Inventory, Abharanam, Donations, Panchangam, Activities, Festivals, Staff, Priests, System
    details: { type: String, required: true },
    performed_by: { type: String, required: true },
    user_role: { type: String, default: "Administrator" },
    ip: { type: String, default: "127.0.0.1" },
  },
  options
);

export const User = mongoose.model("User", userSchema);
export const Activity = mongoose.model("Activity", activitySchema);
export const Donation = mongoose.model("Donation", donationSchema);
export const Sponsorship = mongoose.model("Sponsorship", sponsorshipSchema);
export const Priest = mongoose.model("Priest", priestSchema);
export const Staff = mongoose.model("Staff", staffSchema);
export const Inventory = mongoose.model("Inventory", inventorySchema);
export const Festival = mongoose.model("Festival", festivalSchema);
export const Annadhanam = mongoose.model("Annadhanam", annadhanamSchema);
export const TempleDetail = mongoose.model("TempleDetail", templeDetailSchema);
export const Panchangam = mongoose.model("Panchangam", panchangamSchema);
export const Abharanam = mongoose.model("Abharanam", abharanamSchema);
export const AbharanamMovement = mongoose.model("AbharanamMovement", abharanamMovementSchema);
export const AuditLog = mongoose.model("AuditLog", auditLogSchema);

