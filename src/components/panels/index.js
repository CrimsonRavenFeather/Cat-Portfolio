import { fetchLines } from '../../content/portfolio.js';
import MinesweeperPanel from '../games/MinesweeperPanel.jsx';
import TicTacToePanel from '../games/TicTacToePanel.jsx';
import AboutPanel from './AboutPanel.jsx';
import ContactPanel from './ContactPanel.jsx';
import ExperiencePanel from './ExperiencePanel.jsx';
import ProjectsPanel from './ProjectsPanel.jsx';
import ResumePanel from './ResumePanel.jsx';

const ICONS = `${import.meta.env.BASE_URL}assets/objects`;

/**
 * Maps a game object id (see src/game/config/layout.js) to its panel.
 *
 *  catLine  what the cat says when it hands you the item (info panels).
 *           Games leave it out: they have their own cat dialogue.
 *  wide     use the roomier dialog size
 */
export const PANELS = {
  projects: {
    title: 'My Projects',
    icon: `${ICONS}/laptop.png`,
    catLine: fetchLines.projects,
    Component: ProjectsPanel,
  },
  resume: {
    title: 'My Resume',
    icon: `${ICONS}/folder.png`,
    catLine: fetchLines.resume,
    Component: ResumePanel,
  },
  experience: {
    title: 'Work Experience',
    icon: `${ICONS}/bookshelf.png`,
    catLine: fetchLines.experience,
    Component: ExperiencePanel,
  },
  about: {
    title: 'About Me',
    icon: `${ICONS}/frame.png`,
    catLine: fetchLines.about,
    Component: AboutPanel,
  },
  contact: {
    title: 'Contact',
    icon: `${ICONS}/phone.png`,
    catLine: fetchLines.contact,
    Component: ContactPanel,
  },
  tictactoe: {
    title: 'Tic Tac Toe',
    icon: `${ICONS}/tictactoe.png`,
    Component: TicTacToePanel,
  },
  minesweeper: {
    title: 'Minesweeper',
    icon: `${ICONS}/minesweeper.png`,
    Component: MinesweeperPanel,
  },
};
