import type { Metadata } from "next";
import {
  Footer,
  Header,
  PageHero,
  sharedSocial,
} from "../components/SiteChrome";
export const metadata: Metadata = {
  title: "About — Blackspot",
  description:
    "Blackspot is a problem-solving brand, media and technology partner built for ambitious businesses.",
  ...sharedSocial,
};
const awards = [
  [
    "2023",
    "Best Creative Agency — Northern Cape",
    "Northern Cape Business Awards",
  ],
  [
    "2022",
    "Top Social Media Agency — Kimberley",
    "Kimberley Chamber of Commerce",
  ],
  [
    "2021",
    "Rising Business of the Year",
    "Sol Plaatje Municipality Business Excellence Awards",
  ],
];
export default function About() {
  return (
    <main>
      <Header />
      <PageHero
        title="Built to see"
        accent="the whole problem."
        intro="Blackspot grew from a creative production company into a connected brand, media and technology partner—because business problems rarely fit inside one discipline."
      />
      <section className="aboutStory lightSection">
        <div className="shell splitCopy">
          <p className="sectionLabel">Our belief</p>
          <div>
            <h2>
              Every business deserves to look as good—and run as smoothly—as the
              work it actually does.
            </h2>
            <p>
              We work with growth-oriented businesses that have reached a point
              of change. By bringing strategic, creative and technical thinking
              into one team, we make that change clearer and easier to act on.
            </p>
          </div>
        </div>
      </section>
      <section className="awards shell">
        <div className="sectionHead">
          <div>
            <p className="sectionLabel">Recognition</p>
            <h2>
              Award-winning work.
              <br />
              <span>Earned over time.</span>
            </h2>
          </div>
          <p>
            Recognition from business communities in the Northern Cape and
            Kimberley reflects the standard Blackspot has built since its early
            years.
          </p>
        </div>
        <div className="awardList">
          {awards.map((a) => (
            <article key={a[0]}>
              <b>{a[0]}</b>
              <h3>{a[1]}</h3>
              <p>{a[2]}</p>
              <span>✦</span>
            </article>
          ))}
        </div>
        <p className="sourceNote">
          Awards listed as published on Blackspot’s current website. Supporting
          award assets can be added when available.
        </p>
      </section>
      <section className="numbers lightSection">
        <div className="shell">
          <div>
            <b>6+</b>
            <span>Years building</span>
          </div>
          <div>
            <b>1K+</b>
            <span>Clients served</span>
          </div>
          <div>
            <b>04</b>
            <span>Connected capabilities</span>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
