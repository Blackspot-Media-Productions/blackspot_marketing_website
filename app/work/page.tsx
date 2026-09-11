import type { Metadata } from "next";
import { Footer, Header, PageHero, sharedSocial } from "../components/SiteChrome";
import { getProjects } from "../lib/content";
import { getDomain } from "../utils";
import { WorkSection } from "./components/WorkSection";

export const metadata: Metadata = {
  title: "Proof of Work — Blackspot",
  description: "Photography, film, design and full brand transformations by Blackspot.",
  ...sharedSocial,
};

export const revalidate = 60;

export default async function Work() {
  const projects = await getProjects();
  const { host } = await getDomain();

  return (
    <main>
      <Header />
      <PageHero
        title="Don’t take our"
        accent="word for it."
        intro="Explore the images, films, campaigns and transformations that show how Blackspot turns business problems into work people can see and trust."
      />
      <WorkSection host={host} projects={projects} />
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
