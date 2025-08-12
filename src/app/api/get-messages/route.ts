import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { User } from "next-auth"
import mongoose, { mongo } from "mongoose"
import { use } from "react"


export async function GET(request: Request) {
    dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user

    if (!session || !session.user) {
        return Response.json(
            { success: false,
              message: "You must be logged in to get messages." 
            },
            {
                status: 401
            }
        )
    }

    const userId = new mongoose.Types.ObjectId(user.id)

    try {
        const user = await UserModel.aggregate([
            {
                 $match: { _id: userId }
            },
            {
                $unwind: '$messages'
            },
            {
                $sort: { 'messages.createdAt': -1 }
            },
            {
                $group: { _id: '$_id', messages: { $push: '$messages' } }
            }
        ])
        if(!user || user.length === 0) {
            return Response.json(
                { success: false,
                  message: "No messages found for this user."
                },
                {
                    status: 404
                }
            )
        }
        return Response.json(
            { success: true,
              messages: user[0].messages
            },
            {                
                status: 200
            }
        )
        
    } catch (error) {
        console.log("Error getting messages:", error)
        return Response.json(
            { success: false,
              message: "Failed to get messages."
            },
            {
                status: 500
            }
        )
        
    }

    
}