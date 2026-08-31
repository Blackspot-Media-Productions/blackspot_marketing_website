import type { Metadata } from "next";
import { Footer, Header } from "../../components/SiteChrome";
import { getProject } from "../../lib/content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return { title: "Project — Blackspot" };
  return {
    title: `${p.title} — Blackspot Proof of Work`,
    description: p.summary,
    openGraph: { title: p.title, description: p.summary, images: [{ url: p.cover, alt: p.title }] },
    twitter: { card: "summary_large_image", title: p.title, description: p.summary, images: [p.cover] },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) {
    return (
      <main>
        <Header />
        <section className="pageHero shell">
          <h1>Project not found.</h1>
          <a href="/work">Return to work</a>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      <article className={`projectDetail ${p.type}`}>
        <header className="projectDetailHead shell">
          <div>
            <p className="articleMeta">{p.category} · {p.year}</p>
            <h1>{p.title}</h1>
          </div>
          <div>
            <p>{p.summary}</p>
            <dl>
              <div><dt>Client</dt><dd>{p.client}</dd></div>
              <div><dt>Services</dt><dd>{p.services.join(" · ")}</dd></div>
            </dl>
          </div>
        </header>
        {p.type === "image" && <section className="singleImage shell"><img src={p.cover} alt={p.title} /></section>}
        {p.type === "video" && (
          <section className="videoStage shell">
            <video src={p.video} controls playsInline poster={p.cover} />
          </section>
        )}
        {p.type === "gallery" && (
          <section className="galleryStage shell">
            {p.images?.map((img, i) => (
              <figure key={img} className={`galleryItem gallery${i + 1}`}>
                <img src={img} alt={`${p.title} — image ${i + 1}`} />
              </figure>
            ))}
          </section>
        )}
        {p.type === "case-study" && (
          <>
            <section className="caseHeroImage shell"><img src={p.cover} alt={p.title} /></section>
            <section className="caseNarrative lightSection">
              <div className="shell">
                {[["The challenge", p.challenge], ["Our diagnosis & solution", p.solution], ["The outcome", p.outcome]].map((x) => (
                  <article key={x[0]}>
                    <p className="sectionLabel">{x[0]}</p>
                    <h2>{x[1]}</h2>
                  </article>
                ))}
              </div>
            </section>
            <section className="caseGallery shell">
              {p.images?.map((img) => <img key={img} src={img} alt={`${p.title} process image`} />)}
            </section>
          </>
        )}
        <nav className="projectNext shell">
          <a href="/work">← All work</a>
          <a href="/contact">Discuss a project ↗</a>
        </nav>
      </article>
      <Footer />
    </main>
  );
}
