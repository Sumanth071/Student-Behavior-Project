import mongoose from "mongoose";

const globalConnection = globalThis;

if (!globalConnection.mongooseConnection) {
  globalConnection.mongooseConnection = {
    connection: null,
    promise: null,
  };
}

const connectDB = async () => {
  try {
    if (globalConnection.mongooseConnection.connection) {
      return globalConnection.mongooseConnection.connection;
    }

    if (!globalConnection.mongooseConnection.promise) {
      globalConnection.mongooseConnection.promise = mongoose
        .connect(process.env.MONGO_URI)
        .then((connection) => {
          console.log(`MongoDB connected: ${connection.connection.host}`);
          return connection;
        });
    }

    globalConnection.mongooseConnection.connection =
      await globalConnection.mongooseConnection.promise;

    return globalConnection.mongooseConnection.connection;
  } catch (error) {
    globalConnection.mongooseConnection.promise = null;
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

export default connectDB;
