import mongoose from "mongoose"
import bcryptjs from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: String,
  role: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    default: "patient",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  discriminatorKey: 'role',
  collection: 'users'
})

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  try {
    const salt = await bcryptjs.genSalt(10)
    this.password = await bcryptjs.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return bcryptjs.compare(password, this.password)
}

// Methods from interface
userSchema.methods.login = function() {
  return { userId: this.userId, role: this.role, name: this.name }
}

userSchema.methods.updateProfile = async function(updates) {
  Object.assign(this, updates)
  return this.save()
}

userSchema.methods.deleteProfile = async function() {
  return this.deleteOne()
}

export default mongoose.model("User", userSchema)
