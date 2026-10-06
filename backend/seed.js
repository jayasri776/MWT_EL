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
  Panchangam,
} from "./models.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tams_db";

export async function seedDatabase(force = false) {
  try {
    const existingCount = await User.countDocuments();
    if (!force && existingCount > 0) {
      console.log("MongoDB Database contains existing collections. Skipping automatic re-seeding to preserve user modifications.");
      return;
    }
    // Seed Users
    await User.deleteMany({});
    await User.insertMany([
      { username: "admin", password: "123", role: "Administrator", name: "Temple Administrator" },
      { username: "priest", password: "123", role: "Priest", name: "Priest" },
      { username: "treasurer", password: "123", role: "Treasurer", name: "Treasurer" },
    ]);
    console.log("MongoDB Seed: Users created");

    // Seed Activities
    await Activity.deleteMany({});
    await Activity.insertMany([
      { name: "Suprabhatam & Nirmalya Darshan", sub: "Sanctum sanctorum", type: "Daily", when_date: "08 Aug · 5:30 AM", when: "08 Aug · 5:30 AM", priest: "Ganesan Sivachariar", status: "Completed" },
      { name: "Ganapathy Homam", sub: "Sponsored seva", type: "Daily", when_date: "08 Aug · 7:00 AM", when: "08 Aug · 7:00 AM", priest: "Krishnamurthy Bhat", status: "Completed" },
      { name: "Sayaraksha & Abhishekam", sub: "Evening rites", type: "Daily", when_date: "08 Aug · 6:00 PM", when: "08 Aug · 6:00 PM", priest: "Krishnamurthy Bhat", status: "Scheduled" },
      { name: "Sahasranama Archana", sub: "Weekly Friday special", type: "Weekly", when_date: "14 Aug · 9:00 AM", when: "14 Aug · 9:00 AM", priest: "Ravishankar Gurukkal", status: "Scheduled" },
      { name: "Full Moon Abhishekam", sub: "Monthly Pournami seva", type: "Monthly", when_date: "19 Aug · 6:30 AM", when: "19 Aug · 6:30 AM", priest: "Ganesan Sivachariar", status: "Scheduled" },
      { name: "Varalakshmi Vratham Kalasam", sub: "Festival opening ritual", type: "Festival", when_date: "14 Aug · 6:00 AM", when: "14 Aug · 6:00 AM", priest: "Ganesan Sivachariar", status: "Scheduled" },
      { name: "Navagraha Shanti Homam", sub: "Devotee request — special pooja", type: "Special", when_date: "10 Aug · 10:00 AM", when: "10 Aug · 10:00 AM", priest: "Ravishankar Gurukkal", status: "Cancelled" },
    ]);
    console.log("MongoDB Seed: Activities created");

    // Seed Donations
    await Donation.deleteMany({});
    await Donation.insertMany([
      { donor_name: "Sundaram Iyer", amount: 5000.00, category: "Annadhanam", date: "2026-08-08", payment_mode: "Online", receipt_no: "RCT-88213", status: "Completed" },
      { donor_name: "Lakshmi Narayanan", amount: 1100.00, category: "General", date: "2026-08-08", payment_mode: "Cash", receipt_no: "RCT-88214", status: "Completed" },
      { donor_name: "Anand Traders", amount: 3200.00, category: "Annadhanam", date: "2026-08-07", payment_mode: "Kind", receipt_no: "RCT-88215", status: "Completed" },
      { donor_name: "Kalpana Ramesh", amount: 25000.00, category: "Renovation", date: "2026-08-07", payment_mode: "Online", receipt_no: "RCT-88216", status: "Completed" },
      { donor_name: "Venkatesh Prasad", amount: 501.00, category: "General", date: "2026-08-06", payment_mode: "UPI", receipt_no: "RCT-88217", status: "Completed" },
    ]);
    console.log("MongoDB Seed: Donations created");

    // Seed Sponsorships
    await Sponsorship.deleteMany({});
    await Sponsorship.insertMany([
      { sponsor: "Rajaraman Family", name: "Rajaraman Family", activity: "Ganapathy Homam — Daily", amount: "₹1,500", status: "Paid", phone: "+91 98401 30011", email: "rajaraman.family@example.com", address: "21, East Car Street, Tiruchendur, Thoothukudi District, Tamil Nadu" },
      { sponsor: "Priya Textiles (Org)", name: "Priya Textiles (Org) — contact: Priya Ramachandran", activity: "Kandha Sashti Utsavam Kalasam", amount: "₹15,000", status: "Pending", phone: "+91 98402 30022", email: "accounts@priyatextiles.example.com", address: "Shop No. 4, Market Road, Tiruchendur, Thoothukudi District, Tamil Nadu" },
    ]);
    console.log("MongoDB Seed: Sponsorships created");

    // Seed Priests
    await Priest.deleteMany({});
    await Priest.insertMany([
      { name: "Ganesan Sivachariar", designation: "Chief Priest", department: "Archaka Vibhagam", specialization: "Abhishekam, Homam", gender: "Male", dob: "1968-04-12", address: "12, Kovil Street, Tiruchendur, Thoothukudi District, Tamil Nadu", contact: "+91 98401 23456", phone: "+91 98401 23456", qualification: "Agama Sastra Diploma, Tiruchendur Veda Patasala", joinedOn: "2003-06-01", experience: "22 years", shift: "Morning", availability: "Available", status: "Active" },
      { name: "Krishnamurthy Bhat", designation: "Assistant Priest", department: "Archaka Vibhagam", specialization: "Aarti, Homam", gender: "Male", dob: "1981-09-05", address: "34, Agraharam Street, Tiruchendur, Thoothukudi District, Tamil Nadu", contact: "+91 98402 34567", phone: "+91 98402 34567", qualification: "Vedic Studies Certificate, Kumbakonam Veda Patasala", joinedOn: "2015-03-10", experience: "9 years", shift: "Full Day", availability: "On Duty", status: "Active" },
      { name: "Ravishankar Gurukkal", designation: "Assistant Priest", department: "Utsavam Vibhagam", specialization: "Abhishekam", gender: "Male", dob: "1975-01-20", address: "8, Temple East Street, Tiruchendur, Thoothukudi District, Tamil Nadu", contact: "+91 98403 45678", phone: "+91 98403 45678", qualification: "Agama Sastra Certificate, Chidambaram Patasala", joinedOn: "2010-07-15", experience: "14 years", shift: "Evening", availability: "On Leave", status: "Active" },
    ]);
    console.log("MongoDB Seed: Priests created");

    // Seed Staff
    await Staff.deleteMany({});
    await Staff.insertMany([
      { name: "Muthu Kumar", role: "Security Supervisor", category: "Security", department: "Security", shift: "Morning", phone: "+91 94441 11223", age: 34, gender: "Male", qualification: "ITI - Security Management", joinedDate: "2016-03-12", experience: "8 years", status: "Active" },
      { name: "Selvi R.", role: "Cleaning Staff", category: "Cleaning", department: "Housekeeping", shift: "Full Day", phone: "+91 94442 22334", age: 41, gender: "Female", qualification: "SSLC", joinedDate: "2012-07-01", experience: "12 years", status: "Active" },
      { name: "Bhaskaran N.", role: "Accountant", category: "Accounts", department: "Administration", shift: "Morning", phone: "+91 94443 33445", age: 38, gender: "Male", qualification: "B.Com", joinedDate: "2015-01-20", experience: "9 years", status: "Active" },
      { name: "Lakshmi N.", role: "Kitchen Supervisor", category: "Volunteer", department: "Annadhanam", shift: "Evening", phone: "+91 94444 44556", age: 45, gender: "Female", qualification: "SSLC", joinedDate: "2019-02-01", experience: "5 years", status: "Active" },
    ]);
    console.log("MongoDB Seed: Staff created");

    // Seed Inventory
    await Inventory.deleteMany({});
    await Inventory.insertMany([
      { item_name: "Pure Cow Ghee", name: "Pure Cow Ghee", category: "Pooja Essentials", quantity: 45, unit: "Liters", reorderLevel: 10, supplier: "Sri Lakshmi Dairy", lastUpdated: "2026-08-20", notes: "Daily Abhishekam & Pooja", batchNo: "BATCH-2026-08A", expiryDate: "2026-12-15", purityTag: "Agmark Grade A Organic", status: "In Stock" },
      { item_name: "Camphor (Karpuram)", name: "Camphor (Karpuram)", category: "Pooja Essentials", quantity: 12, unit: "Kg", reorderLevel: 15, supplier: "Bhimseni Pure Camphor Depot", lastUpdated: "2026-08-18", notes: "Aarti ritual camphor", batchNo: "BATCH-2026-08B", expiryDate: "2027-08-18", purityTag: "100% Refined Bhimseni Grade", status: "In Stock" },
      { item_name: "Sandalwood Paste", name: "Sandalwood Paste", category: "Pooja Essentials", quantity: 8, unit: "Kg", reorderLevel: 10, supplier: "Tamil Nadu Forest Craft Depot", lastUpdated: "2026-08-19", notes: "Deity Chandana Alankaram", batchNo: "BATCH-2026-08C", expiryDate: "2026-11-19", purityTag: "Agmark Grade A Chandanam", status: "Low Stock" },
      { item_name: "Raw Rice (Annadhanam)", name: "Raw Rice (Annadhanam)", category: "Kitchen Items", quantity: 450, unit: "Kg", reorderLevel: 100, supplier: "Tanjore Rice Traders", lastUpdated: "2026-08-21", notes: "Annadhanam kitchen cooking", batchNo: "BATCH-2026-08D", expiryDate: "2027-02-21", purityTag: "Sona Masuri Aged Rice", status: "In Stock" },
      { item_name: "Jaggery", name: "Jaggery", category: "Kitchen Items", quantity: 85, unit: "Kg", reorderLevel: 20, supplier: "Erode Organic Jaggery Depot", lastUpdated: "2026-08-15", notes: "Prasadam sweet preparation", batchNo: "BATCH-2026-08E", expiryDate: "2026-10-15", purityTag: "Chemical-free Nattu Sakkarai", status: "In Stock" },
      { item_name: "Brass Oil Lamps (Dheepam)", name: "Brass Oil Lamps (Dheepam)", category: "Pooja Utensils", quantity: 30, unit: "Pieces", reorderLevel: 5, supplier: "Swamimalai Metal Artisans", lastUpdated: "2026-08-10", notes: "Sanctum lighting", batchNo: "BATCH-2026-08F", expiryDate: "2030-01-01", purityTag: "Heavy Brass Traditional Cast", status: "In Stock" },
    ]);
    console.log("MongoDB Seed: Inventory created");

    // Seed Festivals
    await Festival.deleteMany({});
    await Festival.insertMany([
      { name: "Kandha Sashti & Soorasamharam", deity: "Lord Subramaniya Swamy (Senthil Aandavar)", category: "Annual", start_date: "2026-10-25", end_date: "2026-10-31", priest: "Ganesan Sivachariar", expectedDevotees: 500000, status: "Planned", history: "Kandha Sashti at Tiruchendur is world-famous. It celebrates Lord Murugan's victory over the demon king Surapadman on the sacred seashore of Tiruchendur using the Divine Vel (Lance) given by Goddess Parvati.", significance: "Hundreds of thousands of devotees observe strict 6-day fasting. On the 6th day, the dramatic enactment of Soorasamharam takes place on Tiruchendur seashore, followed by the divine wedding ceremony (Thirukalyanam) with Goddess Deivanai on the 7th day." },
      { name: "Vaikasi Visakam Utsavam", deity: "Lord Shanmukha", category: "Annual", start_date: "2026-05-28", end_date: "2026-06-01", priest: "Krishnamurthy Bhat", expectedDevotees: 350000, status: "Completed", history: "Vaikasi Visakam celebrates the incarnation day (birth star) of Lord Shanmukha / Subramaniya Swamy. Millions of devotees walk on foot (Pada Yatra) from various parts of Tamil Nadu to Tiruchendur temple.", significance: "Devotees carry Pal Kudam (milk pots) and elaborate Kavadis to offer milk Abhishekam to Lord Shanmukha, seeking health, longevity, and divine grace." },
      { name: "Avani Perumanthiram (Avani Utsavam)", deity: "Lord Senthil Nayagar", category: "Annual", start_date: "2026-08-24", end_date: "2026-09-04", priest: "Ravishankar Gurukkal", expectedDevotees: 200000, status: "Ongoing", history: "The 12-day Avani festival is a major annual Brahmotsavam at Tiruchendur. Lord Shanmukha is taken in procession in Red Silk (Sivappu Saathi) and White Silk (Vellai Saathi) chapparams.", significance: "Features the grand Ther Oottam (Car Festival) on the 10th day, drawing massive crowds of devotees to pull the temple chariot through Car Street." },
      { name: "Masi Perumanthiram (Masi Utsavam)", deity: "Lord Shanmukha with Valli & Deivanai", category: "Annual", start_date: "2026-02-14", end_date: "2026-02-25", priest: "Ganesan Sivachariar", expectedDevotees: 250000, status: "Completed", history: "A historic 12-day festival celebrated in Masi month featuring Silver Chariot procession (Velli Chapparam) and the sacred sea-water bath (Theerthavari).", significance: "Lord Shanmukha is adorned in Green Silk (Pachai Saathi) Alankaram, symbolizing prosperity, spiritual bliss, and divine protection for all devotees." },
      { name: "Tuesday Shanmugar Abhishekam & Kavadi Seva", deity: "Lord Shanmukha", category: "Weekly", start_date: "2026-09-22", end_date: "2026-09-22", priest: "Krishnamurthy Bhat", expectedDevotees: 15000, status: "Ongoing", history: "Tuesday (Sevvai) is sacred for Lord Murugan worship at Tiruchendur. Weekly special Shanmuga Abhishekam is performed with Milk, Sandal paste, Rose water, and Vibhuti.", significance: "Brings relief from Angaraka (Mars) dosham, grants health, strength, and victory in righteous endeavors." },
    ]);
    console.log("MongoDB Seed: Festivals created");

    // Seed Annadhanam
    await Annadhanam.deleteMany({});
    await Annadhanam.insertMany([
      { date: "08 Aug", occasion: "Daily", location: "Dining Hall A", count: 318, beneficiaries: "318", menu: "Rice, sambar, rasam, payasam", sponsor_name: "General fund", amount: 5000.00, status: "Completed" },
      { date: "09 Aug", occasion: "Daily", location: "Dining Hall A", count: 300, beneficiaries: "~300 est.", menu: "Rice, sambar, poriyal", sponsor_name: "Rajaraman family", amount: 6000.00, status: "Scheduled" },
      { date: "25 Oct", occasion: "Kandha Sashti Utsavam", location: "Dining Hall A + B", count: 5000, beneficiaries: "~5,000 est.", menu: "Festival sweet pongal, vadai, payasam", sponsor_name: "Pooled sponsorships", amount: 50000.00, status: "Scheduled" },
      { date: "01 Aug", occasion: "Daily", location: "Dining Hall A", count: 290, beneficiaries: "290", menu: "Rice, sambar, curd", sponsor_name: "General fund", amount: 4800.00, status: "Completed" },
    ]);
    console.log("MongoDB Seed: Annadhanam created");

    // Seed TempleDetails
    await TempleDetail.deleteMany({});
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

    // Seed Panchangam
    await Panchangam.deleteMany({});
    await Panchangam.insertMany([
      {
        date: "2026-10-05",
        tithi: "Ekadashi (Shukla Paksha)",
        tithi_end: "11:42 PM",
        nakshatram: "Rohini Nakshatram",
        nakshatram_end: "08:15 PM",
        rahu_kalam: "07:30 AM – 09:00 AM",
        yamagandam: "10:30 AM – 12:00 PM",
        durmuhurtham: "12:30 PM – 01:15 PM",
        yogam: "Siddha Yogam",
        karanam: "Bava Karanam",
        sunrise: "06:05 AM",
        sunset: "06:15 PM",
        auspicious_time: "09:15 AM – 10:20 AM",
        special_events: "Sacred Ekadashi Fasting & Special Murugan Abhishekam",
        notes: "Highly auspicious for sacred vows and Annadhanam offerings",
      },
      {
        date: "2026-10-06",
        tithi: "Dwadashi (Shukla Paksha)",
        tithi_end: "10:15 PM",
        nakshatram: "Mrigashirsha Nakshatram",
        nakshatram_end: "07:45 PM",
        rahu_kalam: "03:00 PM – 04:30 PM",
        yamagandam: "09:00 AM – 10:30 AM",
        durmuhurtham: "08:45 AM – 09:30 AM",
        yogam: "Amrita Siddha Yogam",
        karanam: "Kaulava Karanam",
        sunrise: "06:05 AM",
        sunset: "06:14 PM",
        auspicious_time: "10:30 AM – 11:45 AM",
        special_events: "Dwadashi Paranai & Temple Annadhanam Seva",
        notes: "Devotees conclude Ekadashi fast after morning Abhishekam",
      },
      {
        date: "2026-10-25",
        tithi: "Prathama / Kandha Sashti Day 1",
        tithi_end: "Full Day",
        nakshatram: "Visakam Nakshatram",
        nakshatram_end: "11:30 PM",
        rahu_kalam: "04:30 PM – 06:00 PM",
        yamagandam: "12:00 PM – 01:30 PM",
        durmuhurtham: "11:45 AM – 12:30 PM",
        yogam: "Shubha Yogam",
        karanam: "Taitila Karanam",
        sunrise: "06:10 AM",
        sunset: "06:02 PM",
        auspicious_time: "06:30 AM – 08:30 AM",
        special_events: "Kandha Sashti Utsavam Flag Hoisting (Dhwajarohanam)",
        notes: "World famous Tiruchendur Kandha Sashti begins",
      },
    ]);
    console.log("MongoDB Seed: Panchangam created");



  } catch (err) {
    console.error("MongoDB Seed Error:", err);
  }
}


if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  mongoose
    .connect(MONGODB_URI)
    .then(async () => {
      console.log("Connected to MongoDB for Seeding...");
      await seedDatabase(true);
      await mongoose.disconnect();
      console.log("Seeding complete and disconnected.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Connection error during seeding:", err);
      process.exit(1);
    });
}
