import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8
    },
    location: {
      type: String,
      trim: true
    },
    profilePhoto: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['volunteer', 'nonprofit'],
      required: [true, 'Role is required']
    },
    // Volunteer-specific fields
    school: {
      type: String,
      trim: true
    },
    skills: {
      type: [String],
      default: []
    },
    resume: {
      type: String, // PDF link
      default: ''
    },
    volunteerForm: {
      type: String, // PDF link
      default: ''
    },
    // Nonprofit-specific fields
    organizationDescription: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    socialLinks: {
      type: Map,
      of: String,
      default: {}
    },
    typicalVolunteerHours: {
      type: String,
      trim: true
    },
    organizationLogo: {
      type: String,
      default: ''
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.toPublicJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
