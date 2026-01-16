import Opportunity from '../models/Opportunity.model.js';
import Application from '../models/Application.model.js';

// @desc    Create a new opportunity
// @route   POST /api/opportunities
// @access  Private (Nonprofit only)
export const createOpportunity = async (req, res) => {
  try {
    if (req.user.role !== 'nonprofit') {
      return res.status(403).json({ message: 'Only nonprofits can create opportunities' });
    }

    const opportunity = await Opportunity.create({
      ...req.body,
      nonprofit: req.user._id
    });

    res.status(201).json({ opportunity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Public
export const getOpportunities = async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const opportunities = await Opportunity.find(query)
      .populate('nonprofit', 'name username organizationLogo')
      .sort({ createdAt: -1 });

    res.json({ opportunities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
// @access  Public
export const getOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('nonprofit', 'name username organizationDescription organizationLogo website');

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    res.json({ opportunity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get nonprofit's own opportunities
// @route   GET /api/opportunities/my
// @access  Private (Nonprofit only)
export const getMyOpportunities = async (req, res) => {
  try {
    if (req.user.role !== 'nonprofit') {
      return res.status(403).json({ message: 'Only nonprofits can view their opportunities' });
    }

    const opportunities = await Opportunity.find({ nonprofit: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ opportunities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private (Nonprofit only, own opportunities)
export const updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (opportunity.nonprofit.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this opportunity' });
    }

    const updatedOpportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ opportunity: updatedOpportunity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private (Nonprofit only, own opportunities)
export const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (opportunity.nonprofit.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this opportunity' });
    }

    // Also delete all applications for this opportunity
    await Application.deleteMany({ opportunity: req.params.id });

    await Opportunity.findByIdAndDelete(req.params.id);

    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
