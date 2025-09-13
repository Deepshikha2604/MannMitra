import React, { useMemo, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import './Header.css';
import { Sun, Moon, Bell, Bookmark, User as UserIcon, ChevronDown } from 'lucide-react';

// Order: Dashboard, Profile, Mood, Chat, Activities
const NAV_LINKS: Array<{ path: string; label: string }> = [
  { path: '/', label: 'Dashboard' },
  { path: '/profile', label: 'Profile' },
  { path: '/mood', label: 'Mood' },
  { path: '/chat', label: 'Chat' },
  { path: '/activities', label: 'Activities' },
  { path: '/programs', label: 'Programs' },
  { path: '/assessments', label: 'Assessments' },
  { path: '/resources', label: 'Resources' }
];

const LANGUAGES: Array<{ code: string; name: string }> = [
  { code: 'hi', name: 'हिंदी' },
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'mr', name: 'मराठी' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'اردو' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'or', name: 'ଓଡିଆ' },
  { code: 'as', name: 'অসমীয়া' }
];

const STRINGS: Record<string, { welcome: (name?: string) => string; searchPlaceholder: string; online: string }> = {
  hi: {
    welcome: (name?: string) => `स्वागत है, ${name || 'उपयोगकर्ता'}!`,
    searchPlaceholder: 'कुछ भी पूछें या संसाधन खोजें…',
    online: 'MannMitra ऑनलाइन है'
  },
  en: {
    welcome: (name?: string) => `Welcome, ${name || 'User'}!`,
    searchPlaceholder: 'Ask anything or search resources…',
    online: 'MannMitra is online'
  },
  bn: {
    welcome: (name?: string) => `স্বাগতম, ${name || 'ব্যবহারকারী'}!`,
    searchPlaceholder: 'যেকোন কিছু জিজ্ঞাসা করুন বা রিসোর্স খুঁজুন…',
    online: 'MannMitra অনলাইন'
  },
  ta: {
    welcome: (name?: string) => `வரவேற்பு, ${name || 'பயனர்'}!`,
    searchPlaceholder: 'ஏதுவும் கேளுங்கள் அல்லது வளங்களைத் தேடுங்கள்…',
    online: 'MannMitra ஆன்லைன்'
  },
  te: {
    welcome: (name?: string) => `స్వాగతం, ${name || 'వాడుకరి'}!`,
    searchPlaceholder: 'ఏదైనా అడగండి లేదా వనరులు శోధించండి…',
    online: 'MannMitra ఆన్లైన్‌లో ఉంది'
  },
  mr: {
    welcome: (name?: string) => `स्वागत आहे, ${name || 'वापरकर्ता'}!`,
    searchPlaceholder: 'काहीही विचारा किंवा संसाधने शोधा…',
    online: 'MannMitra ऑनलाइन'
  },
  gu: {
    welcome: (name?: string) => `સ્વાગત છે, ${name || 'વપરાશકર્તા'}!`,
    searchPlaceholder: 'કંઈપણ પૂછો અથવા સ્રોતો શોધો…',
    online: 'MannMitra ઑનલાઇન'
  },
  pa: {
    welcome: (name?: string) => `ਜੀ ਆਇਆ ਨੂੰ, ${name || 'ਯੂਜ਼ਰ'}!`,
    searchPlaceholder: 'ਕੁਝ ਵੀ ਪੁੱਛੋ ਜਾਂ ਸਰੋਤ ਲੱਭੋ…',
    online: 'MannMitra ਆਨਲਾਈਨ'
  },
  ur: {
    welcome: (name?: string) => `خوش آمدید، ${name || 'یوزر'}!`,
    searchPlaceholder: 'کچھ بھی پوچھیں یا وسائل تلاش کریں…',
    online: 'MannMitra آن لائن ہے'
  },
  kn: {
    welcome: (name?: string) => `ಸ್ವಾಗತ, ${name || 'ಬಳಕೆದಾರ'}!`,
    searchPlaceholder: 'ಯಾವುದನ್ನಾದರೂ ಕೇಳಿ ಅಥವಾ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಹುಡುಕಿ…',
    online: 'MannMitra ಆನ್‌ಲೈನ್'
  },
  ml: {
    welcome: (name?: string) => `സ്വാഗതം, ${name || 'ഉപയോക്താവ്'}!`,
    searchPlaceholder: 'ഏതും ചോദിക്കൂ അല്ലെങ്കിൽ resource തിരയൂ…',
    online: 'MannMitra ഓൺലൈൻ'
  },
  or: {
    welcome: (name?: string) => `ସ୍ୱାଗତ, ${name || 'ବ୍ୟବହାରକର୍ତ୍ତା'}!`,
    searchPlaceholder: 'କିଛି ପଚାରନ୍ତୁ କିମ୍ବା ସାଧନ ଖୋଜନ୍ତୁ…',
    online: 'MannMitra ଅନଲାଇନ୍'
  },
  as: {
    welcome: (name?: string) => `স্বাগতম, ${name || 'ব্যবহাৰকাৰী'}!`,
    searchPlaceholder: 'যিকোনো কথা সুধক বা উৎস সন্ধান কৰক…',
    online: 'MannMitra অনলাইন'
  }
};

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { sendMessage } = useChat();
  const [language, setLanguage] = useState<string>('hi');
  const [showLang, setShowLang] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [theme, setTheme] = useState<'light'|'dark'>(() => (localStorage.getItem('mm_theme') as 'light'|'dark') || 'light');
  const [showNotif, setShowNotif] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showUser, setShowUser] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mm_lang');
    if (saved) setLanguage(saved);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('mm_theme', theme);
    } catch {}
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
  }, [theme]);

  const onSelectLanguage = (code: string) => {
    setLanguage(code);
    localStorage.setItem('mm_lang', code);
    setShowLang(false);
  };

  const onSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      if (!user) {
        navigate('/login');
        return;
      }
      navigate('/chat');
      try {
        await sendMessage(query.trim());
        setQuery('');
      } catch (err) {
        // no-op; ChatContext already handles error message
      }
    }
  };

  const activePath = useMemo(() => {
    const match = NAV_LINKS.find(l => location.pathname === l.path || (l.path !== '/' && location.pathname.startsWith(l.path)));
    return match?.path ?? '/';
  }, [location.pathname]);

  return (
    <header className="mm-header">
      <div className="mm-topbar">
        <div className="mm-welcome">
          {user ? (STRINGS[language]?.welcome(user.name) || STRINGS.en.welcome(user.name)) : (STRINGS[language]?.welcome() || STRINGS.en.welcome())}
        </div>
        <div className="mm-top-actions">
          <div className="mm-lang">
            <button className="mm-utility" aria-haspopup="listbox" aria-expanded={showLang} onClick={() => setShowLang(v => !v)}>
              {LANGUAGES.find(l => l.code === language)?.name || 'Language'}
            </button>
            {showLang && (
              <ul className="mm-lang-list" role="listbox" aria-label="Select language">
                {LANGUAGES.map(l => (
                  <li key={l.code} role="option" aria-selected={l.code === language}>
                    <button onClick={() => onSelectLanguage(l.code)}>{l.name}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {user && (
            <button className="mm-logout" onClick={logout} aria-label="Logout">
              ⎋ Logout
            </button>
          )}
        </div>
      </div>

      <div className="mm-brandbar">
        <div className="mm-brand">
          <img className="mm-logo" src="/logo192.png" alt="MannMitra logo placeholder" />
          <div className="mm-title">
            <div className="mm-wordmark">MannMitra</div>
            <div className="mm-tagline">Walk together, heal together</div>
          </div>
        </div>

        <div className="mm-right">
          <div className="mm-status">
            <span className="mm-status-dot" aria-hidden="true" />
            <span className="mm-status-text">{STRINGS[language]?.online || STRINGS.en.online}</span>
          </div>
          <div className="mm-utils">
            <button className="mm-iconbtn" aria-label="Toggle theme" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="mm-menu">
              <button className="mm-iconbtn" aria-haspopup="menu" aria-expanded={showNotif} onClick={() => { setShowNotif(v=>!v); setShowSaved(false); setShowUser(false); }}>
                <Bell size={18} />
              </button>
              {showNotif && (
                <div className="mm-dropdown" role="menu">
                  <div className="mm-drop-title">Notifications</div>
                  <div className="mm-drop-item">Daily check‑in at 8 PM</div>
                  <div className="mm-drop-item">New program lesson unlocked</div>
                  <div className="mm-drop-item">Assessment reminder</div>
                </div>
              )}
            </div>

            <div className="mm-menu">
              <button className="mm-iconbtn" aria-haspopup="menu" aria-expanded={showSaved} onClick={() => { setShowSaved(v=>!v); setShowNotif(false); setShowUser(false); }}>
                <Bookmark size={18} />
              </button>
              {showSaved && (
                <div className="mm-dropdown" role="menu">
                  <div className="mm-drop-title">Saved</div>
                  {Object.entries(JSON.parse(localStorage.getItem('mm_resources_saved') || '{}')).filter(([_, v]) => v).length === 0 && (
                    <div className="mm-drop-item muted">No saved items</div>
                  )}
                  {Object.entries(JSON.parse(localStorage.getItem('mm_resources_saved') || '{}'))
                    .filter(([_, v]) => v)
                    .slice(0, 5)
                    .map(([id]) => (
                      <div key={id} className="mm-drop-item">Resource #{id}</div>
                    ))}
                  <Link to="/resources" className="mm-drop-link">View all</Link>
                </div>
              )}
            </div>

            <div className="mm-menu">
              <button className="mm-iconbtn" aria-haspopup="menu" aria-expanded={showUser} onClick={() => { setShowUser(v=>!v); setShowNotif(false); setShowSaved(false); }}>
                <UserIcon size={18} /> <ChevronDown size={16} />
              </button>
              {showUser && (
                <div className="mm-dropdown" role="menu">
                  <div className="mm-drop-title">{user?.name || 'User'}</div>
                  <Link to="/profile" className="mm-drop-link">Profile</Link>
                  {user ? (
                    <button className="mm-drop-action" onClick={logout}>Logout</button>
                  ) : (
                    <Link to="/login" className="mm-drop-link">Login</Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav className="mm-nav">
        <ul className="mm-navlist">
          {NAV_LINKS.map(link => (
            <li key={link.path} className={activePath === link.path ? 'active' : ''}>
              <Link to={link.path}>{link.label}</Link>
            </li>
          ))}
          <li>
            <Link to="/helpline" className="mm-crisis-link">Crisis Help</Link>
          </li>
        </ul>

        <div className="mm-command">
          <input
            className="mm-command-input"
            type="search"
            placeholder={STRINGS[language]?.searchPlaceholder || STRINGS.en.searchPlaceholder}
            aria-label="Ask MannMitra or search resources"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
          />
        </div>
      </nav>
    </header>
  );
};

export default Header;


