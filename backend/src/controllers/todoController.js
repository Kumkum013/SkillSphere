const Todo = require('../models/todo');

const listTodos = async (req, res) => {
  try { res.json({ todos: await Todo.find({ userId: req.user.id }).sort({ completed: 1, createdAt: -1 }) }); }
  catch (err) { res.status(500).json({ message: 'Failed to fetch todos', error: err.message }); }
};
const createTodo = async (req, res) => {
  try { if (!req.body.title?.trim()) return res.status(400).json({ message: 'Title is required' }); res.status(201).json({ todo: await Todo.create({ userId: req.user.id, title: req.body.title }) }); }
  catch (err) { res.status(500).json({ message: 'Failed to create todo', error: err.message }); }
};
const updateTodo = async (req, res) => {
  try { const todo = await Todo.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { $set: req.body }, { new: true, runValidators: true }); if (!todo) return res.status(404).json({ message: 'Todo not found' }); res.json({ todo }); }
  catch (err) { res.status(500).json({ message: 'Failed to update todo', error: err.message }); }
};
const deleteTodo = async (req, res) => {
  try { const result = await Todo.deleteOne({ _id: req.params.id, userId: req.user.id }); if (!result.deletedCount) return res.status(404).json({ message: 'Todo not found' }); res.json({ message: 'Todo deleted' }); }
  catch (err) { res.status(500).json({ message: 'Failed to delete todo', error: err.message }); }
};
module.exports = { listTodos, createTodo, updateTodo, deleteTodo };
