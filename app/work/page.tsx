import type { Metadata } from "next";
import { Footer, Header, PageHero, sharedSocial } from "../components/SiteChrome";
import { getProjects } from "../lib/content";

export const metadata: Metadata = {
  title: "Proof of Work — Blackspot",
  description: "Photography, film, design and full brand transformations by Blackspot.",
  ...sharedSocial,
};

export const revalidate = 60;

export default async function Work() {
  const projects = await getProjects();
  return (
    <main>
      <Header />
      <PageHero
        title="Don’t take our"
        accent="word for it."
        intro="Explore the images, films, campaigns and transformations that show how Blackspot turns business problems into work people can see and trust."
      />
      <section className="workIndex shell">
        <div className="workFilters">
          <button className="active">All work</button>
          <button>Brand & design</button>
          <button>Photography</button>
          <button>Film</button>
          <button>Digital</button>
        </div>
        {projects.length === 0 ? <p className="emptyPublic">Work will appear here once it is published.</p> : null}
        <div className="projectGrid">
          {projects.map((p, i) => (
            <a className={`projectCard projectCard${i + 1}`} href={`/work/${p.slug}`} key={p.slug} data-reveal>
              <div className="projectImage">
                <img src={p.cover} alt={p.title} />
                <span>{p.type.replace("-", " ")}</span>
                {p.type === "video" && <i className="playMark">▶</i>}
              </div>
              <div className="projectMeta">
                <div>
                  <p>{p.category} · {p.year}</p>
                  <h2>{p.title}</h2>
                </div>
                <b>↗</b>
              </div>
            </a>
          ))}
        </div>
      </section>
      <section className="miniCta lightSection">
        <div className="shell">
          <p className="sectionLabel">Your project could be next</p>
          <h2>Bring us the problem.<br /><span>We’ll build what moves it.</span></h2>
          <a className="darkCta" href="/contact">Start a conversation ↗</a>
        </div>
      </section>
      <Footer />
    </main>
  );
}
