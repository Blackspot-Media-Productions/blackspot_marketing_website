import type { Metadata } from "next";
import { Footer, Header } from "../../components/SiteChrome";
import { articleHeadingsFromHtml, prepareArticleHtml } from "../../lib/article-body";
import { getPost } from "../../lib/content";

function ArticleBody({ html }: { html: string }) {
  if (!html) return null;
  return <div className="articleContent" dangerouslySetInnerHTML={{ __html: html }} />;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) return { title: "Article — Blackspot" };
  return {
    title: `${p.title} — Blackspot`,
    description: p.excerpt,
    openGraph: { title: p.title, description: p.excerpt, images: [{ url: p.cover, alt: p.title }] },
    twitter: { card: "summary_large_image", title: p.title, description: p.excerpt, images: [p.cover] },
  };
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) {
    return (
      <main>
        <Header />
        <section className="pageHero shell"><h1>Article not found.</h1></section>
        <Footer />
      </main>
    );
  }

  const html = p.body ? prepareArticleHtml(p.body) : "";
  const toc = articleHeadingsFromHtml(html);

  return (
    <main>
      <Header />
      <article className="articlePage">
        <header className="articleHead shell">
          <p className="articleMeta">{p.category} · {p.date}</p>
          <h1>{p.title}</h1>
          <p>{p.excerpt}</p>
          <span>{p.read}</span>
        </header>
        <figure className="articleCover shell"><img src={p.cover} alt={p.title} /></figure>
        <div className="articleBody shell">
          <aside>
            In this article
            {toc.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}
          </aside>
          <div>
            {html ? <ArticleBody html={html} /> : <p className="lead">{p.excerpt}</p>}
            <a
              className="primaryCta"
              href="https://audit.theblackspotgroup.com/?utm_source=website&utm_medium=referral&utm_campaign=brand_audit&utm_content=blog_article"
            >
              Audit my brand ↗
            </a>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}
