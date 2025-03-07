import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signUpSchema } from "@/schemas/signUpSchema";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

const signupQuerySchema = z.object({
  username: signUpSchema.shape.username,
  email: signUpSchema.shape.email,
  password: signUpSchema.shape.password,
});

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();

    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        {
          status: 400,
        }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "Email already exists",
          },
          {
            status: 400,
          }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 360000);
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });

      const result = signupQuerySchema.safeParse({ username, email, password });

      if (!result.success) {
        const usernameErrors = result.error.format().username?._errors || [];

        const emailErrors = result.error.format().email?._errors || [];

        const passwordErrors = result.error.format().password?._errors || [];

        return Response.json({
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : emailErrors?.length > 0
                ? emailErrors.join(", ")
                : passwordErrors?.length > 0
                  ? passwordErrors.join(", ")
                  : "Invalid request body",
        });
      } else {
        await newUser.save();
      }
    }

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User created successfully,Please Verify Your email",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json(
      {
        success: false,
        message: "Error creating user",
      },
      {
        status: 500,
      }
    );
  }
}
