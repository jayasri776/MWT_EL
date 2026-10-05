import mongoose from "mongoose";
import dotenv from "dotenv";
import {
  User,
  Activity,
  Donation,
  Sponsorship,
  Priest,
  Staff,
  Inventory,
  Festival,
  Annadhanam,
  TempleDetail,
} from "./models.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tams_db";

export async function seedDatabase() {
  try {
    // Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany([
        { username: "admin", password: "123", role: "Administrator", name: "Temple Administrator" },
        { username: "priest", password: "123", role: "Priest", name: "Priest" },
        { username: "treasurer", password: "123", role: "Treasurer", name: "Treasurer" },
      ]);
      console.log("MongoDB Seed: Users created");
    }

    // Seed Activities
    const activityCount = await Activity.countDocuments();
    if (activityCount === 0) {
      await Activity.insertMany([
        { name: "Suprabhatam & Nirmalya Darshan", sub: "Sanctum sanctorum", type: "Daily", when_date: "08 Aug · 5:30 AM", priest: "Ganesan Sivachariar", status: "Completed" },
        { name: "Ganapathy Homam", sub: "Sponsored seva", type: "Daily", when_date: "08 Aug · 7:00 AM", priest: "Krishnamurthy Bhat", status: "Completed" },
        { name: "Sayaraksha & Abhishekam", sub: "Evening rites", type: "Daily", when_date: "08 Aug · 6:00 PM", priest: "Krishnamurthy Bhat", status: "Scheduled" },
        { name: "Sahasranama Archana", sub: "Weekly Friday special", type: "Weekly", when_date: "14 Aug · 9:00 AM", priest: "Ravishankar Gurukkal", status: "Scheduled" },
        { name: "Full Moon Abhishekam", sub: "Monthly Pournami seva", type: "Monthly", when_date: "19 Aug · 6:30 AM", priest: "Ganesan Sivachariar", status: "Scheduled" },
        { name: "Varalakshmi Vratham Kalasam", sub: "Festival opening ritual", type: "Festival", when_date: "14 Aug · 6:00 AM", priest: "Ganesan Sivachariar", status: "Scheduled" },
        { name: "Navagraha Shanti Homam", sub: "Devotee request — special pooja", type: "Special", when_date: "10 Aug · 10:00 AM", priest: "Ravishankar Gurukkal", status: "Cancelled" },
      ]);
      console.log("MongoDB Seed: Activities created");
    }

    // Seed Donations
    const donationCount = await Donation.countDocuments();
    if (donationCount === 0) {
      await Donation.insertMany([
        { donor_name: "Ramanathan K.", amount: 10008.00, category: "Annadhanam", date: "2026-08-08", payment_mode: "UPI", receipt_no: "REC-2026-0801", status: "Completed" },
        { donor_name: "Meenakshi Sundaram", amount: 5000.00, category: "Temple Renovation", date: "2026-08-07", payment_mode: "Net Banking", receipt_no: "REC-2026-0802", status: "Completed" },
        { donor_name: "Saritha Reddy", amount: 2500.00, category: "Daily Pooja", date: "2026-08-06", payment_mode: "Cash", receipt_no: "REC-2026-0803", status: "Completed" },
        { donor_name: "Srinivasan V.", amount: 15000.00, category: "Kumbhabhishekam", date: "2026-08-05", payment_mode: "Cheque", receipt_no: "REC-2026-0804", status: "Completed" },
      ]);
      console.log("MongoDB Seed: Donations created");
    }

    // Seed Sponsorships
    const sponsorshipCount = await Sponsorship.countDocuments();
    if (sponsorshipCount === 0) {
      await Sponsorship.insertMany([
        { sponsor: "Rajaraman Family", name: "Rajaraman Family", activity: "Ganapathy Homam — Daily", amount: "₹1,500", status: "Paid", phone: "+91 98401 30011", email: "rajaraman.family@example.com", address: "21, East Car Street, Tiruchendur, Thoothukudi District, Tamil Nadu" },
        { sponsor: "Priya Textiles (Org)", name: "Priya Textiles (Org) — contact: Priya Ramachandran", activity: "Kandha Sashti Utsavam Kalasam", amount: "₹15,000", status: "Pending", phone: "+91 98402 30022", email: "accounts@priyatextiles.example.com", address: "Shop No. 4, Market Road, Tiruchendur, Thoothukudi District, Tamil Nadu" },
      ]);
      console.log("MongoDB Seed: Sponsorships created");
    }

    // Seed Priests
    const priestCount = await Priest.countDocuments();
    if (priestCount === 0) {
      await Priest.insertMany([
        { name: "Ganesan Sivachariar", designation: "Chief Priest (Head Archaka)", phone: "+91 98401 23456", shift: "Morning Shift (5 AM - 1 PM)", status: "Active" },
        { name: "Krishnamurthy Bhat", designation: "Senior Priest", phone: "+91 98402 34567", shift: "Evening Shift (4 PM - 9 PM)", status: "Active" },
        { name: "Ravishankar Gurukkal", designation: "Assistant Priest", phone: "+91 98403 45678", shift: "Full Day", status: "Active" },
      ]);
      console.log("MongoDB Seed: Priests created");
    }

    // Seed Staff
    const staffCount = await Staff.countDocuments();
    if (staffCount === 0) {
      await Staff.insertMany([
        { name: "Sundararajan P.", role: "Office Manager", category: "Accounts", department: "Administration", shift: "Morning", phone: "+91 94441 11223", age: 48, gender: "Male", qualification: "M.Com, MBA", joinedDate: "2015-01-20", experience: "9 years", status: "Active" },
        { name: "Kavitha M.", role: "Accountant", category: "Accounts", department: "Finance", shift: "Morning", phone: "+91 94442 22334", age: 38, gender: "Female", qualification: "B.Com", joinedDate: "2018-05-10", experience: "6 years", status: "Active" },
        { name: "Murugan V.", role: "Store Keeper", category: "Security", department: "Inventory", shift: "Full Day", phone: "+91 94443 33445", age: 42, gender: "Male", qualification: "Diploma", joinedDate: "2017-09-15", experience: "7 years", status: "Active" },
        { name: "Lakshmi N.", role: "Kitchen Supervisor", category: "Volunteer", department: "Annadhanam", shift: "Evening", phone: "+91 94444 44556", age: 45, gender: "Female", qualification: "SSLC", joinedDate: "2019-02-01", experience: "5 years", status: "Active" },
      ]);
      console.log("MongoDB Seed: Staff created");
    }

    // Seed Inventory
    const inventoryCount = await Inventory.countDocuments();
    if (inventoryCount === 0) {
      await Inventory.insertMany([
        { item_name: "Pure Cow Ghee", category: "Pooja Essentials", quantity: 45, unit: "Liters", status: "In Stock" },
        { item_name: "Camphor (Karpuram)", category: "Pooja Essentials", quantity: 12, unit: "Kg", status: "In Stock" },
        { item_name: "Sandalwood Paste", category: "Pooja Essentials", quantity: 8, unit: "Kg", status: "Low Stock" },
        { item_name: "Raw Rice (Annadhanam)", category: "Kitchen Items", quantity: 450, unit: "Kg", status: "In Stock" },
        { item_name: "Jaggery", category: "Kitchen Items", quantity: 85, unit: "Kg", status: "In Stock" },
        { item_name: "Brass Oil Lamps (Dheepam)", category: "Pooja Utensils", quantity: 30, unit: "Pieces", status: "In Stock" },
      ]);
      console.log("MongoDB Seed: Inventory created");
    }

    // Seed Festivals
    const festivalCount = await Festival.countDocuments();
    if (festivalCount === 0) {
      await Festival.insertMany([
        { name: "Kandha Sashti Utsavam & Soorasamharam", start_date: "2026-10-25", end_date: "2026-10-31", description: "Grand 6-day festival celebrating Lord Murugan defeating Surapadman on the seashore, followed by Thirukalyanam", status: "Upcoming" },
        { name: "Vaikasi Visakam Utsavam", start_date: "2026-05-28", end_date: "2026-06-01", description: "Incarnation day of Lord Shanmukha with thousands bringing Milk Kavadis and Pada Yatra", status: "Completed" },
        { name: "Avani Perumanthiram (Avani Utsavam)", start_date: "2026-08-24", end_date: "2026-09-04", description: "12-day festival with Red Silk and White Silk Shanmugar chapparams and Ther Oottam car festival", status: "Ongoing" },
        { name: "Masi Perumanthiram (Masi Utsavam)", start_date: "2026-02-14", end_date: "2026-02-25", description: "12-day Brahmotsavam with Silver Chariot, Pachai Saathi Green Alankaram, and sea-water Theerthavari", status: "Completed" },
        { name: "Tuesday Shanmugar Abhishekam & Kavadi Seva", start_date: "2026-09-22", end_date: "2026-09-22", description: "Weekly sacred Sevvai/Tuesday special milk Abhishekam and Kavadi offerings for Lord Shanmukha", status: "Ongoing" },
      ]);
      console.log("MongoDB Seed: Festivals created");
    }

    // Seed Annadhanam
    const annadhanamCount = await Annadhanam.countDocuments();
    if (annadhanamCount === 0) {
      await Annadhanam.insertMany([
        { date: "2026-08-08", count: 500, sponsor_name: "Ramanathan K.", amount: 10008.00, status: "Served" },
        { date: "2026-08-07", count: 450, sponsor_name: "Anonymous Devotee", amount: 7500.00, status: "Served" },
        { date: "2026-08-09", count: 600, sponsor_name: "Suresh Kumar", amount: 12000.00, status: "Scheduled" },
        { date: "2026-08-10", count: 550, sponsor_name: "Temple Trust Fund", amount: 10000.00, status: "Scheduled" },
      ]);
      console.log("MongoDB Seed: Annadhanam created");
    }

    // Seed TempleDetails
    const templeCount = await TempleDetail.countDocuments();
    if (templeCount === 0) {
      await TempleDetail.create({
        id: 1,
        name: "Sri Arulmigu Subramaniya Swamy Temple",
        location: "Tiruchendur, Thoothukudi District, Tamil Nadu - 628215",
        timings: "5:00 AM – 12:30 PM & 4:00 PM – 9:00 PM",
        phone: "+91 4639 242221",
        email: "eo.tiruchendur@tnhrce.gov.in",
        trust_info: "Managed by Hindu Religious & Charitable Endowments (HR&CE) Department & Devasthanam Board",
      });
      console.log("MongoDB Seed: TempleDetails created");
    }
  } catch (err) {
    console.error("MongoDB Seed Error:", err);
  }
}

if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  mongoose
    .connect(MONGODB_URI)
    .then(async () => {
      console.log("Connected to MongoDB for Seeding...");
      await seedDatabase();
      await mongoose.disconnect();
      console.log("Seeding complete and disconnected.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Connection error during seeding:", err);
      process.exit(1);
    });
}
