import type { Metadata } from "next";
import { Footer, Header, PageHero, sharedSocial } from "../components/SiteChrome";
import { getBlogPosts } from "../lib/content";

export const metadata: Metadata = {
  title: "Ideas — Blackspot",
  description: "Practical thinking on brands, digital presence, media and better business systems.",
  ...sharedSocial,
};

export const revalidate = 60;

export default async function Blog() {
  const blogPosts = await getBlogPosts();
  const featured = blogPosts[0];
  return (
    <main>
      <Header />
      <PageHero
        title="Useful thinking."
        accent="No filler."
        intro="Practical ideas for businesses that want to communicate more clearly, grow more intentionally and make smarter use of brand, media and technology."
      />
      <section className="blogIndex shell">
        {!featured ? <p className="emptyPublic">Articles will appear here once they are published.</p> : null}
        {featured ? (
          <div className="featuredPost">
            <a href={`/blog/${featured.slug}`}>
              <img src={featured.cover} alt={featured.title} />
              <div>
                <p>{featured.category} · {featured.date}</p>
                <h2>{featured.title}</h2>
                <span>{featured.excerpt}</span>
                <b>Read article ↗</b>
              </div>
            </a>
          </div>
        ) : null}
        <div className="blogGrid">
          {blogPosts.slice(1).map((p) => (
            <a href={`/blog/${p.slug}`} key={p.slug}>
              <img src={p.cover} alt={p.title} />
              <p>{p.category} · {p.read}</p>
              <h2>{p.title}</h2>
              <span>{p.excerpt}</span>
            </a>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
