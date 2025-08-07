import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect()

    try {
        const {username , email , password} = await request.json()
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if(existingUserVerifiedByUsername){
            return Response.json(
                {
                    success: false,
                    message: "Username already exists. Please choose a different username."
                },
                {
                    status: 400
                }
            )
        }

        const existingUserByEmail = await UserModel.findOne({ email })

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json(
                    {
                        success: false,
                        message: "Email already exists. Please choose a different email."
                    },
                    {
                        status: 400
                    }
                )
            } else {
                const hashPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 36000000); // 1 hour expiry
                await existingUserByEmail.save();
            }

        } 
        else{
            const hashPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })
            await newUser.save();
        }
        
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if(!emailResponse.success){
            console.error("Email not sent:", emailResponse.message)
            return Response.json({
                success: false,
                message: emailResponse.message || "Failed to send verification email. Please try again later."
            },{
                status: 500
            })
        }
        return Response.json({
                success: true,
                message: "Registration successful! Please check your email to verify your account."
            },{
                status: 201
            })

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