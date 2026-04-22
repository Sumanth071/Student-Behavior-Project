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

export default async function handler(req, res) {
  await connectDB();
  await ensureSeedData();
  return app(req, res);
}
