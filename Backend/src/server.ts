import express from "express";
import userRoutes from "./routes/customerRoutes";
import createRoutes from "./routes/UsersRoute";
import activeUser from "./routes/activeAccountRoute";
import "reflect-metadata";
import { AppPostgressSource } from "./config/data-source1";
import { AppMongoDBSource } from "./config/data-source2";
import cors from "cors";
import { hostname } from "os";
import * as dns from "dns";
import { config } from "dotenv";
config();

// import fcmRouter from "./routes/fcmRoute";
const app = express();
app.use((request, response, next) => {
  console.log("Request URL => ", request.headers.origin, " <=> ", request.url);
  next();
});

// Middleware for CORS
app.use(
  cors({
    origin: "*",
  })
);

// Middleware to parse JSON
app.use(express.json());

// Connect to databases
async function connectDatabases() {
  try {
    await AppPostgressSource.initialize();
    console.log("Postgres connected.");

    await AppMongoDBSource.initialize();
    console.log("MongoDB connected.");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

app.use("/api", userRoutes);
app.use("/api", createRoutes);
app.use("/api", activeUser);
// Redirect All Other URLs.
app.use("*", (req, res) => {
  const origin = req.headers.origin || req.headers.host || "No Origin";
  const url = req.url;

  res.status(404).json({
    Error: `Invalid Request => ${origin} <=> ${url}`,
  });
});

// Start the server
async function startServer() {
  await connectDatabases();
  const PORT: number = Number(process.env.Server_Port) || 3000;

  app.listen(PORT, "0.0.0.0", () => {
    const options = { family: 4 };
    dns.lookup(hostname(), options, async (err, addr) => {
      if (err) {
        console.error(err);
      } else {
        await console.log(`IPv4 address: http://${addr}:${PORT}`);
      }
    });
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Call the function to start the server
startServer();
