import mongoose from "mongoose";

type ConnectionType={
    isConnected: boolean
};

const connectionData: ConnectionType= {isConnected: false};

async function dbConnect(): Promise<void>
{
    if(connectionData.isConnected)
    {
        console.log("Already connected to the database");
        return;
    }

    try {
        const connectionInstance= await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);
        connectionData.isConnected = true;
        console.log("Database connected successfully:", connectionInstance.connection.host);
    } 
    catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

export default dbConnect;