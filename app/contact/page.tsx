import type { Metadata } from "next";
import {
  Footer,
  Header,
  PageHero,
  sharedSocial,
} from "../components/SiteChrome";
import { getDomain } from "../utils";
import { ContactPage } from "../components/AuditButtons";
import {
  ContactPageEmail,
  ContactPageSAPhone,
  ContactPageUKPhone,
} from "../components/ContactClicks";
export const metadata: Metadata = {
  title: "Contact — Blackspot",
  description:
    "Talk to Blackspot about a brand, media or technology challenge.",
  ...sharedSocial,
};
export default async function Contact() {
  const { host } = await getDomain();
  const isUkDomain = host?.includes(".co.uk");
  const isSaDomain = host?.includes(".co.za");

  return (
    <main>
      <Header />
      <PageHero
        title="Bring us the"
        accent="real problem."
        intro="Tell us where the business is now, what is getting in the way and where you need to go. We’ll help make the next move clearer."
      />
      <section className="contactGrid shell">
        <ContactPageEmail />
        <div>
          <span>Call</span>
          {!isSaDomain && <ContactPageUKPhone />}

          {!isUkDomain && (
            <ContactPageSAPhone isSaDomain={isSaDomain || false} />
          )}
        </div>
        {!isSaDomain && (
          <div>
            {!isUkDomain ? (
              <span>United Kingdom</span>
            ) : (
              <span>Office Address</span>
            )}
            <p>
              251 Shaw Road, Royton
              <br />
              OL2 6EF
            </p>
          </div>
        )}
        {!isUkDomain && (
          <div>
            {!isSaDomain ? (
              <span>South Africa</span>
            ) : (
              <span>Office Address</span>
            )}
            <p>
              Kimberley, Northern Cape
              <br />
              8300
            </p>
          </div>
        )}
      </section>
      <section className="miniCta lightSection">
        <div className="shell">
          <p className="sectionLabel">Need a place to start?</p>
          <h2>
            Begin with a focused
            <br />
            <span>Brand & Digital Presence Audit.</span>
          </h2>
          <ContactPage />
        </div>
      </section>
      <Footer />
    </main>
  );
}
