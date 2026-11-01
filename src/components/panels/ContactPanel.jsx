import { useState } from 'react';
import { contact } from '../../content/portfolio.js';

export default function ContactPanel() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked (e.g. insecure context); the mailto link still works.
    }
  };

  return (
    <div className="stack">
      <p className="lead">{contact.note}</p>

      <div className="card">
        <h3>Email</h3>
        <p className="email">{contact.email}</p>
        <div className="row">
          <a className="btn btn-primary" href={`mailto:${contact.email}`}>
            Send an email
          </a>
          <button className="btn" onClick={copyEmail} aria-live="polite">
            {copied ? 'Copied!' : 'Copy address'}
          </button>
        </div>
      </div>

      <ul className="cards">
        {contact.links.map((l) => (
          <li key={l.label} className="card">
            <h3>{l.label}</h3>
            <p className="muted">{l.handle}</p>
            <div className="row">
              <a className="btn btn-small" href={l.url} target="_blank" rel="noreferrer">
                Open
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
