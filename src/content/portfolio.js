/**
 * ALL the text on the site lives here. Edit this file to make it yours -
 * no React or Phaser knowledge needed.
 */
const BASE = import.meta.env.BASE_URL;

export const profile = {
  name: 'Sahil',
  title: 'System Engineer',
  tagline: 'I build cozy, thoughtful things for the web.',
  petName: 'Chikki',
};

/** Laptop -> My projects */
export const projects = [
  {
    title: 'Ledger : Budget Tracker',
    description: `A personal budget tracker to manage my expenses (Currently only for personal use cause I don't have money to deploy it T_T)`,
    tags: ['Python', 'FastAPI', 'SQLAlchemy (async)', 'PostgreSQL (Supabase)','Git / Github', 'Docker', 'AWS (Lambda, API Gateway, IAM, SAM/CloudFormation)', 'React.js', 'Vercel'],
    links: [
      { label: 'Live demo', url: 'https://budget-tracker-red-xi.vercel.app/login' },
      { label: 'Source', url: 'https://github.com/CrimsonRavenFeather/Budget-Tracker' },
    ],
  },
  {
    title: 'My Portfolio (Ur currently viewing this)',
    description: `My cute ${profile.petName} that look over my portfolio (Pls take care of him)`,
    tags: ['React.js','Vercel','Git / Github'],
    links: [{ label: 'Live demo', url: 'Come on ur already on the site' }],
  }
];

/** Resume folder -> Download my resume (only on an explicit button click) */
export const resume = {
  file: `${BASE}resume/resume.pdf`, // replace public/resume/resume.pdf with your PDF
  downloadName: 'SAHIL_KUMAR_Resume.pdf',
  updated: 'October 2026',
  highlights: [
    '2 years building AI and ML application',
    'Experienced in developing fullstack application and ML models',
    'Strong in developing of RAG application and fine tuning of AI models',
    'Open to full-time and freelance roles',
  ],
};

/** Bookshelf -> My work experience */
export const experience = [
  {
    role: 'System Engineer',
    company: 'TCS',
    period: '2024 - Present',
    location: 'Kolkata',
    bullets: [
      'Developed, Optimized and hosted multiple ML models for forecasting and anomaly detection',
      'Worked on AI-powered Image Context Understanding System',
      'Collaborated closely with cross‑functional teams including Infra, Security, and Product to align technical solutions with business goals'
    ],
  }
];

/** Photo frame -> About me */
export const about = {
  // Replace with your own photo, e.g. `${BASE}assets/profile/me.png`
  photo: `${BASE}assets/objects/frame.png`,
  photoAlt: 'A portrait of me (placeholder)',
  paragraphs: [
    "Hi! I'm Sahil - a developer who loves turning complex looking idea into simple and creative solutions",
    'Outside of work you will find me playing games, reading books (new hobby), working on something amazing',
    `You won't find me and the batman in the same room`
  ],
  facts: [
    { label: 'Based in', value: 'Kolkata' },
    { label: 'Focus', value: 'AI/ML dev, Fullstack' },
    { label: 'Currently', value: 'Learning robotics ... (going to make an iron man suit)' },
  ],
  skills: ['Data Structure and Algorithm', 'Object Oriented Programming', 'Database Management System', 'System design','Agile Development','CI/CD'
],
};

/** Phone -> Contact information */
export const contact = {
  note: 'The fastest way to reach me is email. I usually reply within a day or two.',
  email: 'sahil.crj8@gmail.com',
  links: [
    { label: 'GitHub', handle: '@CrimsonRavenFeather', url: 'https://github.com/CrimsonRavenFeather' },
    { label: 'LinkedIn', handle: 'in/Sahil Kumar', url: 'https://www.linkedin.com/in/sahil-kumar-3a5696204/' },
  ],
};

/** What the cat says when you click it */
export const catLines = [
  'Meow!',
  'Purrrr...',
  'Hire my human!',
  'Mrrp?',
  'Treats?',
  'Nap time soon...',
  'Pet me again!',
];

/** Short mood labels shown next to the pet's name */
export const catMoods = {
  idle: 'chilling',
  walking: 'exploring',
  sleeping: 'napping',
  reacting: 'happy!',
  dragged: 'help!',
  falling: 'whoa!',
  returning: 'heading home',
  fetching: 'on a mission',
  grabbing: 'got it!',
  carrying: 'delivering',
  presenting: 'ta-da!',
  holding: 'proud',
};

/** What the cat says when the item it fetched is shown (info panels). */
export const fetchLines = {
  projects: 'I fetched your laptop! Here is what you have been building.',
  resume: 'Got the folder! Careful, paper cuts.',
  experience: 'I pulled this off the shelf. Quite a career!',
  about: 'Look, that is my human!',
  contact: 'Brrring! I brought the phone.',
};

/** Cat dialogue inside the games. Edit to taste. */
export const gameLines = {
  tictactoe: {
    start: 'Let us play! You are X, I am the paw. You go first.',
    think: ['Hmm...', 'Let me think...', 'Ooh, tricky...', '*tail swish*'],
    move: ['Mrrp! Your turn.', 'Paw down!', 'There!', 'Your move, human.'],
    win: 'Purrfect! I win!',
    lose: 'Mrow?! You beat me...',
    draw: 'A draw. Rematch?',
  },
  minesweeper: {
    start: 'Dig carefully. I will sniff for trouble.',
    safe: ['Phew.', 'Safe!', 'Nice digging.', 'Keep going!'],
    flag: ['Good catch.', 'Marked it!', 'Hiss at that one.'],
    boom: 'HISSSS! Boom!',
    win: 'You cleared it! Treats for everyone!',
    sniff: '*sniff sniff*...',
    found: 'This spot smells safe!',
    noHint: 'My nose is tired. No more sniffs!',
    notYet: 'Dig somewhere first, then I can sniff.',
  },
};
