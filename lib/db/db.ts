import mongoose from "mongoose";

let isConnected: boolean = false;

declare global {
  var mongooseConnected: boolean | undefined;
}

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected || global.mongooseConnected) {
    console.log("DB already connected");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI || "", {
      dbName: "aicoursevisualizer",
    });

    isConnected = true;
    global.mongooseConnected = true;

    console.log("DB connected successfully");
  } catch (error) {
    console.error("DB connection error:", error);
  }
};
