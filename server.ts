import express from "express";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: "student-sync-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      sameSite: "none",
      httpOnly: true,
    },
  })
);

// Google Auth Setup
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Service Account Credentials
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');

const getSheetsClient = () => {
  if (!SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_KEY) {
    throw new Error("Service Account credentials missing");
  }

  const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: SERVICE_ACCOUNT_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: "v4", auth });
};

// Auth Routes (Simplified for Admin Login)
app.get("/api/auth/status", (req, res) => {
  const missing = [];
  if (!SERVICE_ACCOUNT_EMAIL) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  if (!SERVICE_ACCOUNT_KEY) missing.push("GOOGLE_SERVICE_ACCOUNT_KEY");
  if (!SHEET_ID) missing.push("GOOGLE_SHEET_ID");
  
  res.json({ 
    isAuthenticated: missing.length === 0,
    missing: missing
  });
});

// Student API Routes
app.get("/api/students", async (req, res) => {
  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A2:BZ",
    });

    const rows = response.data.values || [];
    const students = rows.map((row, index) => ({
      id: index + 2,
      admissionId: row[0] || '',
      fullName: row[1] || '',
      gender: row[2] || '',
      age: row[3] || '',
      qualification: row[4] || '',
      medium: row[5] || '',
      contactNo: row[6] || '',
      whatsappNo: row[7] || '',
      city: row[8] || '',
      state: row[9] || '',
      payments: row.slice(10, 50), // 10 payments * 4 fields = 40 fields
      totalFees: row[50] || '0',
      discount: row[51] || '0',
      balanceDue: row[52] || '0',
      status: row[53] || 'Confirm',
    }));

    res.json(students);
  } catch (error: any) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/students", async (req, res) => {
  const student = req.body;
  const row = [
    student.admissionId,
    student.fullName,
    student.gender,
    student.age,
    student.qualification,
    student.medium,
    student.contactNo,
    student.whatsappNo,
    student.city,
    student.state,
    ...student.payments, // Array of 40 values
    student.totalFees,
    student.discount,
    student.balanceDue,
    student.status,
  ];

  try {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A2",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error adding student:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/students/:row", async (req, res) => {
  const rowNum = req.params.row;
  const student = req.body;
  const row = [
    student.admissionId,
    student.fullName,
    student.gender,
    student.age,
    student.qualification,
    student.medium,
    student.contactNo,
    student.whatsappNo,
    student.city,
    student.state,
    ...student.payments,
    student.received_ac,
    student.totalFees,
    student.discount,
    student.balanceDue,
    student.status,
  ];

  try {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!A${rowNum}:BZ${rowNum}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error updating student:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/students/:row", async (req, res) => {
  const rowNum = parseInt(req.params.row);

  try {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: "ROWS",
                startIndex: rowNum - 1,
                endIndex: rowNum,
              },
            },
          },
        ],
      },
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting student:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
