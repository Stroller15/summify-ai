import { useState, useEffect, type FormEvent } from "react";
import { copy, linkIcon, tick } from "../assets";
import { useLazyGetSummaryQuery } from "../services/article";

interface Article {
  url: string;
  summary: string;
}

// Pulls the API's `error` message out of an RTK Query error, if present.
const getErrorMessage = (error: unknown): string | undefined => {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "object" && data !== null && "error" in data) {
      const message = (data as { error?: unknown }).error;
      return typeof message === "string" ? message : undefined;
    }
  }
  return undefined;
};

const Demo = () => {
  const [article, setArticle] = useState<Article>({
    url: "",
    summary: "",
  });

  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [copied, setCopied] = useState("");

  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(() => {
    const articleFromLocalStorage: Article[] | null = JSON.parse(
      localStorage.getItem("articles") ?? "null"
    );

    if (articleFromLocalStorage) {
      setAllArticles(articleFromLocalStorage);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data } = await getSummary({ articleUrl: article.url });

    if (data?.summary) {
      const newArticle: Article = { ...article, summary: data.summary };
      const updatedAllArticles = [newArticle, ...allArticles];

      setArticle(newArticle);
      setAllArticles(updatedAllArticles);
      localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
    }
  };

  const handleCopy = (copyUrl: string) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(""), 3000);
  };

  const handleDelete = (indexToDelete: number) => {
    const updatedArticles = allArticles.filter((_, index) => index !== indexToDelete);
    setAllArticles(updatedArticles);
    localStorage.setItem("articles", JSON.stringify(updatedArticles));

    if (article.url === allArticles[indexToDelete]?.url) {
      setArticle({ url: "", summary: "" });
    }
  };

  return (
    <div className="w-full">
      {/* Main Input Section */}
      <div className="input-container">
        <form onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <img
              src={linkIcon}
              alt="link"
              className="input-icon"
            />
            <input
              type="url"
              placeholder="Paste article URL here..."
              value={article.url}
              onChange={(e) => setArticle({ ...article, url: e.target.value })}
              required
              className="url-input"
            />

            <button
              type="submit"
              disabled={isFetching}
              className="submit-btn"
            >
              {isFetching ? (
                <>
                  <div className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />
                  Summarizing...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3L10 17M10 17L15 12M10 17L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Summarize
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Summary Display */}
      {isFetching && (
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">Analyzing article and generating summary...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <h3 className="error-title">Failed to summarize</h3>
          <p className="error-message">
            {getErrorMessage(error) || "Unable to process this article. Please try a different URL."}
          </p>
        </div>
      )}

      {article.summary && !isFetching && (
        <div className="summary-section">
          <div className="summary-header">
            <h2 className="summary-title">Summary</h2>
            <button
              onClick={() => handleCopy(article.summary)}
              className="copy-btn"
            >
              <img src={copied === article.summary ? tick : copy} alt="copy" style={{ width: '1rem', height: '1rem' }} />
              {copied === article.summary ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="summary-box">
            <p className="summary-text">{article.summary}</p>

            <div className="summary-meta">
              <div className="summary-meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 4H13M3 8H13M3 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {article.summary.split(' ').length} words
              </div>
              <div className="summary-meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 4V8L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                ~{Math.ceil(article.summary.split(' ').length / 200)} min read
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Section */}
      {allArticles.length > 0 && (
        <div className="history-section">
          <div className="history-header">
            <h3 className="history-title">Recent Summaries</h3>
            <span className="history-count">
              {allArticles.length} {allArticles.length === 1 ? 'article' : 'articles'}
            </span>
          </div>

          <div className="history-list">
            {allArticles.map((item, index) => (
              <div key={`article-${index}`} className="history-item">
                <button
                  onClick={() => handleCopy(item.url)}
                  className="icon-btn"
                  title="Copy URL"
                >
                  <img
                    src={copied === item.url ? tick : copy}
                    alt="copy"
                    style={{ width: '1rem', height: '1rem' }}
                  />
                </button>

                <div
                  onClick={() => setArticle(item)}
                  className="history-url"
                  style={{ cursor: 'pointer' }}
                >
                  {item.url}
                </div>

                <button
                  onClick={() => handleDelete(index)}
                  className="icon-btn"
                  title="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 4H13M6 4V3C6 2.44772 6.44772 2 7 2H9C9.55228 2 10 2.44772 10 3V4M5 7V12M8 7V12M11 7V12M4 4H12V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Section */}
      {!article.summary && !isFetching && (
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p className="feature-description">
              Get summaries in seconds with our advanced AI technology
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Highly Accurate</h3>
            <p className="feature-description">
              Precise summaries that capture the key points of any article
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💾</div>
            <h3 className="feature-title">Auto-Save</h3>
            <p className="feature-description">
              All summaries are saved locally for easy access anytime
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demo;
