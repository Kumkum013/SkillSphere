import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Play,
  Pause,
  Plus,
  Calendar,
  Filter,
  Trash2,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import api from '../services/api';

const TimeTracking = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [runningEntry, setRunningEntry] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedProject, setSelectedProject] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  const [manualEntry, setManualEntry] = useState({
    projectId: '',
    taskId: '',
    description: '',
    duration: 0,
    isBillable: true
  });

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then((res) => setNotificationsCount(res.data?.unreadCount || 0))
      .catch(() => {});
  }, []);

  const loadTimeEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/time-entries');
      setTimeEntries(res.data.timeEntries || []);
      
      // Check for running entry
      const running = res.data.timeEntries.find(e => e.status === 'RUNNING');
      if (running) {
        setRunningEntry(running);
      }
    } catch (err) {
      console.error('Failed to load time entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await api.get('/projects?scope=my');
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  useEffect(() => {
    loadTimeEntries();
    loadProjects();
  }, []);

  // Update elapsed time for running entry
  useEffect(() => {
    let interval;
    if (runningEntry) {
      interval = setInterval(() => {
        const now = new Date();
        const start = new Date(runningEntry.startTime);
        const elapsed = Math.floor((now - start) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [runningEntry]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const handleStartTimer = async () => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }
    try {
      const res = await api.post('/time-entries', {
        projectId: selectedProject,
        description: 'Work on project'
      });
      setRunningEntry(res.data.timeEntry);
      loadTimeEntries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start timer');
    }
  };

  const handleStopTimer = async () => {
    if (!runningEntry) return;
    try {
      await api.post(`/time-entries/${runningEntry._id}/stop`);
      setRunningEntry(null);
      setElapsedTime(0);
      loadTimeEntries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to stop timer');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;
    try {
      await api.delete(`/time-entries/${entryId}`);
      loadTimeEntries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete entry');
    }
  };

  const handleManualEntry = async (e) => {
    e.preventDefault();
    try {
      await api.post('/time-entries', {
        ...manualEntry,
        startTime: new Date(Date.now() - manualEntry.duration * 60 * 1000),
        endTime: new Date(),
        status: 'COMPLETED'
      });
      setShowManualEntry(false);
      setManualEntry({
        projectId: '',
        taskId: '',
        description: '',
        duration: 0,
        isBillable: true
      });
      loadTimeEntries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add time entry');
    }
  };

  const totalHours = timeEntries
    .filter(e => e.status === 'COMPLETED')
    .reduce((sum, e) => sum + e.duration / 60, 0);

  const billableHours = timeEntries
    .filter(e => e.status === 'COMPLETED' && e.isBillable)
    .reduce((sum, e) => sum + e.duration / 60, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} notificationsCount={notificationsCount} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopNav onToggleSidebar={() => setSidebarOpen(true)} notificationsCount={notificationsCount} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-[#818CF8] border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
                  Time Tracking
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
                  Track billable hours and project time
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowManualEntry(true)}
              className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Manual Entry
            </button>
          </div>

          {/* Timer Section */}
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  disabled={!!runningEntry}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-[#F1F5F9] disabled:opacity-50"
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0F172A] dark:text-[#F1F5F9] font-mono">
                    {runningEntry ? formatTime(elapsedTime) : '00:00:00'}
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {runningEntry ? 'Timer Running' : 'Timer Stopped'}
                  </div>
                </div>

                {runningEntry ? (
                  <button
                    onClick={handleStopTimer}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={handleStartTimer}
                    disabled={!selectedProject}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" />
                    Start
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5">
              <div className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-1">Total Hours</div>
              <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                {totalHours.toFixed(1)}h
              </div>
            </div>
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5">
              <div className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-1">Billable Hours</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {billableHours.toFixed(1)}h
              </div>
            </div>
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-5">
              <div className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-1">Non-Billable</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {(totalHours - billableHours).toFixed(1)}h
              </div>
            </div>
          </div>

          {/* Time Entries List */}
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-4">Recent Time Entries</h2>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : timeEntries.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">No time entries yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {timeEntries.map((entry) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          entry.status === 'RUNNING' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                          entry.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {entry.status}
                        </span>
                        {entry.isBillable && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Billable
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]">
                        {entry.description}
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        {entry.projectId?.title || 'Unknown Project'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                          {formatDuration(entry.duration)}
                        </div>
                        <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                          {new Date(entry.startTime).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {entry.status !== 'RUNNING' && (
                        <button
                          onClick={() => handleDeleteEntry(entry._id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {showManualEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#111827] rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-4">Add Manual Entry</h2>
            <form onSubmit={handleManualEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1">Project *</label>
                <select
                  required
                  value={manualEntry.projectId}
                  onChange={(e) => setManualEntry({ ...manualEntry, projectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-[#F1F5F9]"
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={manualEntry.description}
                  onChange={(e) => setManualEntry({ ...manualEntry, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-[#F1F5F9]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1">Duration (minutes) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={manualEntry.duration}
                  onChange={(e) => setManualEntry({ ...manualEntry, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#0F172A] text-sm text-[#0F172A] dark:text-[#F1F5F9]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="billable"
                  checked={manualEntry.isBillable}
                  onChange={(e) => setManualEntry({ ...manualEntry, isBillable: e.target.checked })}
                  className="w-4 h-4 rounded border-[#E2E8F0] dark:border-[#263449]"
                />
                <label htmlFor="billable" className="text-sm text-[#0F172A] dark:text-[#F1F5F9]">Billable</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowManualEntry(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#263449] text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold transition-colors"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TimeTracking;
