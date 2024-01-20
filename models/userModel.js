const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  userType: { type: String, required: true },
  courses: [
    {
      courseID: {
        type: String,
      },
    },
  ],
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword.toString(), this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const sugar = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, sugar);
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
