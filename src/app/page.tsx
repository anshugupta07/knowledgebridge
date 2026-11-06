"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type IconName =
  | "grid"
  | "folder"
  | "file"
  | "spark"
  | "clock"
  | "shield"
  | "settings"
  | "search"
  | "bell"
  | "plus"
  | "arrow"
  | "check"
  | "alert"
  | "users"
  | "upload"
  | "dots";

const icons: Record<IconName, string> = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  folder: "M3 6.5A1.5 1.5 0 0 1 4.5 5h5l2 2h8A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z",
  file: "M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h4",
  spark: "m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  shield: "M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6zM9 12l2 2 4-4",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2H15V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6H21a1.7 1.7 0 0 0-1.6 1.4Z",
  search: "m20 20-4.2-4.2M10.8 17a6.2 6.2 0 1 0 0-12.4 6.2 6.2 0 0 0 0 12.4Z",
  bell: "M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4",
  plus: "M12 5v14M5 12h14",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  check: "m5 12 4 4L19 6",
  alert: "M12 4 3 20h18zM12 10v4M12 17v.1",
  users: "M16 20v-1.5a4.5 4.5 0 0 0-9 0V20M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 20v-1a3.5 3.5 0 0 0-2.5-3.3M17 5.2a3 3 0 0 1 0 5.6",
  upload: "M12 16V4m0 0L7 9m5-5 5 5M5 20h14",
  dots: "M5 12h.1M12 12h.1M19 12h.1",
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[name]} />
    </svg>
  );
}

const projects = [
  { id: "ecommerce-platform", name: "E-commerce Platform", type: "Product", status: "Active", completion: 68, initials: "EP", color: "mint", updated: "12 min ago", description: "Core commerce stack with payments and admin tools." },
  { id: "mobile-banking-app", name: "Mobile Banking App", type: "Fintech", status: "Active", completion: 42, initials: "MB", color: "purple", updated: "2 hours ago", description: "Secure mobile banking experience for retail customers." },
  { id: "customer-analytics", name: "Customer Analytics", type: "Internal", status: "On hold", completion: 84, initials: "CA", color: "orange", updated: "Yesterday", description: "Unified metrics and retention insights for the team." },
];

type Project = (typeof projects)[number];
type SourceRecord = {
  id: string;
  projectId: string;
  fileName: string;
  fileSize: number;
  processedAt: string;
};

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") return false;
  const project = value as Partial<Project>;
  return (
    typeof project.id === "string" &&
    typeof project.name === "string" &&
    typeof project.type === "string" &&
    (project.status === "Active" || project.status === "On hold") &&
    typeof project.completion === "number" &&
    Number.isFinite(project.completion) &&
    project.completion >= 0 &&
    project.completion <= 100 &&
    typeof project.initials === "string" &&
    typeof project.color === "string" &&
    typeof project.updated === "string" &&
    typeof project.description === "string"
  );
}

function isSourceRecord(value: unknown): value is SourceRecord {
  if (!value || typeof value !== "object") return false;
  const source = value as Partial<SourceRecord>;
  return (
    typeof source.id === "string" &&
    typeof source.projectId === "string" &&
    typeof source.fileName === "string" &&
    typeof source.fileSize === "number" &&
    Number.isSafeInteger(source.fileSize) &&
    source.fileSize > 0 &&
    typeof source.processedAt === "string" &&
    !Number.isNaN(Date.parse(source.processedAt))
  );
}

function createId(prefix: string) {
  const randomUuid = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : String(Date.now());
  return `${prefix}-${randomUuid}`;
}

const activities = [
  { icon: "spark" as IconName, text: "AI analysis completed for", strong: "E-commerce Platform", time: "12 min ago", tone: "mint" },
  { icon: "check" as IconName, text: "Handover approved by", strong: "Maya Chen", time: "1 hour ago", tone: "blue" },
  { icon: "upload" as IconName, text: "New source added to", strong: "Mobile Banking App", time: "2 hours ago", tone: "purple" },
  { icon: "alert" as IconName, text: "Risk identified in", strong: "E-commerce Platform", time: "3 hours ago", tone: "orange" },
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [showNewProject, setShowNewProject] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [projectList, setProjectList] = useState<Project[]>(projects);
  const [sourceList, setSourceList] = useState<SourceRecord[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedProjects = window.localStorage.getItem("knowledgebridge.projects");
        const savedSources = window.localStorage.getItem("knowledgebridge.sources");
        if (savedProjects) {
          const parsedProjects: unknown = JSON.parse(savedProjects);
          if (Array.isArray(parsedProjects)) setProjectList(parsedProjects.filter(isProject));
        }
        if (savedSources) {
          const parsedSources: unknown = JSON.parse(savedSources);
          if (Array.isArray(parsedSources)) setSourceList(parsedSources.filter(isSourceRecord));
        }
      } catch {
        notify("Saved workspace data could not be loaded");
      } finally {
        setStorageReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem("knowledgebridge.projects", JSON.stringify(projectList));
      window.localStorage.setItem("knowledgebridge.sources", JSON.stringify(sourceList));
    } catch {
      notify("Workspace data could not be saved");
    }
  }, [projectList, sourceList, storageReady]);

  const filteredProjects = useMemo<Project[]>(
    () => projectList.filter((project) => project.name.toLowerCase().includes(query.trim().toLowerCase())),
    [projectList, query],
  );

  useEffect(() => {
    function handleSearchShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  function notify(message: string) {
    setToast(message);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
      toastTimerRef.current = null;
    }, 3200);
  }

  function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const description = String(data.get("description") || "").trim();
    if (!name) {
      notify("Enter a project name");
      return;
    }
    setProjectList((current) => [{
      id: createId("project"),
      name,
      type: "New workspace",
      status: "Active",
      completion: 0,
      initials: name.slice(0, 2).toUpperCase(),
      color: "blue",
      updated: "Just now",
      description: description || "A new KnowledgeBridge workspace.",
    }, ...current]);
    setShowNewProject(false);
    notify("Project workspace created");
  }

  function selectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    const allowedTypes = ["application/pdf", "text/plain", "text/markdown", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const allowedExtension = /\.(pdf|docx|txt|md)$/i.test(file.name);
    if ((!allowedTypes.includes(file.type) && !allowedExtension) || file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      event.target.value = "";
      notify("Choose a PDF, DOCX, TXT, or Markdown file under 10 MB");
      return;
    }
    setSelectedFile(file);
  }

  async function processSource() {
    if (!selectedFile) {
      notify("Select a source file before processing");
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId, fileName: selectedFile.name, fileSize: selectedFile.size }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Analysis request failed");
      setSourceList((current) => [{
        id: createId("source"),
        projectId: selectedProjectId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        processedAt: new Date().toISOString(),
      }, ...current]);
      setShowUpload(false);
      setSelectedFile(null);
      notify("Demo analysis completed; citations are sample evidence only");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Analysis failed. Try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  function navigateTo(item: string) {
    setActiveNav(item);
    setSidebarOpen(false);
    if (item === "Sources") openUpload();
  }

  function openUpload() {
    setSelectedProjectId(projectList[0]?.id || "demo-project");
    setShowUpload(true);
  }

  const activeProjects = projectList.filter((project) => project.status === "Active");
  const totalCompletion = projectList.length
    ? Math.round(projectList.reduce((total, project) => total + project.completion, 0) / projectList.length)
    : 0;

  return (
    <main className="app-shell">
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><span /></div><span>knowledge<span className="brand-accent">bridge</span></span></div>
        <div className="workspace-switcher"><div className="workspace-avatar">AC</div><div><strong>Acme Corporation</strong><small>Personal workspace</small></div><span className="chevron">⌄</span></div>
        <nav className="nav-groups">
          <div className="nav-label">WORKSPACE</div>
          {["Overview", "Projects", "Handover reports", "Sources"].map((item, index) => (
            <button key={item} className={`nav-item ${activeNav === item ? "active" : ""}`} onClick={() => navigateTo(item)}><Icon name={(["grid", "folder", "file", "spark"] as IconName[])[index]} /><span>{item}</span>{item === "Handover reports" && <em>3</em>}</button>
          ))}
          <div className="nav-label spaced">INSIGHTS</div>
          {["Timeline", "Risks & dependencies"].map((item, index) => <button key={item} className={`nav-item ${activeNav === item ? "active" : ""}`} onClick={() => navigateTo(item)}><Icon name={index === 0 ? "clock" : "shield"} /><span>{item}</span></button>)}
          <div className="nav-label spaced">ADMINISTRATION</div>
          {["Team members", "Settings"].map((item, index) => <button key={item} className={`nav-item ${activeNav === item ? "active" : ""}`} onClick={() => navigateTo(item)}><Icon name={index === 0 ? "users" : "settings"} /><span>{item}</span></button>)}
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Icon name="spark" size={16} /></div><strong>Need a hand?</strong><p>Learn how KnowledgeBridge works.</p><button onClick={() => notify("Guide opened")}>View guide <Icon name="arrow" size={14} /></button></div><div className="user-row"><div className="user-avatar">AK</div><div><strong>Anshu Kumar</strong><small>Administrator</small></div><Icon name="dots" size={18} /></div></div>
      </aside>

      <section className="main-content">
        <header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>☰</button><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{activeNav}</strong></div><div className="top-actions"><label className="search"><Icon name="search" size={17} /><input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything..." /><kbd>⌘ K</kbd></label><button className="icon-button" aria-label="Notifications" onClick={() => notify("You are all caught up")}><Icon name="bell" /></button><div className="top-avatar">AK</div></div></header>
        {activeNav === "Overview" ? (
        <div className="page-content">
          <div className="welcome-row"><div><p className="eyebrow">THURSDAY, NOVEMBER 5, 2026</p><h1>Good morning, Anshu <span>✦</span></h1><p className="muted">Here&apos;s what&apos;s happening across your workspace.</p></div><button className="primary-button" onClick={() => setShowNewProject(true)}><Icon name="plus" size={17} /> New project</button></div>
          <section className="stats-grid">
            {[["Total projects", String(projectList.length), "Saved in this browser", "folder", "mint"], ["Active projects", String(activeProjects.length), `${totalCompletion}% average completion`, "spark", "purple"], ["Sources processed", String(sourceList.length), "Demo analyses completed", "check", "blue"], ["Active risks", "7", "2 need attention", "alert", "orange"]].map(([label, value, detail, icon, tone]) => <div className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon name={icon as IconName} size={19} /></div><div><p>{label}</p><strong>{value}</strong><small className={tone === "orange" ? "warning-text" : ""}>{tone !== "orange" && <span className="up">↗</span>} {detail}</small></div><Icon name="dots" size={18} /></div>)}
          </section>
          <div className="content-grid">
            <section className="panel projects-panel"><div className="panel-heading"><div><h2>Recent projects</h2><p>Your active knowledge workspaces</p></div><button className="text-button" onClick={() => setActiveNav("Projects")}>View all <Icon name="arrow" size={15} /></button></div><div className="project-list">{filteredProjects.map((project) => <article className="project-row" key={project.id} onClick={() => notify(`${project.name} workspace selected`)}><div className={`project-logo ${project.color}`}>{project.initials}</div><div className="project-info"><div className="project-title"><strong>{project.name}</strong><span className={`status ${project.status === "Active" ? "active-status" : "hold-status"}`}>{project.status}</span></div><p>{project.description}</p><div className="progress-line"><span><i style={{ width: `${project.completion}%` }} /></span><small>{project.completion}% complete</small></div></div><div className="project-meta"><small>{project.type}</small><span>Updated {project.updated}</span></div><button className="row-dots" onClick={(event) => { event.stopPropagation(); notify("Project actions opened"); }}><Icon name="dots" /></button></article>)}</div>{filteredProjects.length === 0 && <div className="empty-state">No projects match &quot;{query}&quot;.</div>}</section>
            <section className="panel activity-panel"><div className="panel-heading"><div><h2>Activity</h2><p>Latest workspace updates</p></div><button className="icon-button subtle" onClick={() => notify("Activity refreshed")}><Icon name="dots" /></button></div><div className="activity-list">{activities.map((activity) => <div className="activity-item" key={`${activity.text}-${activity.strong}`}><div className={`activity-icon ${activity.tone}`}><Icon name={activity.icon} size={15} /></div><div><p>{activity.text} <strong>{activity.strong}</strong></p><small>{activity.time}</small></div></div>)}</div><button className="activity-footer" onClick={() => notify("Showing full activity history")}>View all activity <Icon name="arrow" size={15} /></button></section>
          </div>
          <div className="lower-grid"><section className="panel chart-panel"><div className="panel-heading"><div><h2>Task completion</h2><p>Across all active projects</p></div><button className="select-button" onClick={() => notify("Time range changed")}>Last 30 days <span>⌄</span></button></div><div className="chart-wrap"><div className="chart-y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart"><div className="grid-lines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 640 190" preserveAspectRatio="none" aria-label="Task completion chart"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#52c9a5" stopOpacity=".22" /><stop offset="1" stopColor="#52c9a5" stopOpacity="0" /></linearGradient></defs><path d="M0 164 C42 160 55 130 90 140 S133 112 165 118 S208 92 240 106 S285 86 320 91 S365 52 400 72 S440 52 480 48 S520 28 555 43 S602 22 640 12 V190 H0Z" fill="url(#area)" /><path d="M0 164 C42 160 55 130 90 140 S133 112 165 118 S208 92 240 106 S285 86 320 91 S365 52 400 72 S440 52 480 48 S520 28 555 43 S602 22 640 12" fill="none" stroke="#36b995" strokeWidth="3" /></svg><div className="chart-x"><span>Oct 7</span><span>Oct 14</span><span>Oct 21</span><span>Oct 28</span><span>Nov 5</span></div></div></div></section><section className="panel handover-panel"><div className="panel-heading"><div><h2>Handover reports</h2><p>Reports needing your attention</p></div><button className="text-button" onClick={() => setActiveNav("Handover reports")}>View all <Icon name="arrow" size={15} /></button></div><div className="handover-stat"><div className="donut"><span>3<small>pending</small></span></div><div><strong>3 reports</strong><p>are waiting for review</p><button className="review-button" onClick={() => notify("Opening review queue")}>Review queue <Icon name="arrow" size={14} /></button></div></div><div className="mini-divider" /><div className="review-row"><div className="mini-avatar purple-bg">RM</div><div><strong>E-commerce Platform</strong><small>Rahul Sharma → Aman Patel</small></div><span className="review-pill">Under review</span></div></section></div>
          <section className="insight-banner"><div className="banner-icon"><Icon name="spark" size={21} /></div><div><strong>Your workspace has 7 active risks</strong><p>2 high-priority items in E-commerce Platform need attention before the next handover.</p></div><button onClick={() => navigateTo("Risks & dependencies")}>Review risks <Icon name="arrow" size={15} /></button></section>
        </div>
        ) : (
          <div className="page-content">
          <div className="welcome-row">
            <div><p className="eyebrow">KNOWLEDGEBRIDGE WORKSPACE</p><h1>{activeNav}</h1><p className="muted">Manage and review your project knowledge from one place.</p></div>
            {activeNav === "Projects" && <button className="primary-button" onClick={() => setShowNewProject(true)}><Icon name="plus" size={17} /> New project</button>}
              {activeNav === "Sources" && <button className="primary-button" onClick={openUpload}><Icon name="upload" size={17} /> Add source</button>}
          </div>
          {activeNav === "Projects" && <section className="panel workspace-view"><div className="panel-heading"><div><h2>All projects</h2><p>{projectList.length} workspace{projectList.length === 1 ? "" : "s"} available</p></div></div>{projectList.map((project) => <article className="project-row" key={project.id} onClick={() => notify(`${project.name} workspace selected`)}><div className={`project-logo ${project.color}`}>{project.initials}</div><div className="project-info"><div className="project-title"><strong>{project.name}</strong><span className={`status ${project.status === "Active" ? "active-status" : "hold-status"}`}>{project.status}</span></div><p>{project.description}</p><div className="progress-line"><span><i style={{ width: `${project.completion}%` }} /></span><small>{project.completion}% complete</small></div></div><div className="project-meta"><small>{project.type}</small><span>Updated {project.updated}</span></div></article>)}</section>}
          {activeNav === "Sources" && <section className="panel workspace-view"><div className="panel-heading"><div><h2>Processed sources</h2><p>Files analyzed in demo mode and retained locally.</p></div></div>{sourceList.length === 0 ? <div className="empty-state">No sources processed yet. Add a PDF, DOCX, TXT, or Markdown file to begin.</div> : sourceList.map((source) => <div className="activity-item source-row" key={source.id}><div className="activity-icon purple"><Icon name="file" size={15} /></div><div><p><strong>{source.fileName}</strong></p><small>{projectList.find((project) => project.id === source.projectId)?.name || "Demo project"} · {Math.ceil(source.fileSize / 1024)} KB · Processed {new Date(source.processedAt).toLocaleString()}</small></div><span className="review-pill">Demo analysis</span></div>)}</section>}
          {activeNav === "Handover reports" && <section className="panel workspace-view"><div className="panel-heading"><div><h2>Reports needing review</h2><p>Review evidence before sharing project context.</p></div></div><div className="review-row"><div className="mini-avatar purple-bg">RM</div><div><strong>E-commerce Platform</strong><small>Rahul Sharma → Aman Patel</small></div><span className="review-pill">Under review</span><button className="review-button" onClick={() => notify("Review queue opened")}>Review <Icon name="arrow" size={14} /></button></div></section>}
          {(activeNav === "Timeline" || activeNav === "Risks & dependencies") && <section className="panel workspace-view"><div className="panel-heading"><div><h2>{activeNav}</h2><p>Insights from your current project knowledge.</p></div></div><div className="empty-state">{activeNav === "Timeline" ? "Project timeline events will appear as sources and handovers are added." : "7 active risks found. Two high-priority risks need attention before the next handover."}</div></section>}
          {activeNav === "Team members" && <section className="panel workspace-view"><div className="panel-heading"><div><h2>Team members</h2><p>People with access to this demo workspace.</p></div></div><div className="review-row"><div className="mini-avatar purple-bg">AK</div><div><strong>Anshu Kumar</strong><small>Administrator</small></div><span className="review-pill">Active</span></div></section>}
          {activeNav === "Settings" && <section className="panel workspace-view"><div className="panel-heading"><div><h2>Settings</h2><p>Demo workspace preferences.</p></div></div><div className="settings-row"><strong>Local demo storage</strong><span>Enabled</span><button className="secondary-button" onClick={() => { try { window.localStorage.removeItem("knowledgebridge.projects"); window.localStorage.removeItem("knowledgebridge.sources"); setProjectList(projects); setSourceList([]); notify("Local workspace data cleared"); } catch { notify("Workspace data could not be cleared"); } }}>Clear data</button></div></section>}
          </div>
        )}
      </section>
      {showNewProject && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowNewProject(false)}><form className="modal" aria-labelledby="create-project-title" onSubmit={createProject} onMouseDown={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">NEW WORKSPACE</p><h2 id="create-project-title">Create a project</h2><p className="muted">Start collecting knowledge in a dedicated workspace.</p></div><button type="button" className="icon-button subtle" aria-label="Close dialog" onClick={() => setShowNewProject(false)}>×</button></div><label>Project name<input name="name" required maxLength={100} placeholder="e.g. Website redesign" /></label><label>Description<textarea name="description" rows={3} maxLength={500} placeholder="What is this project about?" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowNewProject(false)}>Cancel</button><button className="primary-button" type="submit"><Icon name="plus" size={16} /> Create project</button></div></form></div>}
      {showUpload && <div className="modal-backdrop" role="presentation" onMouseDown={() => !isProcessing && setShowUpload(false)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="upload-source-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">SOURCE MANAGEMENT · DEMO MODE</p><h2 id="upload-source-title">Upload project source</h2><p className="muted">Files are validated locally; the demo endpoint returns deterministic sample analysis.</p></div><button type="button" className="icon-button subtle" aria-label="Close dialog" disabled={isProcessing} onClick={() => setShowUpload(false)}>×</button></div><label className="field-label">Project<select value={selectedProjectId} disabled={isProcessing} onChange={(event) => setSelectedProjectId(event.target.value)}>{projectList.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></label><input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={selectFile} /><div className="dropzone"><Icon name="upload" size={25} /><strong>{selectedFile ? selectedFile.name : "Choose a source file"}</strong><span>{selectedFile ? `${Math.ceil(selectedFile.size / 1024)} KB selected` : "PDF, DOCX, TXT, or Markdown · max 10 MB"}</span><button type="button" className="secondary-button" disabled={isProcessing} onClick={() => fileInputRef.current?.click()}>Browse files</button></div><div className="modal-actions"><button type="button" className="secondary-button" disabled={isProcessing} onClick={() => { setSelectedFile(null); setShowUpload(false); }}>Cancel</button><button type="button" className="primary-button" disabled={!selectedFile || isProcessing} onClick={processSource}>{isProcessing ? "Processing..." : "Process source"}</button></div></div></div>}
      {toast && <div className="toast"><div><Icon name="check" size={16} /></div>{toast}</div>}
    </main>
  );
}
