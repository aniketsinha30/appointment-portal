// controllers/serviceController
const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public (or Admin only if needed)
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Admin only
const createService = async (req, res) => {
  const { name, description } = req.body;

  if (!name) return res.status(400).json({ message: 'Service name is required' });

  try {
    const serviceExists = await Service.findOne({ name });

    if (serviceExists) {
      return res.status(400).json({ message: 'Service already exists' });
    }

    const service = await Service.create({ name, description });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
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
// @route   DELETE /api/services/:id
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
  getAllServices,
  createService,
  updateService,
  deleteService,
};
