import mongoose from "mongoose";

type connectionObject = {
  isConnected?: number;
};

const connection: connectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI! || "");

    connection.isConnected = db.connections[0].readyState;

    console.log(db);
    console.log(db.connections);

    console.log("DB Connected");
  } catch (error) {
    console.log("DB Connection Error", error);

    process.exit(1);
  }
}

export default dbConnect;
