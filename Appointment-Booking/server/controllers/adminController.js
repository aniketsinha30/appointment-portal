// controllers/adminController
const User = require('../models/User');
const Service = require('../models/Service');

// @desc    Get all users and providers
// @route   GET /api/admin/users
// @access  Admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Approve a provider
// @route   PUT /api/admin/providers/:id/approve
// @access  Admin only
const approveProvider = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    if (provider.role !== 'provider') return res.status(400).json({ message: 'User is not a provider' });

    provider.isApproved = true;
    await provider.save();

    res.json({ message: 'Provider approved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Decline a provider (delete or keep as pending)
// @route   DELETE /api/admin/providers/:id/decline
// @access  Admin only
const declineProvider = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    if (provider.role !== 'provider') return res.status(400).json({ message: 'User is not a provider' });

    // You can choose to delete or just mark declined. Here, we delete.
    await provider.remove();

    res.json({ message: 'Provider declined and removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a new service
// @route   POST /api/admin/services
// @access  Admin only
const createService = async (req, res) => {
  const { name, description } = req.body;

  if (!name) return res.status(400).json({ message: 'Service name required' });

  try {
    const serviceExists = await Service.findOne({ name });
    if (serviceExists) return res.status(400).json({ message: 'Service already exists' });

    const service = await Service.create({ name, description });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a service
// @route   PUT /api/admin/services/:id
// @access  Admin only
const updateService = async (req, res) => {
  const { name, description } = req.body;

  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (name) service.name = name;
    if (description) service.description = description;

    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a service
// @route   DELETE /api/admin/services/:id
// @access  Admin only
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    await service.remove();
    res.json({ message: 'Service removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllUsers,
  approveProvider,
  declineProvider,
  createService,
  updateService,
  deleteService,
};
