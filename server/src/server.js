import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import { seedDatabase } from "./data/seed.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  if (process.env.AUTO_SEED === "true") {
    const totalUsers = await User.countDocuments();

    if (!totalUsers) {
      await seedDatabase({ reset: false, silent: true });
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

process.on("unhandledRejection", (error) => {
  console.error(`Unhandled rejection: ${error.message}`);
  process.exit(1);
});
