import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { success } from "zod";

export async function POST(request: Request) {
    await dbConnect()

    try {
        const {username , email , password} = await request.json()
        

    } catch (error) {
        console.error("Error during user registration:", error);
        return Response.json(
            {
                success: false,
                message: "An error occurred during registration. Please try again later."
            },
            {
                status: 500
            }
        )
    }

}