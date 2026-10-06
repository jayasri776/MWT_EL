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


