import { projects } from '../../content/portfolio.js';

export default function ProjectsPanel() {
  return (
    <div className="stack">
      <p className="lead">A few things I have built. Click through to see them live.</p>
      <ul className="cards">
        {projects.map((p) => (
          <li key={p.title} className="card">
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <ul className="tags">
              {p.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            {p.links?.length > 0 && (
              <div className="row">
                {p.links.map((l) => (
                  <a key={l.label} className="btn btn-small" href={l.url} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
