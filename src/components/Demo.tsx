import { useState, useEffect, type FormEvent } from "react";
import { ArrowRight, Check, Copy, History, Link, Trash2 } from "lucide-react";
import { useLazyGetSummaryQuery } from "../services/article";

interface Article {
  url: string;
  summary: string;
}

const ICON = { size: 16, strokeWidth: 1.5 } as const;

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

// "https://www.example.com/a/b" -> "example.com"; falls back to the raw string.
const getHost = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const FEATURES = [
  {
    icon: Link,
    title: "Works from a link",
    description: "Paste the article's URL. Summify fetches the page and writes the summary.",
  },
  {
    icon: Copy,
    title: "Copy in one click",
    description: "Copy the summary or any saved link straight into your notes.",
  },
  {
    icon: History,
    title: "Saved in this browser",
    description: "Past summaries are kept locally, with no account to create.",
  },
];

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

  const wordCount = article.summary.split(" ").length;
  const hasHistory = allArticles.length > 0;

  return (
    <section className="tool">
      {/* Input */}
      <form onSubmit={handleSubmit} className="input-panel">
        <label htmlFor="article-url" className="input-label">
          Article link
        </label>
        <div className="input-row">
          <div className="input-field">
            <Link {...ICON} className="input-icon" aria-hidden="true" />
            <input
              id="article-url"
              type="url"
              placeholder="https://"
              value={article.url}
              onChange={(e) => setArticle({ ...article, url: e.target.value })}
              required
              className="url-input"
            />
          </div>

          <button type="submit" disabled={isFetching} className="btn btn-primary">
            {isFetching ? (
              <>
                <span className="spinner spinner-sm" aria-hidden="true" />
                Summarizing…
              </>
            ) : (
              <>
                Summarize
                <ArrowRight {...ICON} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className={`workspace${hasHistory ? " has-history" : ""}`}>
        <div className="workspace-main">
          {isFetching && (
            <div className="status-card" role="status">
              <span className="spinner" aria-hidden="true" />
              <p className="status-text">Reading the article and writing a summary</p>
            </div>
          )}

          {error && (
            <div className="error-card" role="alert">
              <h3 className="error-title">Couldn’t summarize this article</h3>
              <p className="error-message">
                {getErrorMessage(error) || "Unable to process this article. Please try a different URL."}
              </p>
            </div>
          )}

          {/* Summary */}
          {article.summary && !isFetching && (
            <article className="summary-card">
              <div className="summary-header">
                <div>
                  <h2 className="summary-title">Summary</h2>
                  <p className="summary-source">{getHost(article.url)}</p>
                </div>
                <button
                  onClick={() => handleCopy(article.summary)}
                  className="btn btn-secondary btn-sm"
                >
                  {copied === article.summary ? (
                    <Check {...ICON} aria-hidden="true" />
                  ) : (
                    <Copy {...ICON} aria-hidden="true" />
                  )}
                  {copied === article.summary ? "Copied" : "Copy"}
                </button>
              </div>

              <p className="summary-text">{article.summary}</p>

              <p className="summary-meta meta">
                {wordCount} words ·{" "}
                <span className="mark">~{Math.ceil(wordCount / 200)} min read</span>
              </p>
            </article>
          )}

          {/* What it does */}
          {!article.summary && !isFetching && (
            <ul className="features">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="feature">
                  <Icon {...ICON} className="feature-icon" aria-hidden="true" />
                  <h3 className="feature-title">{title}</h3>
                  <p className="feature-description">{description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* History */}
        {hasHistory && (
          <aside className="history">
            <div className="history-header">
              <h3 className="history-title">Recent summaries</h3>
              <span className="meta">{allArticles.length} saved</span>
            </div>

            <ul className="history-list">
              {allArticles.map((item, index) => (
                <li
                  key={`article-${index}`}
                  className={`history-item${item.url === article.url && article.summary ? " is-active" : ""}`}
                >
                  <button
                    onClick={() => setArticle(item)}
                    className="history-open"
                    title={item.url}
                  >
                    <span className="history-host">{getHost(item.url)}</span>
                    <span className="history-url">{item.url}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(item.url)}
                    className="icon-btn"
                    title="Copy link"
                    aria-label="Copy link"
                  >
                    {copied === item.url ? <Check {...ICON} /> : <Copy {...ICON} />}
                  </button>

                  <button
                    onClick={() => handleDelete(index)}
                    className="icon-btn"
                    title="Delete"
                    aria-label="Delete"
                  >
                    <Trash2 {...ICON} />
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </section>
  );
};

export default Demo;
