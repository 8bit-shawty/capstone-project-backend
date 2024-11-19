import mongoose from "mongoose";

export async function connect(){
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`Connected to Mongdb ${conn.connections[0].name}`)
    } catch (error) {
        console.error(error)
    }
}