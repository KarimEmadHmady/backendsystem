import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // await mongoose.connect(process.env.MONGO_URL);
        await mongoose.connect("mongodb+srv://karimkarim20444:SYCpX41Qql4hXoCt@collections.zekp5.mongodb.net/products?retryWrites=true&w=majority&appName=collections");
        console.log("Successfully connected to MongoDB 👍");
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
