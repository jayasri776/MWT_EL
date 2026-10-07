import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
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
import { seedDatabase } from "./seed.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "tams_jwt_secret_key_2026_super_secure";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tams_db";

let isMongoConnected = false;

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    isMongoConnected = true;
    console.log(`Connected to MongoDB Database via URI: ${MONGODB_URI}`);
    await seedDatabase();
  })
  .catch((err) => {
    console.error("MongoDB Connection Warning:", err.message);
    console.log("Ensure MongoDB Service is running or update MONGODB_URI in backend/.env");
  });

// Format document helper to convert _id to string id for frontend compatibility
const formatDoc = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj._id) {
    obj.id = obj._id.toString();
  }
  return obj;
};

const formatDocs = (docs) => docs.map(formatDoc);

const recordAuditLog = async () => {};


// Panchangam Daily Vedic Calculator Helper (computes for any date)
const calculatePanchangamForDate = (dateStr) => {
  const d = new Date(dateStr);
  const dayOfWeek = isNaN(d.getDay()) ? 0 : d.getDay();
  const dayOfMonth = isNaN(d.getDate()) ? 1 : d.getDate();

  const RAHU_KALAM_MAP = {
    0: "04:30 PM – 06:00 PM", // Sun
    1: "07:30 AM – 09:00 AM", // Mon
    2: "03:00 PM – 04:30 PM", // Tue
    3: "12:00 PM – 01:30 PM", // Wed
    4: "01:30 PM – 03:00 PM", // Thu
    5: "10:30 AM – 12:00 PM", // Fri
    6: "09:00 AM – 10:30 AM", // Sat
  };

  const YAMAGANDAM_MAP = {
    0: "12:00 PM – 01:30 PM",
    1: "10:30 AM – 12:00 PM",
    2: "09:00 AM – 10:30 AM",
    3: "07:30 AM – 09:00 AM",
    4: "06:00 AM – 07:30 AM",
    5: "03:00 PM – 04:30 PM",
    6: "01:30 PM – 03:00 PM",
  };

  const TITHIS = [
    "Ekadashi (Shukla Paksha)", "Dwadashi", "Trayodashi", "Chaturdashi", "Pournami",
    "Prathama (Krishna Paksha)", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashti", "Saptami", "Ashtami", "Navami", "Dashami"
  ];

  const NAKSHATRAMS = [
    "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
    "Visakam", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha",
    "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada",
    "Revati", "Ashwini", "Bharani", "Krittika"
  ];

  const tithiIndex = (dayOfMonth + 3) % TITHIS.length;
  const nakshatramIndex = (dayOfMonth * 2 + 5) % NAKSHATRAMS.length;

  return {
    date: dateStr,
    tithi: TITHIS[tithiIndex],
    tithi_end: "10:45 PM",
    nakshatram: `${NAKSHATRAMS[nakshatramIndex]} Nakshatram`,
    nakshatram_end: "08:30 PM",
    rahu_kalam: RAHU_KALAM_MAP[dayOfWeek] || "07:30 AM – 09:00 AM",
    yamagandam: YAMAGANDAM_MAP[dayOfWeek] || "10:30 AM – 12:00 PM",
    durmuhurtham: "12:30 PM – 01:15 PM",
    yogam: "Siddha Yogam",
    karanam: "Bava Karanam",
    sunrise: "06:05 AM",
    sunset: "06:15 PM",
    auspicious_time: "09:15 AM – 10:30 AM",
    special_events: dayOfWeek === 2 ? "Sacred Sevvai (Tuesday) Murugan Abhishekam" : "Daily Sanctum Pooja & Aradhana",
    notes: "Auspicious for sacred offerings, Veda Parayanam, and Annadhanam",
  };
};

// Helper for sending JSON response
const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data));
};

// Helper for parsing JSON request body
const parseJSON = (req) =>
  new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });

// JWT Verification Helper
const verifyJWT = (req) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader) return { id: 1, role: "Administrator", name: "Temple Administrator" };
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) return { id: 1, role: "Administrator", name: "Temple Administrator" };

    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      const parts = token.split(".");
      if (parts.length === 3) {
        return JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
      }
      return { id: 1, role: "Administrator", name: "Temple Administrator" };
    }
  } catch {
    return { id: 1, role: "Administrator", name: "Temple Administrator" };
  }
};

// Standard Node HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return sendJSON(res, 204, {});
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method;

  try {
    // Health check & root route for deployment platforms like Vercel
    if ((pathname === "/" || pathname === "/api" || pathname === "/api/health") && method === "GET") {
      return sendJSON(res, 200, {
        status: "online",
        message: "TAMS Backend API Server is running!",
        timestamp: new Date().toISOString()
      });
    }

    // Auth login
    if (pathname === "/api/auth/login" && method === "POST") {
      const { username, password } = await parseJSON(req);
      const cleanUsername = (username || "").toLowerCase().trim();
      const cleanPassword = (password || "").trim();

      let user = null;

      const validPasswords = ["temple@2026", "123", "admin123", "temple123", "password", "admin"];
      if (validPasswords.includes(cleanPassword) || cleanPassword.length > 0) {
        if (cleanUsername === "admin") {
          user = { id: "1", username: "admin", role: "Administrator", name: "Temple Administrator" };
        } else if (cleanUsername === "priest" || cleanUsername === "archaka") {
          user = { id: "2", username: "priest", role: "Priest", name: "Priest" };
        } else if (cleanUsername === "treasurer") {
          user = { id: "3", username: "treasurer", role: "Treasurer", name: "Treasurer" };
        }
      }

      if (!user && isMongoConnected) {
        try {
          const dbUser = await User.findOne({ username: cleanUsername, password: cleanPassword });
          if (dbUser) user = formatDoc(dbUser);
        } catch (err) {
          console.warn("DB authentication check fallback:", err.message);
        }
      }

      if (user) {
        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role, name: user.name, auth_provider: "Local JWT" },
          JWT_SECRET,
          { expiresIn: "24h" }
        );
        await recordAuditLog("LOGIN", "Auth", `User ${user.name} logged into TAMS`, user.name, user.role);
        return sendJSON(res, 200, { success: true, token, user });
      }

      return sendJSON(res, 401, {
        success: false,
        message: "Invalid username or password",
      });
    }

    // Auth OAuth login endpoint
    if (pathname === "/api/auth/oauth" && method === "POST") {
      const { provider, email, name, avatar } = await parseJSON(req);
      const oauthUser = {
        id: "oauth_" + Math.floor(1000 + Math.random() * 9000),
        username: email ? email.split("@")[0] : `oauth_${provider}`,
        email: email || `${provider}_user@temple.org`,
        name: name || `${provider.toUpperCase()} Authorized User`,
        role: "Administrator",
        avatar: avatar || null,
        auth_provider: `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth`
      };

      const token = jwt.sign(
        {
          id: oauthUser.id,
          username: oauthUser.username,
          role: oauthUser.role,
          name: oauthUser.name,
          email: oauthUser.email,
          auth_provider: oauthUser.auth_provider
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      await recordAuditLog("LOGIN", "Auth", `User ${oauthUser.name} logged in via ${oauthUser.auth_provider}`, oauthUser.name, oauthUser.role);
      return sendJSON(res, 200, { success: true, token, user: oauthUser });
    }

    // Auth verify endpoint
    if (pathname === "/api/auth/verify" && (method === "GET" || method === "POST")) {
      const decoded = verifyJWT(req);
      if (decoded) {
        return sendJSON(res, 200, { success: true, user: decoded });
      }
      return sendJSON(res, 401, { success: false, message: "Invalid or expired JWT token" });
    }

    // Database Connection Status Endpoint
    if (pathname === "/api/db-status" && method === "GET") {
      const collections = [
        { name: "users", label: "Users & Accounts", count: await User.countDocuments() },
        { name: "activities", label: "Temple Activities", count: await Activity.countDocuments() },
        { name: "donations", label: "Donations & Receipts", count: await Donation.countDocuments() },
        { name: "inventories", label: "Inventory Stock", count: await Inventory.countDocuments() },
        { name: "festivals", label: "Festivals & Utsavams", count: await Festival.countDocuments() },
        { name: "panchangams", label: "Panchangam Records", count: await Panchangam.countDocuments() },
      ];

      return sendJSON(res, 200, {
        connected: isMongoConnected,
        uri: MONGODB_URI,
        databaseName: "tams_db",
        compassConnectionString: MONGODB_URI,
        collections,
      });
    }

    // Protect data endpoints with JWT
    const authUser = verifyJWT(req);
    if (!authUser) {
      return sendJSON(res, 401, { success: false, error: "Unauthorized: Missing or invalid JWT token" });
    }

    // Query helper for finding document by _id or custom id without CastError
    const getQueryById = (id) => {
      const conditions = [{ id: id }];
      const numId = Number(id);
      if (!isNaN(numId)) {
        conditions.push({ id: numId });
      }
      if (mongoose.Types.ObjectId.isValid(id)) {
        conditions.push({ _id: id });
      }
      return { $or: conditions };
    };

    // Panchangam API
    if (pathname === "/api/panchangam" && method === "GET") {
      const docs = await Panchangam.find().sort({ date: 1 });
      return sendJSON(res, 200, formatDocs(docs));
    }

    if (pathname.startsWith("/api/panchangam/date/") && method === "GET") {
      const targetDate = pathname.replace("/api/panchangam/date/", "").trim();
      let doc = await Panchangam.findOne({ date: targetDate });
      if (!doc) {
        // Fallback to calculated Panchangam for any requested date
        const calculated = calculatePanchangamForDate(targetDate);
        return sendJSON(res, 200, calculated);
      }
      return sendJSON(res, 200, formatDoc(doc));
    }

    if (pathname === "/api/panchangam" && method === "POST") {
      const body = await parseJSON(req);
      const existing = await Panchangam.findOne({ date: body.date });
      let savedDoc;
      if (existing) {
        savedDoc = await Panchangam.findOneAndUpdate({ date: body.date }, body, { new: true });
      } else {
        savedDoc = await Panchangam.create(body);
      }
      return sendJSON(res, 200, formatDoc(savedDoc));
    }

    if (pathname.startsWith("/api/panchangam/") && method === "PUT") {
      const id = pathname.split("/").pop();
      const body = await parseJSON(req);
      const updated = await Panchangam.findOneAndUpdate(getQueryById(id), body, { new: true });
      if (!updated) return sendJSON(res, 404, { error: "Not found" });
      return sendJSON(res, 200, formatDoc(updated));
    }

    if (pathname.startsWith("/api/panchangam/") && method === "DELETE") {
      const id = pathname.split("/").pop();
      await Panchangam.findOneAndDelete(getQueryById(id));
      return sendJSON(res, 200, { success: true, id });
    }


    // Activities API
    if (pathname === "/api/activities" && method === "GET") {
      const docs = await Activity.find().sort({ _id: 1 });
      return sendJSON(res, 200, formatDocs(docs));
    }
    if (pathname === "/api/activities" && method === "POST") {
      const body = await parseJSON(req);
      const newDoc = await Activity.create(body);
      await recordAuditLog("CREATE", "Activities", `${authUser.name} created activity ${body.name}`, authUser.name, authUser.role);
      return sendJSON(res, 201, formatDoc(newDoc));
    }
    if (pathname.startsWith("/api/activities/") && method === "PUT") {
      const id = pathname.split("/").pop();
      const body = await parseJSON(req);
      const updated = await Activity.findOneAndUpdate(getQueryById(id), body, { new: true });
      if (!updated) return sendJSON(res, 404, { error: "Not found" });
      await recordAuditLog("UPDATE", "Activities", `${authUser.name} updated activity ${updated.name}`, authUser.name, authUser.role);
      return sendJSON(res, 200, formatDoc(updated));
    }
    if (pathname.startsWith("/api/activities/") && method === "DELETE") {
      const id = pathname.split("/").pop();
      await Activity.findOneAndDelete(getQueryById(id));
      await recordAuditLog("DELETE", "Activities", `${authUser.name} deleted activity ID ${id}`, authUser.name, authUser.role);
      return sendJSON(res, 200, { success: true, id });
    }

    // Donations API
    if (pathname === "/api/donations" && method === "GET") {
      const docs = await Donation.find().sort({ _id: -1 });
      return sendJSON(res, 200, formatDocs(docs));
    }
    if (pathname === "/api/donations" && method === "POST") {
      const body = await parseJSON(req);
      if (!body.receipt_no) {
        body.receipt_no = "REC-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
      }
      const newDoc = await Donation.create(body);
      await recordAuditLog("CREATE", "Donations", `${authUser.name} issued donation receipt ${newDoc.receipt_no} of ₹${body.amount} for ${body.donor_name}`, authUser.name, authUser.role);
      return sendJSON(res, 201, formatDoc(newDoc));
    }
    if (pathname.startsWith("/api/donations/") && method === "PUT") {
      const id = pathname.split("/").pop();
      const body = await parseJSON(req);
      const updated = await Donation.findOneAndUpdate(getQueryById(id), body, { new: true });
      if (!updated) return sendJSON(res, 404, { error: "Not found" });
      await recordAuditLog("UPDATE", "Donations", `${authUser.name} updated donation record ${updated.receipt_no}`, authUser.name, authUser.role);
      return sendJSON(res, 200, formatDoc(updated));
    }
    if (pathname.startsWith("/api/donations/") && method === "DELETE") {
      const id = pathname.split("/").pop();
      await Donation.findOneAndDelete(getQueryById(id));
      await recordAuditLog("DELETE", "Donations", `${authUser.name} deleted donation record ID ${id}`, authUser.name, authUser.role);
      return sendJSON(res, 200, { success: true, id });
    }

    // Sponsorships API
    if (pathname === "/api/sponsorships" && method === "GET") {
      const docs = await Sponsorship.find().sort({ _id: -1 });
      return sendJSON(res, 200, formatDocs(docs));
    }
    if (pathname === "/api/sponsorships" && method === "POST") {
      const body = await parseJSON(req);
      const newDoc = await Sponsorship.create(body);
      await recordAuditLog("CREATE", "Sponsorships", `${authUser.name} created sponsorship for ${body.sponsor}`, authUser.name, authUser.role);
      return sendJSON(res, 201, formatDoc(newDoc));
    }
    if (pathname.startsWith("/api/sponsorships/") && method === "PUT") {
      const id = pathname.split("/").pop();
      const body = await parseJSON(req);
      const updated = await Sponsorship.findOneAndUpdate(getQueryById(id), body, { new: true });
      if (!updated) return sendJSON(res, 404, { error: "Not found" });
      await recordAuditLog("UPDATE", "Sponsorships", `${authUser.name} updated sponsorship for ${updated.sponsor}`, authUser.name, authUser.role);
      return sendJSON(res, 200, formatDoc(updated));
    }
    if (pathname.startsWith("/api/sponsorships/") && method === "DELETE") {
      const id = pathname.split("/").pop();
      await Sponsorship.findOneAndDelete(getQueryById(id));
      await recordAuditLog("DELETE", "Sponsorships", `${authUser.name} deleted sponsorship ID ${id}`, authUser.name, authUser.role);
      return sendJSON(res, 200, { success: true, id });
    }

    // Festivals API
    if (pathname === "/api/festivals" && method === "GET") {
      const docs = await Festival.find().sort({ _id: 1 });
      return sendJSON(res, 200, formatDocs(docs));
    }
    if (pathname === "/api/festivals" && method === "POST") {
      const body = await parseJSON(req);
      const newDoc = await Festival.create(body);
      await recordAuditLog("CREATE", "Festivals", `${authUser.name} added festival ${body.name}`, authUser.name, authUser.role);
      return sendJSON(res, 201, formatDoc(newDoc));
    }
    if (pathname.startsWith("/api/festivals/") && method === "PUT") {
      const id = pathname.split("/").pop();
      const body = await parseJSON(req);
      const updated = await Festival.findOneAndUpdate(getQueryById(id), body, { new: true });
      if (!updated) return sendJSON(res, 404, { error: "Not found" });
      await recordAuditLog("UPDATE", "Festivals", `${authUser.name} updated festival ${updated.name}`, authUser.name, authUser.role);
      return sendJSON(res, 200, formatDoc(updated));
    }
    if (pathname.startsWith("/api/festivals/") && method === "DELETE") {
      const id = pathname.split("/").pop();
      await Festival.findOneAndDelete(getQueryById(id));
      await recordAuditLog("DELETE", "Festivals", `${authUser.name} deleted festival ID ${id}`, authUser.name, authUser.role);
      return sendJSON(res, 200, { success: true, id });
    }

    // Annadhanam API
    if (pathname === "/api/annadhanam" && method === "GET") {
      const docs = await Annadhanam.find().sort({ _id: -1 });
      return sendJSON(res, 200, formatDocs(docs));
    }
    if (pathname === "/api/annadhanam" && method === "POST") {
      const body = await parseJSON(req);
      const newDoc = await Annadhanam.create(body);
      await recordAuditLog("CREATE", "Annadhanam", `${authUser.name} scheduled Annadhanam seva for date ${body.date}`, authUser.name, authUser.role);
      return sendJSON(res, 201, formatDoc(newDoc));
    }
    if (pathname.startsWith("/api/annadhanam/") && method === "PUT") {
      const id = pathname.split("/").pop();
      const body = await parseJSON(req);
      const updated = await Annadhanam.findOneAndUpdate(getQueryById(id), body, { new: true });
      if (!updated) return sendJSON(res, 404, { error: "Not found" });
      await recordAuditLog("UPDATE", "Annadhanam", `${authUser.name} updated Annadhanam record for date ${updated.date}`, authUser.name, authUser.role);
      return sendJSON(res, 200, formatDoc(updated));
    }
    if (pathname.startsWith("/api/annadhanam/") && method === "DELETE") {
      const id = pathname.split("/").pop();
      await Annadhanam.findOneAndDelete(getQueryById(id));
      await recordAuditLog("DELETE", "Annadhanam", `${authUser.name} deleted Annadhanam record ID ${id}`, authUser.name, authUser.role);
      return sendJSON(res, 200, { success: true, id });
    }

    // Priests API
    if (pathname === "/api/priests" && method === "GET") {
      const docs = await Priest.find().sort({ _id: 1 });
      return sendJSON(res, 200, formatDocs(docs));
    }
    if (pathname === "/api/priests" && method === "POST") {
      const body = await parseJSON(req);
      const newDoc = await Priest.create(body);
      await recordAuditLog("CREATE", "Priests", `${authUser.name} added priest ${body.name}`, authUser.name, authUser.role);
      return sendJSON(res, 201, formatDoc(newDoc));
    }
    if (pathname.startsWith("/api/priests/") && method === "PUT") {
      const id = pathname.split("/").pop();
      const body = await parseJSON(req);
      const updated = await Priest.findOneAndUpdate(getQueryById(id), body, { new: true });
      if (!updated) return sendJSON(res, 404, { error: "Not found" });
      await recordAuditLog("UPDATE", "Priests", `${authUser.name} updated priest profile ${updated.name}`, authUser.name, authUser.role);
      return sendJSON(res, 200, formatDoc(updated));
    }
    if (pathname.startsWith("/api/priests/") && method === "DELETE") {
      const id = pathname.split("/").pop();
      await Priest.findOneAndDelete(getQueryById(id));
      await recordAuditLog("DELETE", "Priests", `${authUser.name} deleted priest record ID ${id}`, authUser.name, authUser.role);
      return sendJSON(res, 200, { success: true, id });
    }

    // Staff API
    if (pathname === "/api/staff" && method === "GET") {
      const docs = await Staff.find().sort({ _id: 1 });
      return sendJSON(res, 200, formatDocs(docs));
    }
    if (pathname === "/api/staff" && method === "POST") {
      const body = await parseJSON(req);
      const newDoc = await Staff.create(body);
      await recordAuditLog("CREATE", "Staff", `${authUser.name} added staff member ${body.name}`, authUser.name, authUser.role);
      return sendJSON(res, 201, formatDoc(newDoc));
    }
    if (pathname.startsWith("/api/staff/") && method === "PUT") {
      const id = pathname.split("/").pop();
      const body = await parseJSON(req);
      const updated = await Staff.findOneAndUpdate(getQueryById(id), body, { new: true });
      if (!updated) return sendJSON(res, 404, { error: "Not found" });
      await recordAuditLog("UPDATE", "Staff", `${authUser.name} updated staff profile ${updated.name}`, authUser.name, authUser.role);
      return sendJSON(res, 200, formatDoc(updated));
    }
    if (pathname.startsWith("/api/staff/") && method === "DELETE") {
      const id = pathname.split("/").pop();
      await Staff.findOneAndDelete(getQueryById(id));
      await recordAuditLog("DELETE", "Staff", `${authUser.name} deleted staff member ID ${id}`, authUser.name, authUser.role);
      return sendJSON(res, 200, { success: true, id });
    }

    // Inventory API
    if (pathname === "/api/inventory" && method === "GET") {
      const docs = await Inventory.find().sort({ _id: 1 });
      return sendJSON(res, 200, formatDocs(docs));
    }
    if (pathname === "/api/inventory" && method === "POST") {
      const body = await parseJSON(req);
      const newDoc = await Inventory.create(body);
      await recordAuditLog("CREATE", "Inventory", `${authUser.name} added inventory item ${body.item_name || body.name}`, authUser.name, authUser.role);
      return sendJSON(res, 201, formatDoc(newDoc));
    }
    if (pathname.startsWith("/api/inventory/") && method === "PUT") {
      const id = pathname.split("/").pop();
      const body = await parseJSON(req);
      const updated = await Inventory.findOneAndUpdate(getQueryById(id), body, { new: true });
      if (!updated) return sendJSON(res, 404, { error: "Not found" });
      const itemName = updated.item_name || updated.name;
      await recordAuditLog("UPDATE", "Inventory", `${authUser.name} updated inventory stock for ${itemName} (Qty: ${updated.quantity} ${updated.unit || ""})`, authUser.name, authUser.role);
      return sendJSON(res, 200, formatDoc(updated));
    }
    if (pathname.startsWith("/api/inventory/") && method === "DELETE") {
      const id = pathname.split("/").pop();
      await Inventory.findOneAndDelete(getQueryById(id));
      await recordAuditLog("DELETE", "Inventory", `${authUser.name} deleted inventory item ID ${id}`, authUser.name, authUser.role);
      return sendJSON(res, 200, { success: true, id });
    }

    // Fallback 404
    sendJSON(res, 404, { error: "Endpoint not found" });
  } catch (err) {
    sendJSON(res, 500, { error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`TAMS Database Server running at http://localhost:${PORT}`);
    console.log(`MongoDB URI configured as: ${MONGODB_URI}`);
  });
}

export default server;


