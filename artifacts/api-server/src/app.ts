import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

/* ─── Production static file serving ─────────────────────────────────────── */

const LANDING_DIST = path.resolve(__dirname, "../../landing-page/dist/public");
const APP_DIST     = path.resolve(__dirname, "../../gaming-lounge/dist/public");

const landingBuilt = fs.existsSync(path.join(LANDING_DIST, "index.html"));
const appBuilt     = fs.existsSync(path.join(APP_DIST,     "index.html"));

function serveLanding(res: express.Response): boolean {
  const idx = path.join(LANDING_DIST, "index.html");
  if (fs.existsSync(idx)) { res.sendFile(idx); return true; }
  return false;
}

function serveApp(res: express.Response): boolean {
  const idx = path.join(APP_DIST, "index.html");
  if (fs.existsSync(idx)) { res.sendFile(idx); return true; }
  return false;
}

/* ─── Static assets — must be registered BEFORE any SPA fallback routes ──── */

// /assets/* — serve landing-page assets first, then gaming-lounge assets.
// Both apps build with base "/", so their hashed filenames never collide.
// express.static calls next() automatically when a file is not found.
if (landingBuilt) {
  app.use("/assets", express.static(path.join(LANDING_DIST, "assets")));
}
if (appBuilt) {
  app.use("/assets", express.static(path.join(APP_DIST, "assets")));
}

// /landing-page/* — legacy Replit dev-proxy path; also covers
// /landing-page/assets/* for builds done with BASE_PATH=/landing-page/
if (landingBuilt) {
  app.use("/landing-page", express.static(LANDING_DIST));
}

/* ─── App (gaming-lounge) SPA routes ─────────────────────────────────────── */
const APP_ROUTE_PREFIXES = [
  "/login",
  "/dashboard",
  "/sessions",
  "/pos",
  "/kds",
  "/orders",
  "/menu",
  "/inventory",
  "/shifts",
  "/payments",
  "/users",
  "/audit",
  "/settings",
  "/finance",
  "/performance",
  "/recipes",
  "/bookings",
  "/discounts",
  "/unauthorized",
  "/admin",
  "/print-qr",
  "/print-all-qr",
  "/qr",
  "/public-menu",
  "/user-guide-scripts",
];

for (const prefix of APP_ROUTE_PREFIXES) {
  app.get(prefix, (_req, res, next) => {
    if (!serveApp(res)) next();
  });
  app.get(`${prefix}/*splat`, (_req, res, next) => {
    if (!serveApp(res)) next();
  });
}

/* ─── Landing-page SPA fallback ───────────────────────────────────────────── */
app.get("/landing-page/*splat", (_req, res, next) => {
  if (!serveLanding(res)) next();
});

/* ─── Root → landing page ─────────────────────────────────────────────────── */
app.get("/", (_req, res) => {
  if (!serveLanding(res)) {
    res.redirect(301, "/landing-page/");
  }
});

export default app;
