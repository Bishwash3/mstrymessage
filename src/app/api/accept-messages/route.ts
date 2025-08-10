import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { User } from "next-auth"

export async function POST(request: Request) {
    dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user

    if(!session || session.user){
        return Response.json(
            { success: false,
              message: "You must be logged in to accept messages." 
            },
            {
                status: 401
            }
        )
    }

    const userId = user.id
    const { acceptMessages } = await request.json()
    
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            { userId },
            { isAcceptingMessages: acceptMessages },
            { new: true }
        )
        if (!updatedUser) {
            return Response.json(
                { success: false,
                  message: "User not found or update failed."
                },
                {
                    status: 404
                }
            )
        }
        return Response.json(
            { success: true,
              message: "Messages acceptance status updated successfully.",
              data: updatedUser
            },
            {
                status: 200
            }
        )
        
    } catch (error) {
        console.log("Error accepting messages:", error)
        return Response.json(
            { success: false,
                 message: "Failed to accept messages."
            },
            {
                status: 500
            }
        )
        
    }
}