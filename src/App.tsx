import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ListTodo, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  AlertCircle, 
  Moon, 
  Sun, 
  Edit3, 
  X, 
  ChevronDown,
  Clock,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Priority = 'High' | 'Medium' | 'Low';
type Category = 'Work' | 'Personal' | 'Study' | 'Other';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: Category;
  priority: Priority;
  dueDate: string;
  createdAt: number;
}

const CATEGORIES: Category[] = ['Work', 'Personal', 'Study', 'Other'];
const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [inputCategory, setInputCategory] = useState<Category>('Personal');
  const [inputPriority, setInputPriority] = useState<Priority>('Medium');
  const [inputDueDate, setInputDueDate] = useState('');

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Completed'>('All');

  // Load from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow_pro_tasks');
    const savedTheme = localStorage.getItem('taskflow_theme');
    
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to parse tasks', e);
      }
    }
    
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('taskflow_pro_tasks', JSON.stringify(tasks));
      localStorage.setItem('taskflow_theme', isDarkMode ? 'dark' : 'light');
    }
  }, [tasks, isDarkMode, isLoaded]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const openAddModal = () => {
    setEditingTask(null);
    setInputValue('');
    setInputCategory('Personal');
    setInputPriority('Medium');
    setInputDueDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setInputValue(task.text);
    setInputCategory(task.category);
    setInputPriority(task.priority);
    setInputDueDate(task.dueDate);
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? {
        ...t,
        text: inputValue.trim(),
        category: inputCategory,
        priority: inputPriority,
        dueDate: inputDueDate,
      } : t));
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        text: inputValue.trim(),
        completed: false,
        category: inputCategory,
        priority: inputPriority,
        dueDate: inputDueDate,
        createdAt: Date.now(),
      };
      setTasks([newTask, ...tasks]);
    }
    
    setIsModalOpen(false);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || task.category === filterCategory;
      const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
      const matchesStatus = 
        filterStatus === 'All' ? true :
        filterStatus === 'Active' ? !task.completed :
        task.completed;
      
      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    }).sort((a, b) => {
      // Sort by completion, then by priority, then by date
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      
      const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      
      return b.createdAt - a.createdAt;
    });
  }, [tasks, searchQuery, filterCategory, filterPriority, filterStatus]);

  const completionPercentage = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
    : 0;

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case 'High': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'Medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'Low': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getCategoryColor = (c: Category) => {
    switch(c) {
      case 'Work': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
      case 'Personal': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      case 'Study': return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20';
      case 'Other': return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-[#0F172A] text-slate-200' : 'bg-[#F8FAFC] text-slate-800'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <ListTodo className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">TaskFlow <span className="text-blue-600">Pro</span></h1>
            </motion.div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your life with precision.</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleDarkMode}
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              {isDarkMode ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
            </button>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 transition-all active:scale-95"
            >
              <Plus className="w-6 h-6" />
              <span>New Task</span>
            </button>
          </div>
        </header>

        {/* Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Your Progress
            </h2>
            <span className="text-2xl font-black text-blue-600">{completionPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
            />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {tasks.length === 0 
              ? "No tasks yet. Start by adding one!" 
              : completionPercentage === 100 
                ? "Excellent! You've completed everything." 
                : `You have ${tasks.filter(t => !t.completed).length} tasks remaining.`}
          </p>
        </motion.div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer shadow-sm"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer shadow-sm"
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Active', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                filterStatus === status 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-4 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className={`group relative flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all ${task.completed ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-center gap-4 flex-grow">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 transition-transform active:scale-90"
                    >
                      {task.completed ? (
                        <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 border-2 border-slate-200 dark:border-slate-600 rounded-full group-hover:border-blue-400 transition-colors" />
                      )}
                    </button>
                    
                    <div className="flex-grow min-w-0">
                      <h3 
                        onClick={() => toggleTask(task.id)}
                        className={`text-lg font-semibold truncate cursor-pointer transition-all ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}
                      >
                        {task.text}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(task.category)}`}>
                          <Tag className="w-3 h-3" />
                          {task.category}
                        </span>
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                          <AlertCircle className="w-3 h-3" />
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">No tasks found</h3>
                <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} TaskFlow Pro • Advanced Productivity Suite</p>
        </footer>
      </div>

      {/* Modal Backdrop */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6 z-50"
            >
              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black">{editingTask ? 'Edit Task' : 'New Task'}</h2>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveTask} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Task Description</label>
                      <input
                        autoFocus
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="What needs to be done?"
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-lg font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Category</label>
                        <div className="relative">
                          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select 
                            value={inputCategory}
                            onChange={(e) => setInputCategory(e.target.value as Category)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Priority</label>
                        <div className="relative">
                          <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select 
                            value={inputPriority}
                            onChange={(e) => setInputPriority(e.target.value as Priority)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                          >
                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Due Date (Optional)</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="date"
                          value={inputDueDate}
                          onChange={(e) => setInputDueDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="flex-[2] px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all disabled:opacity-50"
                      >
                        {editingTask ? 'Save Changes' : 'Create Task'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
