"use client";

import { useState } from "react";
import { Project } from "../../lib/types";
import { categoryMap } from "../../lib/data";

export function WorkSection({projects, host}: {projects: Project[], host: string | null}) {
  const [activeCategory, setActiveCategory] = useState("");

  const domainFilteredProjects = projects.filter((p) => {
    const isUkDomain = host?.includes('.co.uk');
    const isSaDomain = host?.includes('.co.za');

    if ((!isUkDomain && !isSaDomain) || !p.localeFor || p.localeFor.includes('global')) {
      return true;
    }

    return (
      (isUkDomain && p.localeFor.includes('GB')) ||
      (isSaDomain && p.localeFor.includes('ZA'))
    );
  });

  const hasVisibleProjects = activeCategory === ""
    ? domainFilteredProjects.length > 0
    : domainFilteredProjects.some(p => p.category === activeCategory);

  return (
    <section className="workIndex shell">
      <div className="workFilters">
        {['', 'media_production', 'software_development', 'branding_and_design', 'digital_marketing'].map((filter) => (
          <button key={filter} onClick={() => { setActiveCategory(filter); sessionStorage.setItem('work_filter', JSON.stringify(filter)); }}
            className={activeCategory === filter ? "active" : undefined}>{filter === "" ? "All work" : categoryMap[filter as keyof typeof categoryMap].first}</button>
        ))}

        {/*<button className={activeCategory === "" ? "active" : undefined}>Brand & design</button>
        <button className={activeCategory === "" ? "active" : undefined}>Photography</button>
        <button className={activeCategory === "" ? "active" : undefined}>Film</button>
        <button className={activeCategory === "" ? "active" : undefined}>Digital</button>*/}
      </div>
      {projects.length === 0 ? <p className="emptyPublic">Work will appear here once it is published.</p> : !hasVisibleProjects ? <p className="emptyPublic">No work under this category '{activeCategory}' yet</p> : null}
      <div className="projectGrid">
        {domainFilteredProjects.map((p, i) => {
          const isVisible = activeCategory === "" || p.category === activeCategory;

          return (
            <a className={`projectCard projectCard${i + 1}`} href={`/work/${p.slug}`} key={p.slug} data-reveal style={{ display: isVisible ? 'block' : 'none' }}>
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
          )
        })}
      </div>
    </section>
  )
}
