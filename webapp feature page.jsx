import { useState, useRef } from "react";

// ── Icons (inline SVG to avoid dep issues) ──────────────────────────────────
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const SpeechIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const UploadCloudIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Hex pattern SVG background ───────────────────────────────────────────────
const HexPattern = () => (
  <svg
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="hex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
        <polygon
          points="14,2 42,2 56,26 42,46 14,46 0,26"
          fill="none"
          stroke="#3b6e3b"
          strokeWidth="1.5"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex)" />
  </svg>
);

// ── Data ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "tts", label: "Text to Speech", icon: <SpeechIcon /> },
  { id: "read", label: "Reading Hub", icon: <BookIcon /> },
  { id: "notes", label: "Notes", icon: <EditIcon /> },
  { id: "more", label: "More tools", icon: <MenuIcon />, hasChevron: true },
];

// ── Styles (CSS-in-JS object) ─────────────────────────────────────────────────
const css = {
  // Layout
  root: {
    display: "flex",
    height: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    overflow: "hidden",
    position: "relative",
  },
  // Sidebar
  sidebar: (dark) => ({
    width: 260,
    minWidth: 260,
    background: dark ? "#1a3320" : "#2d5a27",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    gap: 0,
    zIndex: 20,
    transition: "transform 0.3s cubic-bezier(.4,0,.2,1), background 0.2s",
    flexShrink: 0,
  }),
  sidebarMobileOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 19,
  },
  sidebarMobile: (dark) => ({
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: 260,
    background: dark ? "#1a3320" : "#2d5a27",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    zIndex: 20,
    transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
    boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
  }),
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 32,
    paddingLeft: 4,
  },
  logoText: {
    color: "#fff",
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: "-0.3px",
  },
  logoIcon: {
    background: "rgba(255,255,255,0.18)",
    borderRadius: 8,
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { borderBottom: "1px solid rgba(255,255,255,0.15)", margin: "4px 0 12px" },
  sectionLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 6,
    paddingLeft: 4,
  },
  navItem: (active, dark) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    color: active ? (dark ? "#2d5a27" : "#2d5a27") : "rgba(255,255,255,0.85)",
    background: active ? "#fff" : "transparent",
    fontWeight: active ? 600 : 400,
    fontSize: 14,
    marginBottom: 2,
    transition: "background 0.15s, color 0.15s",
    userSelect: "none",
  }),
  navItemHover: {
    background: "rgba(255,255,255,0.1)",
  },
  navChevron: { marginLeft: "auto", opacity: 0.7 },
  sidebarFooter: {
    marginTop: "auto",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 8px",
    borderRadius: 10,
    cursor: "pointer",
  },
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#c8e6c9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#2d5a27",
    fontSize: 14,
    overflow: "hidden",
  },
  avatarDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#4caf50",
    border: "2px solid #2d5a27",
  },
  userInfo: { flex: 1, overflow: "hidden" },
  userName: { color: "#fff", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userEmail: { color: "rgba(255,255,255,0.55)", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  logoutBtn: { color: "rgba(255,255,255,0.6)", cursor: "pointer", flexShrink: 0, padding: 4, borderRadius: 6, transition: "color 0.15s" },

  // Main
  main: (dark) => ({
    flex: 1,
    background: dark ? "#111b13" : "#f5f7f5",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    transition: "background 0.2s",
  }),
  topbar: (dark) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "28px 36px 0",
    background: dark ? "#111b13" : "#f5f7f5",
    flexShrink: 0,
  }),
  topbarLeft: { display: "flex", alignItems: "center", gap: 14 },
  mobileMenuBtn: {
    display: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    borderRadius: 8,
  },
  greeting: (dark) => ({
    color: dark ? "#e8f5e9" : "#1a2e1a",
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
  }),
  subtitle: {
    color: "#78909c",
    fontSize: 14,
    marginTop: 3,
    fontWeight: 400,
  },
  topActions: { display: "flex", alignItems: "center", gap: 10 },
  iconBtn: (dark) => ({
    background: dark ? "rgba(255,255,255,0.07)" : "#fff",
    border: "none",
    borderRadius: 10,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: dark ? "#c8e6c9" : "#4a6741",
    boxShadow: dark ? "none" : "0 1px 4px rgba(0,0,0,0.08)",
    transition: "background 0.15s, transform 0.1s",
  }),
  content: { padding: "24px 36px 36px", display: "flex", flexDirection: "column", gap: 20 },

  // Hero card
  heroCard: (dark) => ({
    borderRadius: 20,
    background: dark ? "#1e3d24" : "#c5d5f5",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    gap: 24,
    padding: "32px 36px",
    minHeight: 160,
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  }),
  heroIllustration: {
    flexShrink: 0,
    width: 120,
    display: "flex",
    alignItems: "flex-end",
  },
  heroText: { flex: 1, zIndex: 1 },
  heroTitle: (dark) => ({
    fontSize: 22,
    fontWeight: 700,
    color: dark ? "#e8f5e9" : "#1a2e3a",
    marginBottom: 8,
    letterSpacing: "-0.3px",
  }),
  heroDesc: (dark) => ({
    fontSize: 14,
    color: dark ? "rgba(200,230,200,0.8)" : "#3a5070",
    lineHeight: 1.6,
    maxWidth: 420,
  }),
  heroBadge: {
    background: "rgba(45,90,39,0.15)",
    color: "#2d5a27",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "3px 10px",
    borderRadius: 20,
    marginBottom: 10,
    display: "inline-block",
  },

  // Upload zone
  uploadZone: (dragging, dark) => ({
    borderRadius: 20,
    border: `2px dashed ${dragging ? "#2d7a20" : dark ? "#2a4a2a" : "#b0ccb0"}`,
    background: dragging
      ? dark ? "rgba(45,122,32,0.12)" : "#e8f5e4"
      : dark ? "rgba(255,255,255,0.03)" : "#eaf3ea",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s, transform 0.15s",
    transform: dragging ? "scale(1.01)" : "scale(1)",
    gap: 12,
    userSelect: "none",
  }),
  uploadIcon: (dark) => ({
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: dark ? "#2d5a27" : "#2d5a27",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    marginBottom: 4,
    boxShadow: "0 4px 16px rgba(45,90,39,0.3)",
  }),
  uploadTitle: {
    color: "#2d5a27",
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: "-0.2px",
  },
  uploadSub: { color: "#78909c", fontSize: 13 },

  // File preview
  filePreview: (dark) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: dark ? "rgba(255,255,255,0.06)" : "#fff",
    borderRadius: 12,
    padding: "14px 18px",
    marginTop: 8,
    boxShadow: dark ? "none" : "0 1px 6px rgba(0,0,0,0.07)",
  }),
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    background: "#e8f5e4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2d7a20",
    fontSize: 12,
    fontWeight: 700,
  },
  fileName: (dark) => ({ fontSize: 13, fontWeight: 600, color: dark ? "#c8e6c9" : "#1a2e1a" }),
  fileSize: { fontSize: 11, color: "#90a4ae" },
  removeBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    color: "#90a4ae",
    cursor: "pointer",
    fontSize: 18,
    lineHeight: 1,
    padding: "2px 6px",
    borderRadius: 6,
    transition: "color 0.15s",
  },
};

// ── Illustration SVG ──────────────────────────────────────────────────────────
const ReadingIllustration = ({ dark }) => (
  <svg width="110" height="130" viewBox="0 0 110 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Envelope */}
    <rect x="18" y="60" width="72" height="52" rx="6" fill={dark ? "#2a5040" : "#a8c0f0"} />
    <polyline points="18,60 55,88 92,60" fill="none" stroke={dark ? "#4a9070" : "#7fa0e0"} strokeWidth="2" />
    {/* Document */}
    <rect x="32" y="18" width="46" height="62" rx="4" fill="#fff" />
    <rect x="40" y="28" width="30" height="3" rx="1.5" fill={dark ? "#c8e6c9" : "#b0c8f0"} />
    <rect x="40" y="36" width="24" height="3" rx="1.5" fill={dark ? "#c8e6c9" : "#b0c8f0"} />
    <rect x="40" y="44" width="28" height="3" rx="1.5" fill={dark ? "#c8e6c9" : "#b0c8f0"} />
    <rect x="40" y="52" width="20" height="3" rx="1.5" fill={dark ? "#c8e6c9" : "#b0c8f0"} />
    {/* Person */}
    <circle cx="20" cy="38" r="8" fill={dark ? "#7ab87a" : "#8ab0e8"} />
    <rect x="12" y="48" width="16" height="22" rx="4" fill={dark ? "#4a8a4a" : "#5a88d0"} />
    <line x1="12" y1="56" x2="4" y2="66" stroke={dark ? "#4a8a4a" : "#5a88d0"} strokeWidth="4" strokeLinecap="round" />
    <line x1="28" y1="56" x2="34" y2="52" stroke={dark ? "#4a8a4a" : "#5a88d0"} strokeWidth="4" strokeLinecap="round" />
    <line x1="16" y1="70" x2="14" y2="84" stroke={dark ? "#7ab87a" : "#8ab0e8"} strokeWidth="4" strokeLinecap="round" />
    <line x1="24" y1="70" x2="22" y2="84" stroke={dark ? "#7ab87a" : "#8ab0e8"} strokeWidth="4" strokeLinecap="round" />
    {/* Microphone stand */}
    <line x1="34" y1="50" x2="34" y2="82" stroke="#888" strokeWidth="3" strokeLinecap="round" />
    <line x1="26" y1="82" x2="42" y2="82" stroke="#888" strokeWidth="3" strokeLinecap="round" />
    <rect x="29" y="36" width="10" height="18" rx="5" fill="#555" />
  </svg>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function LexiAssistPage() {
  const [activeNav, setActiveNav] = useState("tts");
  const [dark, setDark] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const fileRef = useRef();

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setUploadedFile(f);
  };
  const onFileInput = (e) => {
    const f = e.target.files[0];
    if (f) setUploadedFile(f);
  };

  const formatBytes = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
  const getExt = (name) => name.split(".").pop().toUpperCase().slice(0, 4);

  // ── Sidebar content ────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={css.logo}>
        <div style={css.logoIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span style={css.logoText}>LexiAssist</span>
      </div>

      {/* Dashboard link */}
      <div
        style={{
          ...css.navItem(false, dark),
          marginBottom: 8,
          color: "rgba(255,255,255,0.7)",
        }}
        onClick={() => setMobileOpen(false)}
      >
        <HomeIcon /> Dashboard
      </div>

      <div style={css.divider} />
      <div style={css.sectionLabel}>Section Title</div>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => (
        <div
          key={item.id}
          style={{
            ...css.navItem(activeNav === item.id, dark),
            ...(hoveredNav === item.id && activeNav !== item.id ? css.navItemHover : {}),
          }}
          onMouseEnter={() => setHoveredNav(item.id)}
          onMouseLeave={() => setHoveredNav(null)}
          onClick={() => { setActiveNav(item.id); setMobileOpen(false); }}
        >
          {item.icon}
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.hasChevron && <span style={css.navChevron}><ChevronDown /></span>}
        </div>
      ))}

      {/* Footer */}
      <div style={css.sidebarFooter}>
        <div style={css.avatarWrap}>
          <div style={css.avatar}>AE</div>
          <div style={css.avatarDot} />
        </div>
        <div style={css.userInfo}>
          <div style={css.userName}>Alison Eyo</div>
          <div style={css.userEmail}>alis@lexiassist</div>
        </div>
        <div style={css.logoutBtn}><LogoutIcon /></div>
      </div>
    </>
  );

  return (
    <div style={css.root}>
      {/* ── Desktop Sidebar ── */}
      <aside
        style={{
          ...css.sidebar(dark),
          display: "flex", // always visible on desktop
        }}
        className="lexi-sidebar"
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar ── */}
      {mobileOpen && (
        <>
          <div style={css.sidebarMobileOverlay} onClick={() => setMobileOpen(false)} />
          <aside style={css.sidebarMobile(dark)}>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── Main ── */}
      <main style={css.main(dark)}>
        {/* Topbar */}
        <div style={css.topbar(dark)}>
          <div style={css.topbarLeft}>
            <button
              className="lexi-hamburger"
              style={{ ...css.mobileMenuBtn, color: dark ? "#c8e6c9" : "#2d5a27" }}
              onClick={() => setMobileOpen(true)}
            >
              <HamburgerIcon />
            </button>
            <div>
              <div style={css.greeting(dark)}>Hello, Victoria!</div>
              <div style={css.subtitle}>Pick a tool to get started with</div>
            </div>
          </div>
          <div style={css.topActions}>
            <button style={css.iconBtn(dark)} title="Settings"><SettingsIcon /></button>
            <button
              style={css.iconBtn(dark)}
              title="Toggle dark mode"
              onClick={() => setDark((d) => !d)}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={css.content}>

          {/* Hero Card */}
          <div
            style={css.heroCard(dark)}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          >
            <HexPattern />
            <div style={css.heroIllustration}>
              <ReadingIllustration dark={dark} />
            </div>
            <div style={css.heroText}>
              <div style={css.heroBadge}>Learning Hub</div>
              <div style={css.heroTitle(dark)}>Text to speech Learning Hub</div>
              <div style={css.heroDesc(dark)}>
                Turn text into sound. Sit back, listen & watch the words light up as you learn.
              </div>
            </div>
          </div>

          {/* Upload Zone */}
          <div
            style={css.uploadZone(dragging, dark)}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !uploadedFile && fileRef.current.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,image/*"
              style={{ display: "none" }}
              onChange={onFileInput}
            />
            <div style={css.uploadIcon(dark)}>
              <UploadCloudIcon />
            </div>
            <div style={css.uploadTitle}>Click to upload or drag and drop</div>
            <div style={css.uploadSub}>PDF, DOC, TXT, image (Size maximum 25 MB)</div>
          </div>

          {/* File Preview */}
          {uploadedFile && (
            <div style={css.filePreview(dark)}>
              <div style={css.fileIcon}>{getExt(uploadedFile.name)}</div>
              <div>
                <div style={css.fileName(dark)}>{uploadedFile.name}</div>
                <div style={css.fileSize}>{formatBytes(uploadedFile.size)}</div>
              </div>
              <button
                style={css.removeBtn}
                onClick={() => setUploadedFile(null)}
                title="Remove file"
              >×</button>
            </div>
          )}
        </div>
      </main>

      {/* Responsive styles injected */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }

        @media (max-width: 768px) {
          .lexi-sidebar { display: none !important; }
          .lexi-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .lexi-hamburger { display: none !important; }
        }
      `}</style>
    </div>
  );
}
