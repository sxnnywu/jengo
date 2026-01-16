import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    skillsRequired: {
      type: [String],
      default: []
    },
    estimatedHours: {
      type: Number,
      required: [true, 'Estimated hours is required'],
      min: 1
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
    },
    nonprofit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Nonprofit is required']
    }
  },
  {
    timestamps: true
  }
);

// Index for better query performance
opportunitySchema.index({ nonprofit: 1, status: 1 });
opportunitySchema.index({ status: 1, createdAt: -1 });

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

export default Opportunity;
