import Application from '../models/Application.model.js';
import Opportunity from '../models/Opportunity.model.js';

// @desc    Apply to an opportunity
// @route   POST /api/applications
// @access  Private (Volunteer only)
export const applyToOpportunity = async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can apply to opportunities' });
    }

    const { opportunity: opportunityId } = req.body;

    // Check if opportunity exists
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Check if opportunity is open
    if (opportunity.status !== 'open') {
      return res.status(400).json({ message: 'This opportunity is no longer open' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      opportunity: opportunityId,
      volunteer: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this opportunity' });
    }

    const application = await Application.create({
      opportunity: opportunityId,
      volunteer: req.user._id
    });

    const populatedApplication = await Application.findById(application._id)
      .populate('opportunity', 'title description category estimatedHours')
      .populate('volunteer', 'name username email school skills');

    res.status(201).json({ application: populatedApplication });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get volunteer's own applications
// @route   GET /api/applications/my
// @access  Private (Volunteer only)
export const getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can view their applications' });
    }

    const applications = await Application.find({ volunteer: req.user._id })
      .populate('opportunity', 'title description category estimatedHours status nonprofit')
      .populate('opportunity.nonprofit', 'name username organizationLogo')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applications for an opportunity
// @route   GET /api/applications/opportunity/:id
// @access  Private (Nonprofit only, own opportunities)
export const getOpportunityApplications = async (req, res) => {
  try {
    if (req.user.role !== 'nonprofit') {
      return res.status(403).json({ message: 'Only nonprofits can view applications' });
    }

    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (opportunity.nonprofit.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applications for this opportunity' });
    }

    const applications = await Application.find({ opportunity: req.params.id })
      .populate('volunteer', 'name username email school skills resume volunteerForm profilePhoto')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept an application
// @route   PUT /api/applications/:id/accept
// @access  Private (Nonprofit only)
export const acceptApplication = async (req, res) => {
  try {
    if (req.user.role !== 'nonprofit') {
      return res.status(403).json({ message: 'Only nonprofits can accept applications' });
    }

    const application = await Application.findById(req.params.id)
      .populate('opportunity');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.opportunity.nonprofit.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this application' });
    }

    application.status = 'accepted';
    application.reviewedAt = new Date();
    await application.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('volunteer', 'name username email school skills')
      .populate('opportunity', 'title description category estimatedHours');

    res.json({ application: populatedApplication });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject an application
// @route   PUT /api/applications/:id/reject
// @access  Private (Nonprofit only)
export const rejectApplication = async (req, res) => {
  try {
    if (req.user.role !== 'nonprofit') {
      return res.status(403).json({ message: 'Only nonprofits can reject applications' });
    }

    const application = await Application.findById(req.params.id)
      .populate('opportunity');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.opportunity.nonprofit.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this application' });
    }

    application.status = 'rejected';
    application.reviewedAt = new Date();
    await application.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('volunteer', 'name username email school skills')
      .populate('opportunity', 'title description category estimatedHours');

    res.json({ application: populatedApplication });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
