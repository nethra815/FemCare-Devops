import mongoose from "mongoose"
import User from "./User.js"

const administratorSchema = new mongoose.Schema({
  adminId: {
    type: String,
    unique: true,
  },
})

// Methods specific to Administrator
administratorSchema.methods.addUser = async function(userData) {
  const User = mongoose.model('User')
  return User.create(userData)
}

administratorSchema.methods.removeUser = async function(userId) {
  const User = mongoose.model('User')
  return User.findOneAndDelete({ userId })
}

administratorSchema.methods.manageSystem = async function(action, data) {
  // System management operations
  return { action, data, managedBy: this.adminId }
}

const Administrator = User.discriminator("admin", administratorSchema)

export default Administrator
