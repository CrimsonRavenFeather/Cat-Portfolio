import { profile, resume } from '../../content/portfolio.js';

/**
 * Opening the folder only shows this panel. The PDF is downloaded
 * exclusively when the visitor presses the button below.
 */
export default function ResumePanel() {
  return (
    <div className="stack">
      <div className="resume-preview">
        <div className="paper" aria-hidden="true">
          <div className="paper-name">{profile.name}</div>
          <div className="paper-title">{profile.title}</div>
          <div className="paper-line" />
          <div className="paper-line short" />
          <div className="paper-line" />
          <div className="paper-line short" />
        </div>
        <div className="stack">
          <h3>{profile.name} - Resume</h3>
          <p className="muted">PDF - updated {resume.updated}</p>
          <ul className="bullets">
            {resume.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="row">
        <a className="btn btn-primary" href={resume.file} download={resume.downloadName}>
          Download resume (PDF)
        </a>
        <a className="btn" href={resume.file} target="_blank" rel="noreferrer">
          Preview in new tab
        </a>
      </div>
    </div>
  );
}
