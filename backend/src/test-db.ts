import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("Testing MongoDB connection...");
console.log("MONGO_URI:", process.env.MONGO_URI);

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ MongoDB connection successful");
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({ test: String });
    const TestModel = mongoose.model('Test', TestSchema);
    
    const doc = await TestModel.create({ test: 'connection test' });
    console.log("✅ Test document created:", doc._id);
    
    await TestModel.deleteOne({ _id: doc._id });
    console.log("✅ Test document cleaned up");
    
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

testConnection();
