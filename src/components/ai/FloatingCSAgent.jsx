import React, { useState, useRef, useEffect } from 'react';
import { aiChat } from '../../services/aiService';

// ============================================================================
// FloatingCSAgent — premium floating CS chat widget (bottom-right).
// Uses the CS_AGENT model via /api/ai/chat.
// ============================================================================

const SUGGESTIONS = [
  'Cara membeli item?',
  'Bagaimana refund?',
  'Cara top up saldo?',
  'Status pesanan saya',
];

function TypingDots() {
  return (
    <div className="cs-typing">
      <span /><span /><span />
    </div>
  );
}

function formatInline(text) {
  if (!text) return null;
  const str = String(text);
  const inlineRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)|(https?:\/\/[^\s)]+)|\*\*([^*]+)\*\*|`([^`]+)`)/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = inlineRegex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      elements.push(str.substring(lastIndex, match.index));
    }
    if (match[2] && match[3]) {
      // Markdown link [text](url)
      const url = match[3];
      elements.push(
        <a
          key={match.index}
          href={url}
          target={url.startsWith('http') ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="cs-link"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      // Raw URL
      const url = match[4];
      elements.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="cs-link"
        >
          {url}
        </a>
      );
    } else if (match[5]) {
      // **bold**
      elements.push(<strong key={match.index} className="cs-strong">{match[5]}</strong>);
    } else if (match[6]) {
      // `code`
      elements.push(<code key={match.index} className="cs-inline-code">{match[6]}</code>);
    }
    lastIndex = inlineRegex.lastIndex;
  }

  if (lastIndex < str.length) {
    elements.push(str.substring(lastIndex));
  }

  return elements.length > 0 ? elements : str;
}

function FormattedContent({ content }) {
  if (!content) return null;

  const rawLines = String(content).split('\n');
  const items = [];
  let listBuffer = null; // { type: 'ol' | 'ul', listItems: [] }

  const flushList = () => {
    if (!listBuffer) return;
    if (listBuffer.type === 'ol') {
      items.push(
        <ol key={`ol-${items.length}`} className="cs-ol">
          {listBuffer.listItems.map((li, idx) => (
            <li key={idx} className="cs-ol-item">
              <span className="cs-ol-num">{li.num}</span>
              <div className="cs-li-content">
                <div className="cs-li-main">{formatInline(li.title || li.text)}</div>
                {li.sublines && li.sublines.length > 0 && (
                  <ul className="cs-sub-ul">
                    {li.sublines.map((sub, sIdx) => (
                      <li key={sIdx} className="cs-sub-li">{formatInline(sub)}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      );
    } else {
      items.push(
        <ul key={`ul-${items.length}`} className="cs-ul">
          {listBuffer.listItems.map((li, idx) => (
            <li key={idx} className="cs-ul-item">
              <span className="cs-ul-bullet">✦</span>
              <div className="cs-li-content">
                <div className="cs-li-main">{formatInline(li.text)}</div>
                {li.sublines && li.sublines.length > 0 && (
                  <ul className="cs-sub-ul">
                    {li.sublines.map((sub, sIdx) => (
                      <li key={sIdx} className="cs-sub-li">{formatInline(sub)}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      );
    }
    listBuffer = null;
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Check for ordered list: "1. **Title** ..." or "1. Text"
    const olMatch = trimmed.match(/^(\d+)[.)]\s+(.*)/);
    if (olMatch) {
      if (!listBuffer || listBuffer.type !== 'ol') {
        flushList();
        listBuffer = { type: 'ol', listItems: [] };
      }
      listBuffer.listItems.push({ num: olMatch[1], text: olMatch[2], sublines: [] });
      continue;
    }

    // Check for sub-bullet under an active list item (starts with indent or dash)
    const subMatch = line.match(/^(\s{2,}|\t)[-*•]\s+(.*)/) || (listBuffer && trimmed.match(/^[-*•]\s+(.*)/) && listBuffer.listItems.length > 0 && line.startsWith(' '));
    if (subMatch && listBuffer && listBuffer.listItems.length > 0) {
      const lastLi = listBuffer.listItems[listBuffer.listItems.length - 1];
      lastLi.sublines.push(subMatch[2] || subMatch[1]);
      continue;
    }

    // Check for main unordered bullet: "- Text" or "* Text" or "• Text"
    const ulMatch = trimmed.match(/^[-*•]\s+(.*)/);
    if (ulMatch) {
      if (!listBuffer || listBuffer.type !== 'ul') {
        flushList();
        listBuffer = { type: 'ul', listItems: [] };
      }
      listBuffer.listItems.push({ text: ulMatch[1], sublines: [] });
      continue;
    }

    // If there's an active list item and this line is indented text, append to sublines
    if (listBuffer && listBuffer.listItems.length > 0 && line.startsWith('  ')) {
      const lastLi = listBuffer.listItems[listBuffer.listItems.length - 1];
      lastLi.sublines.push(trimmed);
      continue;
    }

    // Regular line / paragraph
    flushList();

    if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 80) {
      items.push(
        <div key={`heading-${items.length}`} className="cs-heading">
          {formatInline(trimmed)}
        </div>
      );
    } else {
      items.push(
        <p key={`p-${items.length}`} className="cs-p">
          {formatInline(trimmed)}
        </p>
      );
    }
  }

  flushList();

  return <div className="cs-rich-text">{items}</div>;
}

function Message({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <div className={`cs-msg ${isBot ? 'cs-msg--bot' : 'cs-msg--user'}`}>
      {isBot && (
        <div className="cs-msg-avatar">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="url(#avatar-grad)"/>
            <defs>
              <linearGradient id="avatar-grad" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0%" stopColor="#7c3aed"/>
                <stop offset="100%" stopColor="#2563eb"/>
              </linearGradient>
            </defs>
            <path d="M7 15c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="8" r="2.5" fill="#fff"/>
          </svg>
        </div>
      )}
      <div className="cs-msg-bubble">
        {isBot ? <FormattedContent content={msg.content} /> : msg.content}
      </div>
    </div>
  );
}

export default function FloatingCSAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo! 👋 Saya CS Agent GHub. Ada yang bisa saya bantu?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const navbar = document.querySelector('.header.navbar');
    if (!navbar) return undefined;

    const updateNavbarHeight = () => {
      document.documentElement.style.setProperty('--cs-navbar-height', `${navbar.getBoundingClientRect().height}px`);
    };

    updateNavbarHeight();
    const observer = new ResizeObserver(updateNavbarHeight);
    observer.observe(navbar);
    window.addEventListener('resize', updateNavbarHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateNavbarHeight);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await aiChat(q);
      let reply = res?.data?.reply || res?.reply;
      if (!reply && res?.ok === false) {
        throw new Error(res.error || 'AI_ERROR');
      }
      reply = reply || 'Maaf, saya tidak dapat memproses pertanyaan Anda saat ini.';
      reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\/?think>/gi, '').trim();
      if (!reply) reply = 'Halo! Ada yang bisa saya bantu terkait transaksi atau pesanan Anda di GHub?';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      if (!open) setUnread((n) => n + 1);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message;
      const message = errorMessage === 'AI_DISABLED'
        ? 'Layanan AI sedang dinonaktifkan. Silakan hubungi tim support GHub.'
        : errorMessage === 'AI_PROVIDER_UNAVAILABLE'
          ? 'Provider AI GHub sedang tidak tersedia. Pastikan service AI terdaftar sedang berjalan, lalu coba lagi.'
        : 'Terjadi kendala saat menghubungi AI GHub. Silakan coba lagi.';
      setMessages((prev) => [...prev, { role: 'assistant', content: message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        id="cs-agent-fab"
        className={`cs-fab ${open ? 'cs-fab--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Buka CS Agent"
        title="CS Agent GHub"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="3.5" fill="currentColor"/>
            <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1l-1 2-1-2H9a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        )}
        {!open && unread > 0 && <span className="cs-badge">{unread}</span>}
      </button>

      {/* Chat Panel */}
      <div className={`cs-panel ${open ? 'cs-panel--open' : ''}`} role="dialog" aria-label="CS Agent GHub">
        {/* Header */}
        <div className="cs-header">
          <div className="cs-header-avatar">
            <svg viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="18" fill="url(#hg)"/>
              <defs>
                <linearGradient id="hg" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#2563eb"/>
                </linearGradient>
              </defs>
              <circle cx="18" cy="13" r="4" fill="#fff"/>
              <path d="M8 30c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="cs-online-dot" />
          </div>
          <div className="cs-header-info">
            <div className="cs-header-name">CS Agent GHub</div>
            <div className="cs-header-status">
              <span className="cs-dot-pulse" />
              Online · Siap Membantu
            </div>
          </div>
          <button className="cs-close-btn" onClick={() => setOpen(false)} aria-label="Tutup">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="cs-messages">
          {messages.map((m, i) => <Message key={i} msg={m} />)}
          {loading && (
            <div className="cs-msg cs-msg--bot">
              <div className="cs-msg-avatar">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="url(#avatar-grad2)"/>
                  <defs>
                    <linearGradient id="avatar-grad2" x1="0" y1="0" x2="24" y2="24">
                      <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#2563eb"/>
                    </linearGradient>
                  </defs>
                  <path d="M7 15c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="8" r="2.5" fill="#fff"/>
                </svg>
              </div>
              <div className="cs-msg-bubble"><TypingDots /></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && !loading && (
          <div className="cs-suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="cs-suggestion-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="cs-input-bar">
          <input
            ref={inputRef}
            className="cs-input"
            type="text"
            placeholder="Ketik pertanyaan Anda..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            maxLength={500}
          />
          <button
            className="cs-send-btn"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            aria-label="Kirim"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
            </svg>
          </button>
        </div>
        <div className="cs-footer">Powered by <strong>GHub CS_AGENT</strong> · AI</div>
      </div>
    </>
  );
}
