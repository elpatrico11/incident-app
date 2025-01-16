const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Wyrażenie regularne dla hasła:
// - Minimum 12 znaków
// - Przynajmniej jedna mała litera, jedna duża litera oraz cyfra
// - Dozwolone: [A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{12,}$/;

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 100,
  },
  password: {
    type: String,
    required: true,
    minlength: 12,
    validate: {
      validator: function (v) {
        return passwordRegex.test(v);
      },
      message:
        "Hasło musi mieć co najmniej 12 znaków, zawierać małe i duże litery oraz cyfry, polskie znaki nie są dozwolone.",
    },
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to hash the password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
