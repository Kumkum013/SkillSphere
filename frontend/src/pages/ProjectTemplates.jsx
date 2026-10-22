import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Clock
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import api from '../services/api';

const ProjectTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'ACADEMIC',
    category: 'WEB_DEVELOPMENT',
    defaultSkills: [{ skillName: '', weight: 1 }],
    defaultMilestones: [{ title: '', description: '', estimatedDays: 7 }],
    defaultBudget: 0,
    defaultBillingRate: 0,
    estimatedDuration: 30
  });

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then((res) => setNotificationsCount(res.data?.unreadCount || 0))
      .catch(() => {});
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/project-templates', {
        params: { type: filterType }
      });
      setTemplates(res.data.templates || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [filterType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await api.put(`/project-templates/${editingTemplate._id}`, formData);
      } else {
        await api.post('/project-templates', formData);
      }
      setShowModal(false);
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        type: 'ACADEMIC',
        category: 'WEB_DEVELOPMENT',
        defaultSkills: [{ skillName: '', weight: 1 }],
        defaultMilestones: [{ title: '', description: '', estimatedDays: 7 }],
        defaultBudget: 0,
        defaultBillingRate: 0,
        estimatedDuration: 30
      });
      loadTemplates();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save template');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      type: template.type,
      category: template.category,
      defaultSkills: template.defaultSkills || [{ skillName: '', weight: 1 }],
      defaultMilestones: template.defaultMilestones || [{ title: '', description: '', estimatedDays: 7 }],
      defaultBudget: template.defaultBudget || 0,
      defaultBillingRate: template.defaultBillingRate || 0,
      estimatedDuration: template.estimatedDuration || 30
    });
    setShowModal(true);
  };

  const handleDelete = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.delete(`/project-templates/${templateId}`);
      loadTemplates();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      const projectData = {
        title: `${template.name} - New Project`,
        description: template.description || '',
        requiredSkills: template.defaultSkills.map(s => ({ skillName: s.skillName, weight: s.weight })),
        projectType: template.type,
        budget: template.defaultBudget,
        billingRate: template.defaultBillingRate,
        milestones: template.defaultMilestones.map(m => ({
          title: m.title,
          description: m.description,
          dueDate: null,
          status: 'PENDING'
        }))
      };
      
      await api.post('/projects', projectData);
      alert('Project created from template successfully!');
      window.location.href = '/projects';
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project from template');
    }
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      defaultSkills: [...formData.defaultSkills, { skillName: '', weight: 1 }]
    });
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      defaultSkills: formData.defaultSkills.filter((_, i) => i !== index)
    });
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      defaultMilestones: [...formData.defaultMilestones, { title: '', description: '', estimatedDays: 7 }]
    });
  };

  const removeMilestone = (index) => {
    setFormData({
      ...formData,
      defaultMilestones: formData.defaultMilestones.filter((_, i) => i !== index)
    });
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} notificationsCount={notificationsCount} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopNav onToggleSidebar={() => setSidebarOpen(true)} notificationsCount={notificationsCount} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
                  Project Templates
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
                  Reusable project configurations
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </div>

          <div className="flex gap-4">
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-4 flex-1">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-[#F1F5F9]"
                />
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl px-4 py-2 text-sm text-[#0F172A] dark:text-[#F1F5F9]"
            >
              <option value="">All Types</option>
              <option value="ACADEMIC">Academic</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="INTERNAL">Internal</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 animate-pulse" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-2">No templates found</h3>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Create your first template to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-card-hover transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#0F172A] dark:text-[#F1F5F9]">{template.name}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {template.type}
                      </span>
                    </div>
                  </div>

                  {template.description && (
                    <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mb-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{template.estimatedDuration} days</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{template.defaultSkills?.length || 0} skills</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Use
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#111827] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-4">
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-[#F1F5F9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-[#F1F5F9]"
                  >
                    <option value="ACADEMIC">Academic</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="INTERNAL">Internal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-[#F1F5F9]"
                  >
                    <option value="WEB_DEVELOPMENT">Web Development</option>
                    <option value="MOBILE_APP">Mobile App</option>
                    <option value="DATA_SCIENCE">Data Science</option>
                    <option value="AI_ML">AI/ML</option>
                    <option value="CYBERSECURITY">Cybersecurity</option>
                    <option value="CLOUD">Cloud</option>
                    <option value="DEVOPS">DevOps</option>
                    <option value="RESEARCH">Research</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1">Duration (days)</label>
                  <input
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-[#F1F5F9]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-[#F1F5F9]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">Default Skills</label>
                  <button
                    type="button"
                    onClick={addSkill}
                    className="text-xs px-2 py-1 rounded-lg bg-[#4F46E5] text-white"
                  >
                    + Add Skill
                  </button>
                </div>
                {formData.defaultSkills.map((skill, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Skill name"
                      value={skill.skillName}
                      onChange={(e) => {
                        const newSkills = [...formData.defaultSkills];
                        newSkills[index].skillName = e.target.value;
                        setFormData({ ...formData, defaultSkills: newSkills });
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-[#F1F5F9]"
                    />
                    <input
                      type="number"
                      placeholder="Weight"
                      value={skill.weight}
                      onChange={(e) => {
                        const newSkills = [...formData.defaultSkills];
                        newSkills[index].weight = parseInt(e.target.value);
                        setFormData({ ...formData, defaultSkills: newSkills });
                      }}
                      className="w-20 px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-[#F1F5F9]"
                    />
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="px-2 py-2 rounded-lg bg-red-500 text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold transition-colors"
                >
                  {editingTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectTemplates;
