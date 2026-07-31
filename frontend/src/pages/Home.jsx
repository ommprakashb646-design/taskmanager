import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import './Home.css';

const DEMO_TASKS = [
  { id: 1, title: 'Reply to client email', priority: 'high' },
  { id: 2, title: 'Sketch out Q3 roadmap', priority: 'medium' },
  { id: 3, title: 'Book dentist appointment', priority: 'low' },
  { id: 4, title: 'Water the plants', priority: 'low' },
];

export default function Home() {
  useDocumentTitle('');
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="home">
      <nav className="home-nav">
        <span className="home-logo">Tasklist</span>
        <div className="home-nav-links">
          <Link to="/login" className="nav-link">Log in</Link>
          <Link to="/register" className="nav-cta">Get started</Link>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">A list that keeps its shape</p>
          <h1>
            Everything you meant<br />to do, <em>in one place.</em>
          </h1>
          <p className="hero-sub">
            No boards, no columns, no setup. Write down what needs doing,
            mark it off when it's done, and see what's actually urgent today.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-primary">Create your list</Link>
            <Link to="/login" className="btn-secondary">I already have an account</Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="demo-card">
            <div className="demo-card-header">
              <span className="demo-dot" />
              <span className="demo-dot" />
              <span className="demo-dot" />
              <span className="demo-card-title">Today</span>
            </div>
            <ul className="demo-list">
              {DEMO_TASKS.map((task, i) => (
                <li
                  key={task.id}
                  className={`demo-item priority-${task.priority}`}
                  style={{ animationDelay: `${i * 1.1 + 1}s` }}
                >
                  <span className="demo-check" />
                  <span className="demo-title">{task.title}</span>
                  <span className={`demo-badge badge-${task.priority}`}>{task.priority}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <section className="features">
        <div className="feature">
          <h3>Priority, not just a pile</h3>
          <p>Tag anything low, medium, or high, and the list sorts itself so today's fires stay on top.</p>
        </div>
        <div className="feature">
          <h3>Due dates that don't hide</h3>
          <p>Every task keeps its date in view, so nothing quietly slips past without you noticing.</p>
        </div>
        <div className="feature">
          <h3>Just yours</h3>
          <p>Your list is signed in and private to you — log in from anywhere and it's exactly as you left it.</p>
        </div>
      </section>

      <footer className="home-footer">
        <span>Tasklist</span>
        <Link to="/register">Start your list →</Link>
      </footer>
    </div>
  );
}