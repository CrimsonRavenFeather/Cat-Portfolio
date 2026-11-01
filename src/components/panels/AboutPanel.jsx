import { about, profile } from '../../content/portfolio.js';

export default function AboutPanel() {
  return (
    <div className="stack">
      <div className="about-top">
        <img className="pixelated about-photo" src={about.photo} alt={about.photoAlt} />
        <div className="stack">
          <h3>{profile.name}</h3>
          <p className="muted">{profile.title}</p>
          <dl className="facts">
            {about.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {about.paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}

      <h3>Skills</h3>
      <ul className="tags">
        {about.skills.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
