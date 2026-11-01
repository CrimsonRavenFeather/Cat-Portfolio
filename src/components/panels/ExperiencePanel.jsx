import { experience } from '../../content/portfolio.js';

// Each "book" gets a spine colour, like the shelf in the room.
const SPINES = ['#c8554a', '#e8b84a', '#5b7fb8', '#4f9a4a', '#9a6bc0', '#e08a4a'];

export default function ExperiencePanel() {
  return (
    <div className="stack">
      <p className="lead">Where I have worked, newest first.</p>
      <ol className="books">
        {experience.map((job, i) => (
          <li key={`${job.company}-${job.period}`} className="book" style={{ '--spine': SPINES[i % SPINES.length] }}>
            <div className="book-head">
              <h3>{job.role}</h3>
              <span className="period">{job.period}</span>
            </div>
            <p className="muted">
              {job.company}
              {job.location ? ` - ${job.location}` : ''}
            </p>
            <ul className="bullets">
              {job.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
