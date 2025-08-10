import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/Schemas/signUpSchema"


const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {

    await dbConnect()

    try {
        const { searchParams } = new URL(request.url)
        const queryParam = {
            username: searchParams.get("username")
        }
        //validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam)
        
        console.log(result) //TO Remove later

        if (!result.success) {
            const usernameError = result.error.format().username?._errors || []
            return Response.json(
                {
                    success: false,
                    message: usernameError.length > 0 ? usernameError[0] : "Invalid username format."
                },
                { status: 400 }
            )
        }

        const { username } = result.data;
        const existingUser = await UserModel.findOne({ username, isVerified: true });
        if (existingUser) {
            return Response.json(
                {
                    success: false,
                    message: "Username already exists."
                },
                { status: 409 }
            );
        }
        return Response.json(
            {
                success: true,
                message: "Username is available."
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error checking username:", error)
        return Response.json(
            {
                success: false,
                message: "An error occurred while checking the username."
            },
            { status: 500 });
    }
}