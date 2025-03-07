import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModal from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  console.log(session);

  const user: User = session?.user;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    // Use aggregation to fetch and sort messages
    const user = await UserModal.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    // Check if user has messages
    if (user.length === 0) {
      return Response.json(
        {
          success: false,
          message: "No messages found",
        },
        { status: 404 }
      );
    }

    // Return sorted messages
    return Response.json(
      {
        success: true,

        messages: user[0].messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in getting messages", error);
    return Response.json(
      {
        success: false,
        message: "Unexpected network error",
      },
      { status: 500 }
    );
  }
}
