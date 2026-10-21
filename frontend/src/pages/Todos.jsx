import { useEffect, useState, useRef } from 'react';
import {
  ListTodo,
  ListChecks,
  Plus,
  CirclePlus,
  Check,
  Trash2,
  Loader2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { TodoEmptyIllustration } from '../components/DashboardIllustrations';
import api from '../services/api';

const Todos = () => {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  const load = () => {
    return api
      .get('/todos')
      .then((res) => {
        setTodos(res.data.todos || []);
      })
      .catch((err) => {
        console.error('Failed to load todos:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (event) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || submitting) return;

    try {
      setSubmitting(true);
      await api.post('/todos', { title: cleanTitle });
      setTitle('');
      await load();
    } catch (err) {
      console.error('Failed to add todo:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = async (todo) => {
    try {
      // Optimistic update for snappier UI
      setTodos((prev) =>
        prev.map((t) => (t._id === todo._id ? { ...t, completed: !todo.completed } : t))
      );
      await api.put(`/todos/${todo._id}`, { completed: !todo.completed });
      load();
    } catch (err) {
      console.error('Failed to toggle todo:', err);
      load();
    }
  };

  const remove = async (id) => {
    try {
      // Optimistic delete
      setTodos((prev) => prev.filter((t) => t._id !== id));
      await api.delete(`/todos/${id}`);
      load();
    } catch (err) {
      console.error('Failed to delete todo:', err);
      load();
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] transition-colors flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-[#4F46E5] dark:text-[#818CF8]">
                <ListTodo className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
                My Todo
              </h1>
            </div>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1.5">
              A private list for everything outside your project tasks.
            </p>
          </div>

          {/* Contextual Desktop Label */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] text-xs font-medium text-[#64748B] dark:text-[#94A3B8] shadow-2xs">
            <ListChecks className="w-3.5 h-3.5 text-[#4F46E5] dark:text-[#818CF8]" />
            <span>Your personal checklist</span>
          </div>
        </div>

        {/* Add Todo Input Card */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-4 sm:p-5 shadow-xs mb-6 transition-colors">
          <form onSubmit={add} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a todo..."
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-[#F8FAFC] dark:bg-[#172033] text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#94A3B8] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium shadow-xs transition-colors shrink-0"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Add task</span>
            </button>
          </form>
        </div>

        {/* Todo List Card or Empty State */}
        {loading ? (
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-12 text-center shadow-xs">
            <Loader2 className="w-7 h-7 text-[#4F46E5] dark:text-[#818CF8] animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Loading your todos...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl p-8 sm:p-12 text-center shadow-xs min-h-[360px] sm:min-h-[390px] flex flex-col items-center justify-center transition-colors">
            <TodoEmptyIllustration className="w-24 h-24 mb-5" />
            <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
              No todos yet
            </h3>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] max-w-sm mb-6">
              Add your first task to keep track of the little things.
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#263449] bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] shadow-2xs hover:border-[#CBD5E1] dark:hover:border-slate-700 transition-colors"
            >
              <CirclePlus className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8]" />
              <span>Create your first todo</span>
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263449] rounded-2xl shadow-xs overflow-hidden transition-colors">
            {/* Header with stats */}
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] dark:border-[#263449] bg-[#F8FAFC]/70 dark:bg-[#172033]/40 flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
              <span className="font-medium">
                {completedCount} of {totalCount} completed
              </span>
              <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-[#4F46E5] dark:bg-[#818CF8] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-[#E2E8F0] dark:divide-[#263449]">
              {todos.map((todo) => {
                const isDone = Boolean(todo.completed);
                return (
                  <div
                    key={todo._id}
                    className="group px-4 sm:px-5 py-3.5 flex items-center gap-3.5 hover:bg-[#F8FAFC] dark:hover:bg-[#172033]/60 transition-colors"
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggle(todo)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        isDone
                          ? 'bg-[#4F46E5] border-[#4F46E5] dark:bg-[#6366F1] dark:border-[#6366F1] text-white shadow-2xs'
                          : 'border-slate-300 dark:border-slate-600 hover:border-[#4F46E5] dark:hover:border-[#818CF8] bg-white dark:bg-[#111827] text-transparent'
                      }`}
                      title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                      aria-label={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                    >
                      <Check className={`w-3.5 h-3.5 stroke-[3] ${isDone ? 'opacity-100' : 'opacity-0 group-hover:opacity-30 text-[#4F46E5]'}`} />
                    </button>

                    {/* Task Title */}
                    <span
                      onClick={() => toggle(todo)}
                      className={`flex-1 text-sm cursor-pointer select-none transition-all ${
                        isDone
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-[#0F172A] dark:text-[#F1F5F9]'
                      }`}
                    >
                      {todo.title}
                    </span>

                    {/* Delete Action */}
                    <button
                      type="button"
                      onClick={() => remove(todo._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete todo"
                      aria-label="Delete todo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Todos;
