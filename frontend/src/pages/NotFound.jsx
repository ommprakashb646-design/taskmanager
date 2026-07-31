import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import './NotFound.css';

export default function NotFound() {
  useDocumentTitle('Page not found');

  return (
    <div className="notfound">
      <p className="notfound-code">404</p>
      <h1>This page isn't on the list</h1>
      <p className="notfound-sub">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="notfound-link">Back to home</Link>
    </div>
  );
}