import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: [true, 'Opportunity is required']
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Volunteer is required']
    },
    status: {
      type: String,
      enum: ['applied', 'accepted', 'rejected'],
      default: 'applied'
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index to prevent duplicate applications
applicationSchema.index({ opportunity: 1, volunteer: 1 }, { unique: true });

// Index for better query performance
applicationSchema.index({ volunteer: 1, status: 1 });
applicationSchema.index({ opportunity: 1, status: 1 });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
