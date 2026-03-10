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

// Google OAuth Setup
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.APP_URL}/auth/callback`;
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Auth Routes
app.get("/api/auth/url", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/spreadsheets"],
    prompt: "consent",
  });
  res.json({ url });
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    // Store tokens in session or cookie
    (req.session as any).tokens = tokens;
    
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error getting tokens:", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/auth/status", (req, res) => {
  const tokens = (req.session as any).tokens;
  res.json({ isAuthenticated: !!tokens });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Helper to get Sheets API client
const getSheetsClient = (tokens: any) => {
  const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  client.setCredentials(tokens);
  return google.sheets({ version: "v4", auth: client });
};

// Student API Routes
app.get("/api/students", async (req, res) => {
  const tokens = (req.session as any).tokens;
  if (!tokens) return res.status(401).json({ error: "Unauthorized" });

  try {
    const sheets = getSheetsClient(tokens);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A2:AZ", // Adjust range as needed
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
  const tokens = (req.session as any).tokens;
  if (!tokens) return res.status(401).json({ error: "Unauthorized" });

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
    ...student.payments, // Array of 30 values
    student.totalFees,
    student.discount,
    student.balanceDue,
  ];

  try {
    const sheets = getSheetsClient(tokens);
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
  const tokens = (req.session as any).tokens;
  if (!tokens) return res.status(401).json({ error: "Unauthorized" });

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
    const sheets = getSheetsClient(tokens);
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
  const tokens = (req.session as any).tokens;
  if (!tokens) return res.status(401).json({ error: "Unauthorized" });

  const rowNum = parseInt(req.params.row);

  try {
    const sheets = getSheetsClient(tokens);
    // Deleting a row in Sheets API is more complex (requires batchUpdate)
    // For simplicity, we can just clear the row or use batchUpdate
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // Assuming first sheet
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
