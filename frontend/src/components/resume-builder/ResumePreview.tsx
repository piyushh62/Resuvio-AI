import type React from "react";
import { Mail, Phone, MapPin, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { sectionMeta } from "./constants";
import type { ResumeWorkspace, SectionId } from "./types";

const PreviewText = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <div className="mt-2 space-y-1 pl-1">
      {text
        .split("\n")
        .filter(Boolean)
        .map((line, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="mt-[0.25em] text-[0.8em] leading-none opacity-80">•</span>
            <span className="flex-1">{line.replace(/^[-*]\s*/, "")}</span>
          </div>
        ))}
    </div>
  );
};

const PreviewSection = ({
  sectionId,
  resume,
  accent,
}: {
  sectionId: SectionId;
  resume: ResumeWorkspace;
  accent: string;
}) => {
  const title = sectionMeta[sectionId].label.toUpperCase();
  const isMonochrome = resume.templateId === "executive";
  const isAts = resume.templateId === "ats";
  
  let heading;
  
  if (isMonochrome) {
    heading = (
      <div 
        className="mb-4"
        style={{ marginTop: `${resume.customization.sectionGap}em` }}
      >
        <h2
          className="inline-block border-b-[3px] border-black pb-1 font-bold tracking-[0.16em] text-black"
          style={{ fontSize: `${resume.customization.sectionTitleSize}px` }}
        >
          {title}
        </h2>
      </div>
    );
  } else if (isAts) {
    heading = (
      <h2
        className="mb-3 border-y py-1 font-bold tracking-wide uppercase"
        style={{
          color: accent,
          borderColor: accent,
          fontSize: `${resume.customization.sectionTitleSize}px`,
          marginTop: `${resume.customization.sectionGap}em`,
        }}
      >
        {title}
      </h2>
    );
  } else {
    heading = (
      <h2
        className="mb-3 border-b pb-1 font-bold tracking-[0.16em]"
        style={{
          color: accent,
          fontSize: `${resume.customization.sectionTitleSize}px`,
          marginTop: `${resume.customization.sectionGap}em`,
        }}
      >
        {title}
      </h2>
    );
  }

  if (sectionId === "summary") {
    return (
      <section>
        {heading}
        {resume.summary && <p>{resume.summary}</p>}
      </section>
    );
  }
  if (sectionId === "experience") {
    return (
      <section>
        {heading}
        {resume.experience.map((item, index) => (
          <div key={index} style={{ marginBottom: `${resume.customization.entryGap}em` }}>
            <div className="flex flex-wrap justify-between gap-2 font-bold">
              <span>{[item.jobTitle, item.company].filter(Boolean).join(" | ")}</span>
              <span>{item.dates}</span>
            </div>
            <div className="text-xs text-gray-600">
              {[item.employmentType, item.location].filter(Boolean).join(" | ")}
            </div>
            <PreviewText text={item.description} />
          </div>
        ))}
      </section>
    );
  }
  if (sectionId === "education") {
    return (
      <section>
        {heading}
        {resume.education.map((item, index) => (
          <div key={index} style={{ marginBottom: `${resume.customization.entryGap}em` }}>
            <div className="flex flex-wrap justify-between gap-2 font-bold">
              <span>{[item.degree, item.institution].filter(Boolean).join(" | ")}</span>
              <span>{item.dates}</span>
            </div>
            <div className="text-xs text-gray-600">
              {[item.honors, item.gpa].filter(Boolean).join(" | ")}
            </div>
            <PreviewText text={item.description} />
          </div>
        ))}
      </section>
    );
  }
  if (sectionId === "skills") {
    return (
      <section>
        {heading}
        <div className="space-y-3">
          {resume.skills.map((item, index) => {
            const hasCategory = item.category && item.category.trim().toLowerCase() !== 'skills';
            const skillList = item.items.split(/,\s*/).filter(Boolean);
            
            if (resume.templateId === "modern" || resume.templateId === "ats") {
              return (
                <div key={index} className="mb-1.5 leading-relaxed">
                  {hasCategory && (
                    <strong className="mr-2">{item.category}:</strong>
                  )}
                  <span>{skillList.join(" | ")}</span>
                </div>
              );
            }

            return (
              <div key={index}>
                {hasCategory && (
                  <strong className="block mb-1">{item.category}</strong>
                )}
                <div className="space-y-1">
                  {skillList.map((skill, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2">
                      <span className="mt-[0.3em] text-[0.8em] leading-none opacity-80 flex-shrink-0">•</span>
                      <span className="leading-snug">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }
  if (sectionId === "projects") {
    return (
      <section>
        {heading}
        {resume.projects.map((item, index) => (
          <div key={index} style={{ marginBottom: `${resume.customization.entryGap}em` }}>
            <strong>{item.name}</strong>{" "}
            {item.role && <span className="text-gray-500">({item.role})</span>}
            <PreviewText
              text={[item.description, item.technologies, item.link]
                .filter(Boolean)
                .join("\n")}
            />
          </div>
        ))}
      </section>
    );
  }
  if (sectionId === "certifications") {
    return (
      <section>
        {heading}
        <div className="space-y-3">
          {resume.certifications.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="mt-[0.3em] text-[0.8em] leading-none opacity-80 flex-shrink-0">•</span>
              <div className="leading-snug">
                <strong>{item.name}</strong>
                {(item.issuer || item.date) && (
                  <span className="block opacity-90 mt-0.5">
                    {[item.issuer, item.date].filter(Boolean).join(" | ")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const extra = resume.extras[sectionId];
  return (
    <section>
      {heading}
      {extra?.content && <PreviewText text={extra.content} />}
    </section>
  );
};

interface ResumePreviewProps {
  refEl: React.RefObject<HTMLDivElement>;
  resume: ResumeWorkspace;
  accent: string;
}

const ResumePreview = ({ refEl, resume, accent }: ResumePreviewProps) => {
  const pageStyle: React.CSSProperties = {
    padding: `${resume.customization.pageMargin}px`,
    fontFamily: `${resume.customization.fontFamily}, Arial, sans-serif`,
    fontSize: `${resume.customization.bodyTextSize}px`,
    lineHeight: resume.customization.lineHeight,
  };

  const sectionNodes = resume.sections
    .filter((id) => id !== "personal")
    .map((sectionId) => (
      <PreviewSection key={sectionId} sectionId={sectionId} resume={resume} accent={accent} />
    ));

  const sidebarSections: SectionId[] = ["skills", "languages", "certifications", "awards"];
  
  const sidebarSectionNodes = resume.sections
    .filter((id) => id !== "personal" && sidebarSections.includes(id))
    .map((sectionId) => (
      <PreviewSection key={sectionId} sectionId={sectionId} resume={resume} accent="#ffffff" />
    ));

  const mainSectionNodes = resume.sections
    .filter((id) => id !== "personal" && !sidebarSections.includes(id))
    .map((sectionId) => (
      <PreviewSection key={sectionId} sectionId={sectionId} resume={resume} accent={accent} />
    ));

  if (resume.templateId === "executive") {
    return (
      <div ref={refEl}>
        <div
          className="print-page mx-auto flex min-h-[1123px] w-full max-w-[794px] flex-col bg-white text-black shadow-xl"
          style={{ fontFamily: pageStyle.fontFamily, fontSize: pageStyle.fontSize, lineHeight: pageStyle.lineHeight }}
        >
          {/* Header */}
          <header className="flex-shrink-0 px-8 pt-10 pb-6">
            <h1
              className="font-bold uppercase tracking-widest leading-[1.1] text-black"
              style={{ fontSize: `${resume.customization.nameSize * 1.6}px` }}
            >
              {resume.personal.name}
            </h1>
            <p className="mt-4 text-sm text-gray-500 tracking-wide font-medium">{resume.personal.headline}</p>
          </header>
          
          <div className="mx-8 border-b border-gray-300"></div>

          {/* Grid Layout */}
          <div className="grid grid-cols-[220px_1fr] flex-1">
            <aside className="border-r border-gray-300 p-8 pt-6 pr-6">
              {/* Contact Info */}
              <div className="mb-8">
                <div className="mb-4">
                  <h2
                    className="inline-block border-b-[3px] border-black pb-1 font-bold tracking-[0.16em] text-black"
                    style={{ fontSize: `${resume.customization.sectionTitleSize}px` }}
                  >
                    INFO
                  </h2>
                </div>
                <div className="space-y-4 text-[11px] sm:text-xs font-medium text-gray-800">
                  {resume.personal.location && (
                    <div>
                      <strong className="block text-black uppercase mb-0.5 tracking-wider">Address</strong>
                      <span className="opacity-80 leading-snug block">{resume.personal.location}</span>
                    </div>
                  )}
                  {resume.personal.phone && (
                    <div>
                      <strong className="block text-black uppercase mb-0.5 tracking-wider">Phone</strong>
                      <span className="opacity-80 block">{resume.personal.phone}</span>
                    </div>
                  )}
                  {resume.personal.email && (
                    <div>
                      <strong className="block text-black uppercase mb-0.5 tracking-wider">Email</strong>
                      <span className="opacity-80 break-words block">{resume.personal.email}</span>
                    </div>
                  )}
                  {resume.personal.links.map(link => (
                    <div key={link}>
                      <strong className="block text-black uppercase mb-0.5 tracking-wider">Link</strong>
                      <span className="opacity-80 break-words block">{link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Sidebar Sections */}
              <div>{sidebarSectionNodes}</div>
            </aside>
            
            <main className="p-8 pt-6 overflow-hidden">
              {mainSectionNodes}
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (resume.templateId === "sidebar") {
    return (
      <div ref={refEl}>
        <div
          className="print-page mx-auto grid min-h-[1123px] w-full max-w-[794px] grid-cols-[180px_1fr] bg-white text-black shadow-xl sm:grid-cols-[240px_1fr]"
          style={{ fontFamily: pageStyle.fontFamily }}
        >
          <aside className="p-4 text-white sm:p-6" style={{ backgroundColor: accent }}>
            <div className="mb-6 flex flex-col gap-1 sm:mb-8">
              <h1
                className="font-bold uppercase tracking-wider leading-tight"
                style={{ fontSize: `${resume.customization.nameSize}px` }}
              >
                {resume.personal.name}
              </h1>
              {resume.personal.headline && (
                <p className="text-xs font-medium text-white/85 sm:text-sm leading-snug">
                  {resume.personal.headline}
                </p>
              )}
            </div>

            <div className="space-y-3.5 text-xs text-white/90 sm:space-y-4">
              {resume.personal.email && (
                <div className="flex items-start gap-2.5">
                  <Mail className="mt-[2px] h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                  <p className="break-words leading-tight">{resume.personal.email}</p>
                </div>
              )}
              {resume.personal.phone && (
                <div className="flex items-start gap-2.5">
                  <Phone className="mt-[2px] h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                  <p className="break-words leading-tight">{resume.personal.phone}</p>
                </div>
              )}
              {resume.personal.location && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-[2px] h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                  <p className="break-words leading-tight">{resume.personal.location}</p>
                </div>
              )}
              {resume.personal.links.map((link) => (
                <div key={link} className="flex items-start gap-2.5">
                  <LinkIcon className="mt-[2px] h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                  <p className="break-words leading-tight">
                    {link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  </p>
                </div>
              ))}
            </div>
            {sidebarSectionNodes.length > 0 && (
              <div 
                className="mt-6 sm:mt-8"
                style={{ fontSize: pageStyle.fontSize, lineHeight: pageStyle.lineHeight }}
              >
                {sidebarSectionNodes}
              </div>
            )}
          </aside>
          <main className="overflow-hidden" style={pageStyle}>
            {mainSectionNodes}
          </main>
        </div>
      </div>
    );
  }

  if (resume.templateId === "ats") {
    return (
      <div ref={refEl}>
        <div
          className="print-page mx-auto min-h-[1123px] w-full max-w-[794px] bg-white text-black shadow-xl"
          style={pageStyle}
        >
          <div className="pb-2">
            <h1
              className="font-bold uppercase tracking-wide"
              style={{ color: accent, fontSize: `${resume.customization.nameSize * 1.3}px` }}
            >
              {resume.personal.name}
            </h1>
            <p className="mt-1 font-bold uppercase text-gray-800" style={{ fontSize: `${resume.customization.nameSize * 0.65}px` }}>
              {resume.personal.headline}
            </p>
            <p className="mt-1.5 text-xs text-gray-600 font-medium">
              {[resume.personal.location, resume.personal.phone, resume.personal.email, ...resume.personal.links]
                .filter(Boolean)
                .join(" | ")}
            </p>
          </div>
          
          <div className="mt-2 mb-4 space-y-[2px]">
            <div className="h-[2px] w-full" style={{ backgroundColor: accent }} />
            <div className="h-[1px] w-full" style={{ backgroundColor: accent }} />
          </div>

          <div className="pt-2">{sectionNodes}</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={refEl}>
      <div
        className="print-page mx-auto min-h-[1123px] w-full max-w-[794px] bg-white text-black shadow-xl"
        style={pageStyle}
      >
        <div
          className={cn("border-b pb-3 sm:pb-5", resume.templateId === "modern" && "text-center")}
          style={{ borderColor: accent }}
        >
          <h1
            className="font-bold tracking-wide"
            style={{ color: accent, fontSize: `${resume.customization.nameSize}px` }}
          >
            {resume.personal.name}
          </h1>
          <p className="mt-1 text-xs font-medium text-gray-700 sm:mt-2 sm:text-sm">
            {resume.personal.headline}
          </p>
          <p className="mt-2 text-xs text-gray-600 sm:mt-3">
            {[resume.personal.location, resume.personal.email, resume.personal.phone, ...resume.personal.links]
              .filter(Boolean)
              .join(" | ")}
          </p>
        </div>
        <div className="pt-5 sm:pt-7">{sectionNodes}</div>
      </div>
    </div>
  );
};

export default ResumePreview;
