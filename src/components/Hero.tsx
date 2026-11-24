import GithubMark from "./GithubMark";
import { REPO_URL } from "../config";


// A static illustration of what Summify does: a long article on the left,
// the short summary it turns into on the right.
const Preview = () => (
  <div className="preview" aria-hidden="true">
    <article className="clip">
      <p className="clip-source">citylines.example · Long read</p>
      <h3 className="clip-title">Why the night bus is quietly having a moment</h3>
      <p className="clip-byline">4,180 words · 21 min read</p>
      <div className="clip-body">
        <p>
          At 2:40 a.m. the N12 pulls away from the depot almost full. Most of
          the riders are not coming home from a night out. They are cleaners,
          nurses, bakers and warehouse staff, heading to shifts that start
          before the first train.
        </p>
        <p>
          For years, overnight routes were treated as a courtesy, thinly spread
          across the map and timed so loosely that few people could rely on
          them. Surveys in several cities changed that picture.
        </p>
        <p>
          Planners began to argue that a short list of frequent routes would
          serve more people than a long list of rare ones.
        </p>
      </div>
    </article>

    <div className="digest">
      <div className="digest-head">
        <span className="digest-label">Summary</span>
        <span className="meta">
          49 words · <span className="mark">~1 min read</span>
        </span>
      </div>
      <p className="digest-text">
        Cities are expanding overnight buses after surveys showed most late
        riders are shift workers, not people out for the evening. Planners now
        favour a few routes every 15 minutes over wide, infrequent coverage.
        Ridership is up on the new routes, though funding after the pilot is
        not yet settled.
      </p>
    </div>
  </div>
);

const Hero = () => {
  return (
    <header className="hero-section">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">Summify</div>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            <GithubMark />
            GitHub
          </a>
        </div>
      </nav>

      <div className="hero-grid">
        <div className="hero-copy">
          <h1 className="hero-title">
            Paste a link, <span className="mark">read the gist</span>
          </h1>

          <p className="hero-description">
            Summify fetches the article behind a URL and gives you a short
            summary, with its word count and reading time. Past summaries stay
            in this browser.
          </p>
        </div>

        <Preview />
      </div>
    </header>
  );
};

export default Hero;
