import Demo from "./components/Demo";
import Hero from "./components/Hero";
import GithubMark from "./components/GithubMark";
import { REPO_URL } from "./config";
import './App.css'

const App = () => {
  return (
    <main>
      <div className="app">
        <Hero />
        <Demo />

        <footer className="footer">
          <div className="footer-brand">
            <span className="logo">Summify</span>
            <span className="footer-text">Article summaries from a link</span>
          </div>

          <div className="footer-end">
            <span className="footer-text">© {new Date().getFullYear()} · Open source</span>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn"
              aria-label="Summify on GitHub"
            >
              <GithubMark />
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}

export default App
