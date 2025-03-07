import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const isCodeValid = user.verifyCode === code;

    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        { success: true, message: "Code verified" },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        { success: false, message: "Code expired,please signup again" },
        { status: 400 }
      );
    } else {
      return Response.json(
        { success: false, message: "Invalid code" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying code:", error);

    return Response.json(
      { success: false, message: "Error verifying code" },
      { status: 500 }
    );
  }
}
