import type { CSSProperties } from "react";
import { HowWeWork } from "./components/HowWeWork";
import { PageLoader } from "./components/PageLoader";
import { auditLink, Footer, Header } from "./components/SiteChrome";
import { getProjects } from "./lib/content";

export const revalidate = 60;

const services = [
  {
    n: "01",
    title: "Branding & Design",
    copy: "Positioning, identity and design systems that make your business unmistakable.",
    tags: ["Strategy", "Identity", "Collateral"],
  },
  {
    n: "02",
    title: "Digital Marketing",
    copy: "Focused campaigns and content that turn attention into meaningful business growth.",
    tags: ["Campaigns", "Content", "Performance"],
  },
  {
    n: "03",
    title: "Media Production",
    copy: "Sharp, story-led photography and film built for how modern audiences consume media.",
    tags: ["Film", "Photography", "Storytelling"],
  },
  {
    n: "04",
    title: "Software, IT & Workflow",
    copy: "Practical digital systems that remove friction and make businesses easier to run.",
    tags: ["Web", "Software", "Automation"],
  },
];

export default async function Home() {
  const featured = (await getProjects()).slice(0, 3);

  return (
    <>
      <PageLoader />
      <main>
        <Header />

        <section className="hero shell" id="top">
          <h1 data-reveal>
            We diagnose
            <br />
            the problem, then
            <br />
            <em>build the solution.</em>
          </h1>
          <div
            className="heroFoot"
            data-reveal
            style={{ "--reveal-delay": "180ms" } as CSSProperties}
          >
            <p>
              Blackspot helps ambitious businesses look sharper, communicate
              clearly and run more smoothly.
            </p>
            <a className="primaryCta" href={auditLink("homepage_hero")}>
              Start with a free audit <span>↗</span>
            </a>
          </div>
        </section>

        <section className="statement lightSection" id="about">
          <div className="shell statementGrid">
            <p className="sectionLabel" data-reveal>
              The bigger picture
            </p>
            <div
              data-reveal
              style={{ "--reveal-delay": "80ms" } as CSSProperties}
            >
              <h2>
                Not another agency.
                <br />
                <span>A better way to solve.</span>
              </h2>
              <p className="largeCopy">
                We don’t start with a fixed package. We start with the real
                problem—a brand that isn’t landing, a website that isn’t
                converting, or a process taking more time than it should.
              </p>
            </div>
          </div>
          <div className="wordRail" aria-hidden="true">
            <span>CLARITY</span>
            <i>✦</i>
            <span>MOMENTUM</span>
            <i>✦</i>
            <span>IMPACT</span>
          </div>
        </section>

        <section className="services shell" id="expertise">
          <div className="sectionHead" data-reveal>
            <div>
              <p className="sectionLabel">What we bring together</p>
              <h2>
                Four capabilities.
                <br />
                <span>One joined-up solution.</span>
              </h2>
            </div>
            <p>
              We assemble the right mix of creative and technical expertise
              around what your business actually needs.
            </p>
          </div>
          <div className="serviceList">
            {services.map((s, i) => (
              <article
                className="service"
                data-reveal
                key={s.n}
                style={{ "--reveal-delay": `${i * 70}ms` } as CSSProperties}
              >
                <span className="serviceNo">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.copy}</p>
                <div className="tags">
                  {s.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <span className="serviceArrow">↗</span>
              </article>
            ))}
          </div>
        </section>

        <HowWeWork />

        <section className="work shell" id="work">
          <div className="sectionHead workHead" data-reveal>
            <div>
              <p className="sectionLabel">Selected outcomes</p>
              <h2>
                Work that moves
                <br />
                <span>business forward.</span>
              </h2>
            </div>
            <a href="/work">View our work ↗</a>
          </div>
          {featured.length === 0 ? (
            <p className="emptyPublic" data-reveal>
              Published client work will appear here.
            </p>
          ) : (
            <div className="caseGrid" data-lenis-prevent>
              {featured.map((p, i) => (
                <article
                  className="case caseProject"
                  data-reveal
                  key={p.slug}
                  style={{ "--reveal-delay": `${i * 90}ms` } as CSSProperties}
                >
                  <a href={`/work/${p.slug}`}>
                    <div className="caseVisual">
                      <img src={p.cover} alt={p.title} />
                      {p.type === "video" ? (
                        <i className="playMark casePlay">▶</i>
                      ) : null}
                    </div>
                    <div className="caseCopy">
                      <p>
                        {[p.client, p.category, p.year]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <h3>{p.title}</h3>
                      <span>{p.outcome || p.summary}</span>
                      <b>View project ↗</b>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="markets lightSection">
          <div className="shell marketsGrid">
            <div
              className="globe"
              data-reveal
              aria-label="Operating across the United Kingdom and South Africa"
            >
              <div className="orbit one" />
              <div className="orbit two" />
              <b>UK</b>
              <i>+</i>
              <strong>SA</strong>
            </div>
            <div
              data-reveal
              style={{ "--reveal-delay": "100ms" } as CSSProperties}
            >
              <p className="sectionLabel">Across markets</p>
              <h2>
                Global standards.
                <br />
                <span>Local intelligence.</span>
              </h2>
              <p className="largeCopy">
                Based across the United Kingdom and South Africa, we bring
                cross-market perspective without losing the speed, care and
                context of a close partner.
              </p>
              <div className="marketStats">
                <span>
                  <b>02</b> Priority markets
                </span>
                <span>
                  <b>01</b> Connected team
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="audit shell" id="audit">
          <div className="auditCard" data-reveal>
            <div className="auditTop">
              <p className="sectionLabel">Your best place to start</p>
              <span>01 / Discovery offer</span>
            </div>
            <h2>See what your customers see.</h2>
            <div className="auditGrid">
              <p className="largeCopy">
                Our Brand & Digital Presence Audit shows what is working, what
                is costing you trust, and where the clearest opportunities are.
              </p>
              <ul>
                <li>Brand clarity & consistency</li>
                <li>Website experience & conversion</li>
                <li>Content & digital presence</li>
                <li>Prioritised action roadmap</li>
              </ul>
            </div>
            <div className="auditBottom">
              <div>
                <span>Ready for a clearer view?</span>
                <p>
                  No hard sell. Just a practical diagnostic showing what to fix
                  first.
                </p>
              </div>
              <a className="darkCta" href={auditLink("homepage_audit_section")}>
                Audit my brand <span>↗</span>
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
