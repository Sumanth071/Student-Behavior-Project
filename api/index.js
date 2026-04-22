import connectDB from "../server/src/config/db.js";
import app from "../server/src/app.js";
import User from "../server/src/models/User.js";
import { seedDatabase } from "../server/src/data/seed.js";

let seedPromise = null;

const ensureSeedData = async () => {
  if (process.env.AUTO_SEED !== "true") {
    return;
  }

  if (!seedPromise) {
    seedPromise = User.countDocuments().then(async (totalUsers) => {
      if (!totalUsers) {
        await seedDatabase({ reset: false, silent: true });
      }
    });
  }

  await seedPromise;
};

const buildExpressUrl = (url) => {
  const requestUrl = new URL(url, "http://localhost");
  const route = decodeURIComponent(requestUrl.searchParams.get("route") || "")
    .split("/")
    .filter(Boolean)
    .join("/");

  requestUrl.searchParams.delete("route");

  const path = route ? `/api/${route}` : "/api";
  const search = requestUrl.searchParams.toString();

  return `${path}${search ? `?${search}` : ""}`;
};

export default async function handler(req, res) {
  req.url = buildExpressUrl(req.url);
  await connectDB();
  await ensureSeedData();
  return app(req, res);
}
