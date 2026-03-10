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
  // If service account is configured, we consider the "Google connection" part done
  const isConfigured = !!(SERVICE_ACCOUNT_EMAIL && SERVICE_ACCOUNT_KEY && SHEET_ID);
  res.json({ isAuthenticated: isConfigured });
});

// Student API Routes
app.get("/api/students", async (req, res) => {
  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A2:AZ",
    });

    const rows = response.data.values || [];
    // Map rows to objects based on your column structure
    const students = rows.map((row, index) => ({
      id: index + 2, // Row number for easy updates
      admissionId: row[0],
      fullName: row[1],
      qualification: row[2],
      gender: row[3],
      age: row[4],
      country: row[5],
      medium: row[6],
      contactNo: row[7],
      whatsappNo: row[8],
      state: row[9],
      city: row[10],
      status: row[11],
      payments: row.slice(12, 42), // 10 payments * 3 fields = 30 fields
      totalFees: row[42],
      discount: row[43],
      balanceDue: row[44],
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
    student.qualification,
    student.gender,
    student.age,
    student.country,
    student.medium,
    student.contactNo,
    student.whatsappNo,
    student.state,
    student.city,
    student.status,
    ...student.payments,
    student.totalFees,
    student.discount,
    student.balanceDue,
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
    student.qualification,
    student.gender,
    student.age,
    student.country,
    student.medium,
    student.contactNo,
    student.whatsappNo,
    student.state,
    student.city,
    student.status,
    ...student.payments,
    student.totalFees,
    student.discount,
    student.balanceDue,
  ];

  try {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!A${rowNum}:AZ${rowNum}`,
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
