import mongoose from "mongoose";

const connectDB = async (uri) => {
    try {
        const conn = await mongoose.connect(uri, {
            maxPoolSize: 10,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        throw err;
    }
}

export default connectDB