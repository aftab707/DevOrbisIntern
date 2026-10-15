import { useState } from 'react';
import Chatbot from './components/Chatbot';
import Extractor from './components/Extractor';
import './index.css';
import './App.css';

// ─── SVG Icons ─────────────────────────────────────────────────────────────
const IconBrain = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const IconDoc = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// ─── Sidebar nav items ─────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id: 'extractor',
    name: 'CV Extractor',
    desc: 'Parse & extract profiles',
    icon: <IconDoc />,
    badge: null,
  },
  {
    id: 'chat',
    name: 'AI Chat',
    desc: 'Streaming LLM assistant',
    icon: <IconBrain />,
    badge: 'Groq',
  },
];

// ─── Page titles ────────────────────────────────────────────────────────────
const PAGE_META = {
  extractor: {
    title: 'CV Extractor',
    subtitle: 'Paste any CV or profile text - AI will extract structured data instantly.',
    badgeText: 'Powered by Groq API',
  },
  chat: {
    title: 'AI Chat',
    subtitle: 'Real-time streaming chat powered by the Groq LLM API.',
    badgeText: 'Streaming · Live',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
function App() {
  const [activeTab, setActiveTab] = useState('extractor');
  const meta = PAGE_META[activeTab];

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">🤖</div>
          <div>
            <div className="logo-text">AI Suite</div>
            <div className="logo-sub">Week 2 Project</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-label">Modules</div>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="nav-item-icon">{item.icon}</div>
              <div className="nav-item-info">
                <span className="nav-item-name">{item.name}</span>
                <span className="nav-item-desc">{item.desc}</span>
              </div>
            </div>
          ))}
        </nav>

        {/* Footer badge */}
        <div className="sidebar-footer">
          <div className="sidebar-badge">
            <div className="badge-dot" />
            <div>
              <div className="badge-model">Groq LLaMA 3</div>
              <div className="badge-text">API connected</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-content">
        {/* Top bar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">{meta.title}</div>
            <div className="topbar-subtitle">{meta.subtitle}</div>
          </div>
          <div className="topbar-badge">
            <span className="topbar-dot" />
            {meta.badgeText}
          </div>
        </div>

        {/* Page */}
        <div className="page-area">
          {activeTab === 'chat'      && <Chatbot />}
          {activeTab === 'extractor' && <Extractor />}
        </div>
      </div>
    </div>
  );
}

export default App;
