const ProjectTemplate = require('../models/projectTemplate');

const createTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      category,
      defaultSkills,
      defaultMilestones,
      defaultBudget,
      defaultBillingRate,
      estimatedDuration
    } = req.body;

    const template = await ProjectTemplate.create({
      name,
      description,
      type,
      category,
      defaultSkills: defaultSkills || [],
      defaultMilestones: defaultMilestones || [],
      defaultBudget: defaultBudget || 0,
      defaultBillingRate: defaultBillingRate || 0,
      estimatedDuration: estimatedDuration || 30,
      createdBy: req.user.id
    });

    res.status(201).json({ message: 'Template created', template });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create template', error: err.message });
  }
};

const getTemplates = async (req, res) => {
  try {
    const { type, category } = req.query;
    const filter = { isActive: true };

    if (type) filter.type = type;
    if (category) filter.category = category;

    const templates = await ProjectTemplate.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ templates });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch templates', error: err.message });
  }
};

const getTemplateById = async (req, res) => {
  try {
    const template = await ProjectTemplate.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.status(200).json({ template });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch template', error: err.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const template = await ProjectTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    if (template.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only template creator can update' });
    }

    const {
      name,
      description,
      type,
      category,
      defaultSkills,
      defaultMilestones,
      defaultBudget,
      defaultBillingRate,
      estimatedDuration,
      isActive
    } = req.body;

    if (name) template.name = name;
    if (description !== undefined) template.description = description;
    if (type) template.type = type;
    if (category) template.category = category;
    if (defaultSkills !== undefined) template.defaultSkills = defaultSkills;
    if (defaultMilestones !== undefined) template.defaultMilestones = defaultMilestones;
    if (defaultBudget !== undefined) template.defaultBudget = defaultBudget;
    if (defaultBillingRate !== undefined) template.defaultBillingRate = defaultBillingRate;
    if (estimatedDuration !== undefined) template.estimatedDuration = estimatedDuration;
    if (isActive !== undefined) template.isActive = isActive;

    await template.save();

    res.status(200).json({ message: 'Template updated', template });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update template', error: err.message });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const template = await ProjectTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    if (template.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only template creator can delete' });
    }

    await ProjectTemplate.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Template deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete template', error: err.message });
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate
};
