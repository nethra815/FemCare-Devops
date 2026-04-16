import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

async function cleanDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    const db = mongoose.connection.db

    // Drop all collections to start fresh
    const collections = await db.listCollections().toArray()
    
    for (const collection of collections) {
      await db.dropCollection(collection.name)
      console.log(`Dropped collection: ${collection.name}`)
    }

    console.log("\nDatabase cleaned successfully!")
    console.log("You can now start fresh with the updated schema.")
    process.exit(0)
  } catch (error) {
    console.error("Error cleaning database:", error)
    process.exit(1)
  }
}

cleanDatabase()
