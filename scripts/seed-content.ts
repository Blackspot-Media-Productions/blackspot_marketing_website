import type { PostInput } from "../app/lib/types";

const media = {
  stolla: "https://res.cloudinary.com/m47nplbv/image/upload/v1786061605/2_rxtjkh.jpg",
  varidzo: "https://res.cloudinary.com/m47nplbv/image/upload/v1786061545/2_ztlvit.jpg",
  spa: "https://res.cloudinary.com/m47nplbv/image/upload/v1786061636/6_xjzug8.jpg",
  nare: "https://res.cloudinary.com/m47nplbv/image/upload/v1786061721/cover_prjzgp.jpg",
  kago: "https://res.cloudinary.com/m47nplbv/image/upload/v1786061665/cover_puruhp.jpg",
  point: "https://res.cloudinary.com/m47nplbv/image/upload/v1786297280/31st_Game_Day_15_uhwhrn.jpg",
  yeshua: "https://res.cloudinary.com/m47nplbv/image/upload/v1786297403/DSC07691_zkpyx5.jpg",
  travel: "https://res.cloudinary.com/m47nplbv/image/upload/v1786109030/design_7_rmerc9.png",
  bakery: "https://res.cloudinary.com/m47nplbv/image/upload/v1786170857/logo_4_bqina4.jpg",
  armored: "https://res.cloudinary.com/m47nplbv/image/upload/v1786170854/logo_1_fcg47s.png",
};

export const seedPosts: PostInput[] = [
  {
    kind: "proof",
    status: "published",
    slug: "stolla-50th",
    title: "Stolla at 50",
    client: "Stolla",
    category: "Photography",
    type: "image",
    cover: media.stolla,
    year: "2026",
    summary: "A single-frame portrait commission built around confidence, character and a milestone worth remembering.",
    services: ["Creative direction", "Studio photography", "Retouching"],
    publishedAt: "2026-06-01T00:00:00.000Z",
  },
  {
    kind: "proof",
    status: "published",
    slug: "blackspot-promo",
    title: "Blackspot in Motion",
    client: "Blackspot",
    category: "Film",
    type: "video",
    cover: media.nare,
    video: "https://res.cloudinary.com/m47nplbv/video/upload/v1786431998/BMP_PROMO_A_1_r0b7gu.mp4",
    year: "2026",
    summary: "A fast-moving production reel bringing the energy, range and people behind Blackspot into one film.",
    services: ["Concept", "Production", "Post-production"],
    publishedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    kind: "proof",
    status: "published",
    slug: "people-and-occasions",
    title: "People & Occasions",
    client: "Selected commissions",
    category: "Photography",
    type: "gallery",
    cover: media.varidzo,
    year: "2026",
    summary: "A selection of event and portrait photography created across celebrations, organisations and communities.",
    images: [media.varidzo, media.spa, media.nare, media.kago, media.point, media.yeshua],
    services: ["Event photography", "Portraiture", "Editing"],
    publishedAt: "2026-07-15T00:00:00.000Z",
  },
  {
    kind: "proof",
    status: "published",
    slug: "brand-built-for-growth",
    title: "A Brand Built for Growth",
    client: "Growth business",
    category: "Brand transformation",
    type: "case-study",
    cover: media.armored,
    year: "2026",
    summary: "Turning an inconsistent market presence into a clear, credible brand system designed to support growth.",
    challenge: "The business had strong operational capability, but its identity and digital presence did not communicate the same level of trust. Customers were seeing fragments rather than one confident business.",
    solution: "Blackspot diagnosed the gaps across positioning, identity and customer touchpoints, then built one connected system spanning message, visual identity, campaign design and digital experience.",
    outcome: "A sharper proposition, a more credible customer experience and a practical system the team could use consistently as the business expanded.",
    images: [media.armored, media.bakery, media.travel],
    services: ["Brand strategy", "Visual identity", "Digital experience", "Campaign system"],
    publishedAt: "2026-08-01T00:00:00.000Z",
  },
  {
    kind: "blog",
    status: "published",
    slug: "clarity-before-creativity",
    title: "Why clarity should come before creativity",
    category: "Brand strategy",
    summary: "The strongest creative work begins by identifying the business problem it needs to solve.",
    cover: media.travel,
    read: "5 min read",
    publishedAt: "2026-08-20T00:00:00.000Z",
    body: `Businesses rarely struggle because they lack activity. More often, they struggle because the work is not connected to a clear diagnosis of what needs to change.

## Clarity first
A strong identity, campaign or digital platform can create momentum—but only when it addresses the right problem. Before making anything, clarify the audience, the perception gap and the business outcome the work must support.

> Better questions create better briefs. Better briefs create work that moves the business.

## Diagnose the gap
Look across the complete customer experience. What does someone see, understand and feel at each touchpoint? The disconnect is often between the quality of the business and the quality of how that business presents itself.

## Move to action
A useful strategy ends with priorities. Define what should happen first, what can wait and how the business will recognise progress. Clarity should reduce noise, not create another presentation that gathers dust.`,
  },
  {
    kind: "blog",
    status: "published",
    slug: "proof-of-work",
    title: "Proof of work: what clients actually need to see",
    category: "Business growth",
    summary: "A portfolio should do more than look impressive. It should make capability, thinking and outcomes easy to trust.",
    cover: media.point,
    read: "4 min read",
    publishedAt: "2026-08-12T00:00:00.000Z",
    body: `A portfolio that only looks beautiful can still fail at its job. Clients are not buying a mood. They are buying evidence that you can solve a specific problem.

## Show the thinking
Before and after is useful, but the middle matters more. Explain what was broken, what you chose to do and why that choice was the right one for the business.

## Make outcomes easy to trust
Capability is easier to believe when the work is specific: who it was for, what changed, and what someone else can expect if they bring you a similar brief.

## Keep it human
Proof of work should feel like a conversation with a specialist, not a highlight reel. Clarity, craft and commercial sense belong in the same frame.`,
  },
  {
    kind: "blog",
    status: "published",
    slug: "brand-digital-audit",
    title: "What a brand and digital audit should reveal",
    category: "Digital presence",
    summary: "A useful audit turns scattered observations into a prioritised plan for action.",
    cover: media.stolla,
    read: "6 min read",
    publishedAt: "2026-08-04T00:00:00.000Z",
    body: `Most businesses already know something is off. The website feels dated, the message changes depending on who you ask, or leads arrive and then stall. An audit is useful when it turns that feeling into a sequence of decisions.

## Look at the whole picture
Brand, website, content and conversion are parts of one system. Fixing a headline while the rest of the experience contradicts it will not create trust.

## Rank what matters
A long list of observations is not a plan. Order the work by value, effort and urgency so the next move is obvious.

## Leave with a roadmap
The point of an audit is not a slide deck. It is a clearer view of what to fix first, and enough confidence to start.`,
  },
];
