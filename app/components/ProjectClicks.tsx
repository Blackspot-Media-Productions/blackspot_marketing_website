"use client";

import { Project } from "../lib/types";
import { sendGAEvent } from "../lib/gtag";

export function HomePageProjects({ project: p }: { project: Project }) {
  return (
    <a
      href={`/work/${p.slug}`}
      onClick={() =>
        sendGAEvent("project_click", {
          project_name: p.title,
          placement: "homepage",
        })
      }
    >
      <div className="caseVisual">
        <img src={p.cover} alt={p.title} />
        {p.type === "video" ? <i className="playMark casePlay">▶</i> : null}
      </div>
      <div className="caseCopy">
        <p>{[p.client, p.category, p.year].filter(Boolean).join(" · ")}</p>
        <h3>{p.title}</h3>
        {/*<span dangerouslySetInnerHTML={{__html: p.outcome || p.summary}} />*/}
        {/*<span dangerouslySetInnerHTML={{__html: p.outcome || p.summary}}>{p.outcome || p.summary}</span>*/}
        <b>View project ↗</b>
      </div>
    </a>
  );
}
