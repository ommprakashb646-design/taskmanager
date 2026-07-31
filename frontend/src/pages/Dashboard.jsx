import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import './Dashboard.css';

const EMPTY_FORM = { title: '', description: '', due_date: '', priority: 'medium' };
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export default function Dashboard() {
  useDocumentTitle('Dashboard');

  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const { username, logout } = useAuth();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await client.get('/tasks/');
      setTasks(res.data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const payload = { ...form, due_date: form.due_date || null };
    try {
      if (editingId) {
        await client.patch(`/tasks/${editingId}/`, payload);
      } else {
        await client.post('/tasks/', payload);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      await fetchTasks();
    } catch {
      setFormError('Could not save that task. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(task) {
    setEditingId(task.id);
    setFormError('');
    setForm({
      title: task.title,
      description: task.description,
      due_date: task.due_date || '',
      priority: task.priority,
    });
    document.getElementById('task-title')?.focus();
  }

  function cancelEdit() {
    setEditingId(null);
    setFormError('');
    setForm(EMPTY_FORM);
  }

  async function toggleComplete(task) {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await client.patch(`/tasks/${task.id}/`, { completed: !task.completed });
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t))
      );
    }
  }

  async function deleteTask(id) {
    if (!window.confirm('Delete this task? This can\'t be undone.')) return;
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await client.delete(`/tasks/${id}/`);
    } catch {
      setTasks(previous);
    }
  }

  function resetFilters() {
    setSearch('');
    setPriorityFilter('all');
    setStatusFilter('all');
    setSortBy('priority');
  }

  const visibleTasks = useMemo(() => {
    let result = tasks;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (statusFilter === 'open') {
      result = result.filter((t) => !t.completed);
    } else if (statusFilter === 'completed') {
      result = result.filter((t) => t.completed);
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'priority') {
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      }
      if (sortBy === 'due') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return result;
  }, [tasks, search, priorityFilter, statusFilter, sortBy]);

  const openCount = tasks.filter((t) => !t.completed).length;
  const filtersActive =
    search.trim() !== '' || priorityFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="dash">
      <nav className="dash-nav">
        <Link to="/" className="dash-logo">Tasklist</Link>
        <div className="dash-nav-right">
          <span className="dash-welcome">Hi, {username}</span>
          <button className="dash-logout" onClick={logout}>Log out</button>
        </div>
      </nav>

      <main className="dash-main">
        <div className="dash-heading">
          <p className="dash-eyebrow">
            {loading ? 'Loading…' : openCount === 0 ? 'All clear' : `${openCount} open`}
          </p>
          <h1>Your list for today</h1>
        </div>

        <form className="dash-form" onSubmit={handleSubmit}>
          <div className="dash-form-row">
            <input
              id="task-title"
              className="dash-input title-input"
              placeholder="What needs doing?"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
            />
            <input
              className="dash-input"
              placeholder="Add a note (optional)"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
          <div className="dash-form-row secondary">
            <input
              className="dash-input date-input"
              type="date"
              value={form.due_date}
              onChange={(e) => updateField('due_date', e.target.value)}
            />
            <select
              className="dash-select"
              value={form.priority}
              onChange={(e) => updateField('priority', e.target.value)}
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <button type="submit" className="dash-submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add task'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="dash-cancel">
                Cancel
              </button>
            )}
          </div>
          {formError && <p className="dash-error">{formError}</p>}
        </form>

        {!loading && !loadError && tasks.length > 0 && (
          <div className="dash-toolbar">
            <input
              className="dash-search"
              type="search"
              placeholder="Search your list…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="dash-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              className="dash-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All tasks</option>
              <option value="open">Open</option>
              <option value="completed">Completed</option>
            </select>
            <select
              className="dash-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="priority">Sort: priority</option>
              <option value="due">Sort: due date</option>
              <option value="newest">Sort: newest</option>
            </select>
            {filtersActive && (
              <button type="button" className="dash-clear" onClick={resetFilters}>
                Clear
              </button>
            )}
          </div>
        )}

        {loading ? (
          <ul className="dash-list" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <li key={i} className="dash-item skeleton">
                <span className="skeleton-check" />
                <div className="dash-item-body">
                  <span className="skeleton-line" style={{ width: '55%' }} />
                  <span className="skeleton-line" style={{ width: '30%' }} />
                </div>
              </li>
            ))}
          </ul>
        ) : loadError ? (
          <div className="dash-empty">
            <p className="dash-empty-title">Couldn't load your list</p>
            <p className="dash-empty-sub">There was a problem reaching the server.</p>
            <button className="dash-retry" onClick={fetchTasks}>Try again</button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="dash-empty">
            <p className="dash-empty-title">Nothing on the list yet</p>
            <p className="dash-empty-sub">Add your first task above to get started.</p>
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="dash-empty">
            <p className="dash-empty-title">No tasks match</p>
            <p className="dash-empty-sub">Try a different search or clear your filters.</p>
            <button className="dash-retry" onClick={resetFilters}>Clear filters</button>
          </div>
        ) : (
          <ul className="dash-list">
            {visibleTasks.map((task) => (
              <li
                key={task.id}
                className={`dash-item priority-${task.priority} ${task.completed ? 'completed' : ''}`}
              >
                <button
                  className="dash-check"
                  onClick={() => toggleComplete(task)}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                />
                <div className="dash-item-body">
                  <strong>{task.title}</strong>
                  {task.description && <p>{task.description}</p>}
                  <div className="dash-item-meta">
                    <span className={`dash-badge badge-${task.priority}`}>{task.priority}</span>
                    {task.due_date && <span className="dash-date">Due {task.due_date}</span>}
                  </div>
                </div>
                <div className="dash-item-actions">
                  <button onClick={() => startEdit(task)}>Edit</button>
                  <button onClick={() => deleteTask(task.id)} className="dash-delete">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}