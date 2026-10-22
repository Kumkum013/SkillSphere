import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  FileText,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import api from '../services/api';

const Reports = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then((res) => setNotificationsCount(res.data?.unreadCount || 0))
      .catch(() => {});
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsRes, clientsRes, timeRes] = await Promise.all([
        api.get('/projects?scope=my'),
        api.get('/clients'),
        api.get('/time-entries')
      ]);
      setProjects(projectsRes.data.projects || []);
      setClients(clientsRes.data.clients || []);
      setTimeEntries(timeRes.data.timeEntries || []);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate metrics
  const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalHoursLogged = timeEntries
    .filter(e => e.status === 'COMPLETED')
    .reduce((sum, e) => sum + e.duration / 60, 0);
  const billableHours = timeEntries
    .filter(e => e.status === 'COMPLETED' && e.isBillable)
    .reduce((sum, e) => sum + e.duration / 60, 0);
  const avgHourlyRate = totalHoursLogged > 0 ? totalRevenue / totalHoursLogged : 0;

  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;

  // Project profitability
  const projectProfitability = projects.map(p => ({
    title: p.title,
    budget: p.budget || 0,
    actualCost: p.actualCost || 0,
    profit: (p.budget || 0) - (p.actualCost || 0),
    margin: p.budget > 0 ? ((p.budget - p.actualCost) / p.budget * 100) : 0
  })).filter(p => p.budget > 0);

  // Client breakdown
  const clientStats = clients.map(client => {
    const clientProjects = projects.filter(p => p.clientId === client._id);
    return {
      name: client.name,
      projectCount: clientProjects.length,
      totalBudget: clientProjects.reduce((sum, p) => sum + (p.budget || 0), 0),
      activeProjects: clientProjects.filter(p => p.status === 'IN_PROGRESS').length
    };
  }).filter(c => c.projectCount > 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} notificationsCount={notificationsCount} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopNav onToggleSidebar={() => setSidebarOpen(true)} notificationsCount={notificationsCount} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
                  Reports & Analytics
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
                  Comprehensive project and team analytics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-[#F1F5F9]"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xs transition-all">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-[#64748B] dark:text-[#94A3B8]">Total Revenue</div>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                ${totalRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                +12.5% from last period
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-[#64748B] dark:text-[#94A3B8]">Hours Logged</div>
                <Clock className="w-4 h-4 text-[#4F46E5]" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                {totalHoursLogged.toFixed(1)}h
              </div>
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                {billableHours.toFixed(1)}h billable
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-[#64748B] dark:text-[#94A3B8]">Avg Hourly Rate</div>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                ${avgHourlyRate.toFixed(2)}/h
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                +8.2% from last period
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-[#64748B] dark:text-[#94A3B8]">Active Projects</div>
                <FileText className="w-4 h-4 text-[#4F46E5]" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                {activeProjects}
              </div>
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                {completedProjects} completed
              </div>
            </div>
          </div>

          {/* Project Profitability */}
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-4">Project Profitability</h2>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : projectProfitability.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">No projects with budget data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projectProfitability.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#0F172A] dark:text-[#F1F5F9]">{project.title}</span>
                      <span className={`font-semibold ${
                        project.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        ${project.profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          project.margin >= 0 ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(Math.abs(project.margin), 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
                      <span>Budget: ${project.budget.toLocaleString()}</span>
                      <span>Actual: ${project.actualCost.toLocaleString()}</span>
                      <span>Margin: {project.margin.toFixed(1)}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Client Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-4">Client Portfolio</h2>
              
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : clientStats.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">No client data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientStats.map((client, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[#0F172A] dark:text-[#F1F5F9]">{client.name}</span>
                        <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-700 dark:text-slate-300">
                          {client.projectCount} projects
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#64748B] dark:text-[#94A3B8]">Total Budget</span>
                        <span className="font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                          ${client.totalBudget.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#64748B] dark:text-[#94A3B8]">Active</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {client.activeProjects}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-6">
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-4">Time Utilization</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Billable vs Non-Billable</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {((billableHours / totalHoursLogged) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">Billable</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                        {((totalHoursLogged - billableHours) / totalHoursLogged * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">Non-Billable</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mt-2">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all"
                      style={{ width: `${(billableHours / totalHoursLogged) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#263449]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#64748B] dark:text-[#94A3B8]">Project Completion Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    {projects.length > 0 ? ((completedProjects / projects.length) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {completedProjects} of {projects.length} projects completed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
