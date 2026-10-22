const Client = require('../models/client');
const Project = require('../models/project');

const createClient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      address,
      billingAddress,
      industry,
      website,
      contactPerson,
      notes
    } = req.body;

    // Check if client with same email already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: 'Client with this email already exists' });
    }

    const client = await Client.create({
      name,
      email,
      phone,
      company,
      address,
      billingAddress,
      industry,
      website,
      contactPerson,
      notes,
      createdBy: req.user.id
    });

    res.status(201).json({ message: 'Client created successfully', client });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create client', error: err.message });
  }
};

const getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { status, search } = req.query;

    const filter = { createdBy: req.user.id };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Client.countDocuments(filter);

    // Get project count for each client
    const clientsWithProjectCount = await Promise.all(
      clients.map(async (client) => {
        const projectCount = await Project.countDocuments({ clientId: client._id });
        return {
          ...client.toObject(),
          projectCount
        };
      })
    );

    res.status(200).json({
      clients: clientsWithProjectCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch clients', error: err.message });
  }
};

const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Get projects for this client
    const projects = await Project.find({ clientId: id })
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      client,
      projects
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch client', error: err.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      company,
      address,
      billingAddress,
      industry,
      website,
      contactPerson,
      notes,
      status
    } = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== client.email) {
      const existingClient = await Client.findOne({ email });
      if (existingClient) {
        return res.status(400).json({ message: 'Client with this email already exists' });
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        company,
        address,
        billingAddress,
        industry,
        website,
        contactPerson,
        notes,
        status
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Client updated successfully', client: updatedClient });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update client', error: err.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if client has projects
    const projectCount = await Project.countDocuments({ clientId: id });
    if (projectCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete client with active projects',
        projectCount
      });
    }

    await Client.findByIdAndDelete(id);

    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete client', error: err.message });
  }
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
};
