import { useEffect, useState } from 'react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Todos = () => {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const load = () => api.get('/todos').then((res) => setTodos(res.data.todos));
  useEffect(() => { load(); }, []);
  const add = async (event) => { event.preventDefault(); if (!title.trim()) return; await api.post('/todos', { title }); setTitle(''); load(); };
  const toggle = async (todo) => { await api.put(`/todos/${todo._id}`, { completed: !todo.completed }); load(); };
  const remove = async (id) => { await api.delete(`/todos/${id}`); load(); };
  return <div className="min-h-screen bg-bg"><Navbar /><main className="max-w-3xl mx-auto px-6 py-10"><h1 className="text-3xl font-display font-700 text-ink">My todo</h1><p className="text-sm text-ink/50 mt-1 mb-8">A private list for everything outside your project tasks.</p><form onSubmit={add} className="flex gap-2 mb-6"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a todo..." className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg text-sm" /><button className="bg-match text-bg px-4 rounded-xl flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button></form><div className="glass-card rounded-2xl divide-y divide-border">{todos.length === 0 ? <p className="p-8 text-center text-sm text-ink/40">No todos yet.</p> : todos.map((todo) => <div key={todo._id} className="p-4 flex items-center gap-3"><button onClick={() => toggle(todo)} className={`w-6 h-6 rounded-full border flex items-center justify-center ${todo.completed ? 'bg-success border-success text-white' : 'border-border text-transparent'}`} title="Toggle completion"><Check className="w-4 h-4" /></button><span className={`flex-1 text-sm ${todo.completed ? 'line-through text-ink/40' : 'text-ink'}`}>{todo.title}</span><button onClick={() => remove(todo._id)} className="p-2 text-ink/30 hover:text-coral" title="Delete todo"><Trash2 className="w-4 h-4" /></button></div>)}</div></main></div>;
};
export default Todos;
