import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Filter
} from 'lucide-react';
import api from '../services/api';

const FinancialDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then((res) => setNotificationsCount(res.data?.unreadCount || 0))
      .catch(() => {});
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsRes, clientsRes] = await Promise.all([
        api.get('/projects?scope=my'),
        api.get('/clients')
      ]);
      setProjects(projectsRes.data.projects || []);
      setClients(clientsRes.data.clients || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalActualCost = projects.reduce((sum, p) => sum + (p.actualCost || 0), 0);
  const totalEstimatedHours = projects.reduce((sum, p) => sum + (p.estimatedHours || 0), 0);
  const totalActualHours = projects.reduce((sum, p) => sum + (p.actualHours || 0), 0);

  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS');
  const completedProjects = projects.filter(p => p.status === 'COMPLETED');

  const getBudgetStatus = (project) => {
    if (!project.budget) return 'NO_BUDGET';
    const percentage = (project.actualCost / project.budget) * 100;
    if (percentage >= 100) return 'OVER_BUDGET';
    if (percentage >= 80) return 'NEAR_LIMIT';
    return 'ON_TRACK';
  };

  const getBudgetStatusColor = (status) => {
    switch (status) {
      case 'OVER_BUDGET': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60';
      case 'NEAR_LIMIT': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60';
      case 'ON_TRACK': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} notificationsCount={notificationsCount} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopNav onToggleSidebar={() => setSidebarOpen(true)} notificationsCount={notificationsCount} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
                  Financial Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
                  Track budgets, costs, and billing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-[#F1F5F9]"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-[#64748B] dark:text-[#94A3B8]">Total Budget</div>
                <DollarSign className="w-4 h-4 text-[#4F46E5]" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                ${totalBudget.toLocaleString()}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-[#64748B] dark:text-[#94A3B8]">Actual Cost</div>
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                ${totalActualCost.toLocaleString()}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-[#64748B] dark:text-[#94A3B8]">Budget Used</div>
                <PieChart className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                {totalBudget > 0 ? ((totalActualCost / totalBudget) * 100).toFixed(1) : 0}%
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-[#64748B] dark:text-[#94A3B8]">Active Projects</div>
                <BarChart3 className="w-4 h-4 text-[#4F46E5]" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                {activeProjects.length}
              </div>
            </div>
          </div>

          {/* Project Financials Table */}
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-4">Project Financials</h2>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">No projects yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                      <th className="pb-3 pr-4">Project</th>
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Budget</th>
                      <th className="pb-3 pr-4">Actual Cost</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => {
                      const budgetStatus = getBudgetStatus(project);
                      return (
                        <tr key={project._id} className="border-t border-[#E2E8F0] dark:border-[#263449]">
                          <td className="py-3 pr-4">
                            <div className="font-medium text-[#0F172A] dark:text-[#F1F5F9]">{project.title}</div>
                            <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                              {project.status}
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {project.projectType}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-sm text-[#0F172A] dark:text-[#F1F5F9]">
                            ${project.budget?.toLocaleString() || 'N/A'}
                          </td>
                          <td className="py-3 pr-4 text-sm text-[#0F172A] dark:text-[#F1F5F9]">
                            ${project.actualCost?.toLocaleString() || '0'}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getBudgetStatusColor(budgetStatus)}`}>
                              {budgetStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {project.invoiceStatus?.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Hours Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-4">Hours Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Estimated Hours</span>
                  <span className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    {totalEstimatedHours.toFixed(1)}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Actual Hours</span>
                  <span className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    {totalActualHours.toFixed(1)}h
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-[#4F46E5] h-2 rounded-full transition-all"
                    style={{ width: `${totalEstimatedHours > 0 ? (totalActualHours / totalEstimatedHours) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] text-right">
                  {totalEstimatedHours > 0 ? ((totalActualHours / totalEstimatedHours) * 100).toFixed(1) : 0}% used
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-4">Project Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">In Progress</span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {activeProjects.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Completed</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {completedProjects.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Total Projects</span>
                  <span className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    {projects.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FinancialDashboard;
