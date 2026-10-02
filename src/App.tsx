import { type Dispatch, type FormEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpenText,
  Briefcase,
  BriefcaseBusiness,
  Check,
  Building2,
  Clock3,
  CircleCheck,
  GraduationCap,
  Heart,
  LaptopMinimal,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  MoonStar,
  Search,
  SlidersHorizontal,
  Sparkles,
  Rocket,
  Star,
  SunMedium,
  Target,
  TrendingUp,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import {
  demoApplications,
  demoNotifications,
  defaults,
  getTrendingOpportunities,
  homeCareerHighlights,
  internships,
  jobs,
  opportunityCategories,
  upcomingStats,
  workflowSteps,
} from './data/demoData';
import { exploreOpportunities } from './data/exploreData';
import type { Application, ExploreOpportunity, Internship, Job, NotificationItem, Opportunity, OpportunityHubKind, SavedItem, ThemeMode, User } from './types';

const STORAGE_KEYS = {
  theme: 'careerNest.theme',
  user: 'careerNest.user',
  users: 'careerNest.users',
  saved: 'careerNest.saved',
  applications: 'careerNest.applications',
  notifications: 'careerNest.notifications',
};

type CinematicTransitionKind = 'rocket' | 'career' | 'success';
type CinematicTransitionState = { id: number; kind: CinematicTransitionKind; destination: string };

const createUser = (name: string, email: string, password: string): User => ({
  id: `user-${Date.now()}`,
  name,
  email,
  password,
  phone: '',
  location: '',
  college: '',
  degree: '',
  graduationYear: '',
  skills: '',
  experience: '',
  resume: '',
});

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key: string, value: unknown) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const defaultUsers: User[] = [
  {
    id: 'demo-user',
    name: defaults.profile.name,
    email: defaults.profile.email,
    password: 'demo1234',
    phone: defaults.profile.phone,
    location: defaults.profile.location,
    college: defaults.profile.college,
    degree: defaults.profile.degree,
    graduationYear: defaults.profile.graduationYear,
    skills: defaults.profile.skills,
    experience: defaults.profile.experience,
    resume: defaults.profile.resume,
  },
];

type ApplicationDraft = {
  name: string;
  email: string;
  phone: string;
  resume: string;
  coverLetter: string;
};

const initialDraft: ApplicationDraft = {
  name: '',
  email: '',
  phone: '',
  resume: '',
  coverLetter: '',
};

function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <CareerNestApp />
      </MotionConfig>
    </BrowserRouter>
  );
}

function CareerNestApp() {
  const [theme, setTheme] = useState<ThemeMode>(() => readStorage<ThemeMode>(STORAGE_KEYS.theme, 'system'));
  const [currentUser, setCurrentUser] = useState<User | null>(() => readStorage<User | null>(STORAGE_KEYS.user, null));
  const [users, setUsers] = useState<User[]>(() => readStorage<User[]>(STORAGE_KEYS.users, defaultUsers));
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => readStorage<SavedItem[]>(STORAGE_KEYS.saved, []));
  const [applications, setApplications] = useState<Application[]>(() => readStorage<Application[]>(STORAGE_KEYS.applications, demoApplications));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => readStorage<NotificationItem[]>(STORAGE_KEYS.notifications, demoNotifications));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [cinematicTransition, setCinematicTransition] = useState<CinematicTransitionState | null>(null);
  const cinematicTimer = useRef<number | null>(null);
  const cinematicStateRef = useRef<CinematicTransitionState | null>(null);
  const completedTransitionRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    writeStorage(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.user, currentUser);
  }, [currentUser]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.users, users);
  }, [users]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.saved, savedItems);
  }, [savedItems]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.applications, applications);
  }, [applications]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.notifications, notifications);
  }, [notifications]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const syncTheme = () => {
      const resolvedTheme = theme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme;
      document.documentElement.setAttribute('data-theme', resolvedTheme);
    };

    syncTheme();
    mediaQuery.addEventListener('change', syncTheme);
    return () => mediaQuery.removeEventListener('change', syncTheme);
  }, [theme]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => () => {
    if (cinematicTimer.current !== null) window.clearTimeout(cinematicTimer.current);
  }, []);

  const completeCinematicTransition = (id: number) => {
    const active = cinematicStateRef.current;
    if (!active || active.id !== id || completedTransitionRef.current === id) return;
    completedTransitionRef.current = id;
    if (cinematicTimer.current !== null) window.clearTimeout(cinematicTimer.current);
    navigate(active.destination);
    cinematicTimer.current = window.setTimeout(() => {
      if (cinematicStateRef.current?.id === id) {
        cinematicStateRef.current = null;
        setCinematicTransition(null);
      }
      cinematicTimer.current = null;
    }, 150);
  };

  const startCinematicTransition = (kind: CinematicTransitionKind, destination: string) => {
    if (prefersReducedMotion) {
      navigate(destination);
      return;
    }
    if (cinematicTimer.current !== null) window.clearTimeout(cinematicTimer.current);
    const transition = { kind, destination, id: Date.now() };
    cinematicStateRef.current = transition;
    completedTransitionRef.current = null;
    setCinematicTransition(transition);
    cinematicTimer.current = window.setTimeout(() => completeCinematicTransition(transition.id), 1000);
  };

  const startTransitionFromLink = (event: ReactMouseEvent<HTMLAnchorElement>, kind: CinematicTransitionKind, destination: string) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    startCinematicTransition(kind, destination);
  };

  const toggleSave = (item: SavedItem) => {
    setSavedItems((current) => {
      const exists = current.some((saved) => saved.id === item.id && saved.type === item.type);
      if (exists) {
        return current.filter((saved) => !(saved.id === item.id && saved.type === item.type));
      }
      return [...current, item];
    });
  };

  const isSaved = (id: string, type: 'job' | 'internship') => savedItems.some((item) => item.id === id && item.type === type);

  const handleSignup = (name: string, email: string, password: string) => {
    const nextUser = createUser(name, email, password);
    setUsers((current) => {
      const exists = current.some((user) => user.email.toLowerCase() === email.toLowerCase());
      if (!exists) {
        return [...current, nextUser];
      }
      return current.map((user) => (user.email.toLowerCase() === email.toLowerCase() ? { ...user, name, password } : user));
    });
    setCurrentUser(nextUser);
  };

  const handleSignin = (email: string, password: string) => {
    const matched = users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password);
    if (!matched) {
      return false;
    }
    setCurrentUser(matched);
    startCinematicTransition('success', '/dashboard');
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setNotificationOpen(false);
  };

  const submitApplication = (payload: ApplicationDraft, opportunity: Job | Internship) => {
    const application: Application = {
      id: `app-${Date.now()}`,
      opportunityId: opportunity.id,
      type: opportunity.title.includes('Intern') || 'duration' in opportunity ? 'internship' : 'job',
      title: opportunity.title,
      company: opportunity.company,
      status: 'Applied',
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      resume: payload.resume || 'resume.pdf',
      coverLetter: payload.coverLetter,
      createdAt: new Date().toISOString(),
    };

    setApplications((current) => [application, ...current]);
    setNotifications((current) => [
      {
        id: `note-${Date.now()}`,
        title: 'Application submitted',
        message: `Your application for ${opportunity.title} at ${opportunity.company} has been received.`,
        time: 'Just now',
        read: false,
      },
      ...current,
    ]);
  };

  const navbarLinks = [
    { name: 'Home', to: '/' },
    { name: 'Jobs', to: '/jobs' },
    { name: 'Internships', to: '/internships' },
    { name: 'Competitions', to: '/competitions' },
    { name: 'Courses', to: '/courses' },
    { name: 'Mentorship', to: '/mentorship' },
  ];

  return (
    <>
      <Navbar
        theme={theme}
        setTheme={setTheme}
        currentUser={currentUser}
        notifications={notifications}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        notificationOpen={notificationOpen}
        setNotificationOpen={setNotificationOpen}
        onLogout={handleLogout}
        links={navbarLinks}
      />

      <LayoutGroup id="career-nest-routes">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.34, ease: 'easeOut' }}
            className="page-shell"
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage onExploreJobs={(event) => startTransitionFromLink(event, 'rocket', '/jobs')} onFindInternships={(event) => startTransitionFromLink(event, 'career', '/internships')} isSaved={isSaved} onToggleSave={toggleSave} />} />
              <Route path="/jobs" element={<JobsPage isSaved={isSaved} onToggleSave={toggleSave} />} />
              <Route path="/jobs/:id" element={<JobDetailPage onToggleSave={toggleSave} isSaved={isSaved} currentUser={currentUser} submitApplication={submitApplication} />} />
              <Route path="/internships" element={<InternshipsPage isSaved={isSaved} onToggleSave={toggleSave} />} />
              <Route path="/internships/:id" element={<InternshipDetailPage onToggleSave={toggleSave} isSaved={isSaved} currentUser={currentUser} submitApplication={submitApplication} />} />
              <Route path="/signin" element={currentUser && !cinematicTransition ? <Navigate to="/dashboard" replace /> : <SignInPage onSubmit={handleSignin} />} />
              <Route path="/signup" element={currentUser ? <Navigate to="/dashboard" replace /> : <SignUpPage onSubmit={handleSignup} />} />
              <Route path="/dashboard" element={currentUser ? <DashboardPage user={currentUser} applications={applications} /> : <Navigate to="/signin" replace />} />
              <Route path="/profile" element={currentUser ? <ProfilePage user={currentUser} setUsers={setUsers} setCurrentUser={setCurrentUser} /> : <Navigate to="/signin" replace />} />
              <Route path="/saved" element={currentUser ? <SavedPage onToggleSave={toggleSave} /> : <Navigate to="/signin" replace />} />
              <Route path="/applications" element={currentUser ? <ApplicationsPage applications={applications} /> : <Navigate to="/signin" replace />} />
              <Route path="/competitions" element={<OpportunityHubPage kind="competitions" />} />
              <Route path="/competitions/:id" element={<OpportunityDetailPage kind="competitions" />} />
              <Route path="/hackathons" element={<OpportunityHubPage kind="hackathons" />} />
              <Route path="/hackathons/:id" element={<OpportunityDetailPage kind="hackathons" />} />
              <Route path="/courses" element={<OpportunityHubPage kind="courses" />} />
              <Route path="/courses/:id" element={<OpportunityDetailPage kind="courses" />} />
              <Route path="/mentorship" element={<OpportunityHubPage kind="mentorship" />} />
              <Route path="/mentorship/:id" element={<OpportunityDetailPage kind="mentorship" />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
      </LayoutGroup>

      <AnimatePresence>
        {cinematicTransition && (
          <CinematicTransition
            key={cinematicTransition.id}
            kind={cinematicTransition.kind}
            onComplete={() => completeCinematicTransition(cinematicTransition.id)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}

function Navbar({
  theme,
  setTheme,
  currentUser,
  notifications,
  mobileMenuOpen,
  setMobileMenuOpen,
  notificationOpen,
  setNotificationOpen,
  onLogout,
  links,
}: {
  theme: ThemeMode;
  setTheme: (value: ThemeMode) => void;
  currentUser: User | null;
  notifications: NotificationItem[];
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
  notificationOpen: boolean;
  setNotificationOpen: (value: boolean) => void;
  onLogout: () => void;
  links: Array<{ name: string; to: string }>;
}) {
  const unreadCount = notifications.filter((note) => !note.read).length;
  const [profileMenuOpenAt, setProfileMenuOpenAt] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const isProfileMenuOpen = profileMenuOpenAt === location.pathname;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpenAt(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileMenuOpenAt(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="container nav-wrap">
        <Link to="/" className="brand" aria-label="CareerNest home">
          <span className="brand-mark">C</span>
          <span>CareerNest</span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <div className="theme-switcher" aria-label="Theme selector">
            <button type="button" className={theme === 'light' ? 'theme-btn active' : 'theme-btn'} onClick={() => setTheme('light')} aria-label="Light mode">
              <SunMedium size={15} />
            </button>
            <button type="button" className={theme === 'dark' ? 'theme-btn active' : 'theme-btn'} onClick={() => setTheme('dark')} aria-label="Dark mode">
              <MoonStar size={15} />
            </button>
            <button type="button" className={theme === 'system' ? 'theme-btn active' : 'theme-btn'} onClick={() => setTheme('system')} aria-label="System theme">
              <LaptopMinimal size={15} />
            </button>
          </div>

          <GlobalSearch />

          <div className="notification-wrap">
            <button type="button" className="icon-button" aria-label="Notifications" onClick={() => setNotificationOpen(!notificationOpen)}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {notificationOpen && <NotificationDropdown notifications={notifications} onClose={() => setNotificationOpen(false)} />}
          </div>

          {currentUser ? (
            <div className="user-menu-wrap" ref={profileMenuRef}>
              <button
                type="button"
                className="user-pill"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setNotificationOpen(false);
                  setProfileMenuOpenAt(isProfileMenuOpen ? null : location.pathname);
                }}
              >
                <span className="avatar">{currentUser.name.charAt(0).toUpperCase()}</span>
                <span>{currentUser.name.split(' ')[0]}</span>
              </button>
              {isProfileMenuOpen && (
                <div className="user-dropdown" role="menu">
                  <Link to="/dashboard" onClick={() => setProfileMenuOpenAt(null)}>Dashboard</Link>
                  <Link to="/profile" onClick={() => setProfileMenuOpenAt(null)}>Profile</Link>
                  <Link to="/saved" onClick={() => setProfileMenuOpenAt(null)}>Saved</Link>
                  <Link to="/applications" onClick={() => setProfileMenuOpenAt(null)}>Applications</Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpenAt(null);
                      onLogout();
                    }}
                    className="logout-link"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-actions">
              <Link to="/signin" className="link-button muted">Sign In</Link>
              <Link to="/signup" className="primary-button small">Sign Up</Link>
            </div>
          )}

          <button type="button" className="mobile-toggle" aria-label="Toggle menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `mobile-link${isActive ? ' active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              {link.name}
            </NavLink>
          ))}
          {currentUser ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              <Link to="/saved" onClick={() => setMobileMenuOpen(false)}>Saved</Link>
              <Link to="/applications" onClick={() => setMobileMenuOpen(false)}>Applications</Link>
              <button type="button" className="mobile-logout" onClick={() => { onLogout(); setMobileMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function GlobalSearch() {
  const [query, setQuery] = useState('');
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const allResults = [...jobs, ...internships].map((item) => ({
      id: item.id,
      label: item.title,
      type: item.company,
      path: item.title.includes('Intern') ? `/internships/${item.id}` : `/jobs/${item.id}`,
    }));
    return allResults.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()) || item.type.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  }, [query]);

  return (
    <div className="global-search-wrap">
      <div className="search-field compact">
        <Search size={16} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search opportunities"
          aria-label="Search jobs and internships"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="search-dropdown">
          {suggestions.map((result) => (
            <Link key={result.id} to={result.path} onClick={() => setQuery('')}>
              <span>{result.label}</span>
              <small>{result.type}</small>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationDropdown({ notifications, onClose }: { notifications: NotificationItem[]; onClose: () => void }) {
  return (
    <div className="notification-panel">
      <div className="panel-header">
        <h4>Notifications</h4>
        <button type="button" className="ghost-button" onClick={onClose}>Close</button>
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <p className="empty-note">No notifications yet.</p>
        ) : (
          notifications.slice(0, 4).map((item) => (
            <div key={item.id} className={`notification-item ${item.read ? 'read' : ''}`}>
              <div className="dot" />
              <div>
                <strong>{item.title}</strong>
                <p>{item.message}</p>
                <span>{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function HomePage({
  onExploreJobs,
  onFindInternships,
  isSaved,
  onToggleSave,
}: {
  onExploreJobs: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
  onFindInternships: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
  isSaved: (id: string, type: 'job' | 'internship') => boolean;
  onToggleSave: (item: SavedItem) => void;
}) {
  const [featuredTab, setFeaturedTab] = useState<'All' | 'Jobs' | 'Internships'>('All');
  const featuredItems = getTrendingOpportunities.filter((item) => featuredTab === 'All' || item.type === (featuredTab === 'Jobs' ? 'job' : 'internship'));
  const categoryMetrics: Record<string, string> = {
    Jobs: `${jobs.length} sample roles`,
    Internships: `${internships.length} sample placements`,
    Competitions: `${exploreOpportunities.competitions.length} sample challenges`,
    Hackathons: `${exploreOpportunities.hackathons.length} sample events`,
    Courses: `${exploreOpportunities.courses.length} sample paths`,
    Mentorship: `${exploreOpportunities.mentorship.length} sample mentors`,
  };
  const featureTitles = ['Discover Smarter', 'Personalized Recommendations', 'Application Tracking', 'Career Growth'];
  const companyNames = ['Northstar Labs', 'PixelPeak', 'NovaTech', 'Verve Cloud', 'Spark Commerce', 'RouteFlow'];

  return (
    <>
      <HeroSection onExploreJobs={onExploreJobs} onFindInternships={onFindInternships} />
      <section className="container trusted-section" aria-label="Sample companies">
        <p>Opportunities from teams you'll love <span>DEMO COMPANIES</span></p>
        <div className="trusted-company-row">
          {companyNames.map((company, index) => (
            <div className={`trusted-company trusted-company-${index + 1}`} key={company}>
              <span>{company.slice(0, 1)}</span>{company}
            </div>
          ))}
        </div>
      </section>

      <section className="container section-block" id="opportunities">
        <SectionHeading title="Explore Opportunities" subtitle="A focused place to discover your next move, at every stage of your career." />
        <motion.div className="category-grid" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}>
          {opportunityCategories.map((category) => (
            <CategoryCard
              key={category.title}
              category={category}
              metric={categoryMetrics[category.title]}
              onClick={category.href === '/jobs' ? onExploreJobs : category.href === '/internships' ? onFindInternships : undefined}
            />
          ))}
        </motion.div>
      </section>

      <section className="container section-block featured-section" id="featured">
        <div className="featured-heading-row">
          <SectionHeading title="Featured Opportunities" subtitle="A few handpicked sample roles to get your search moving." />
          <div className="featured-tabs" role="tablist" aria-label="Filter featured opportunities">
            {(['All', 'Jobs', 'Internships'] as const).map((tab) => (
              <button key={tab} type="button" role="tab" aria-selected={featuredTab === tab} className={featuredTab === tab ? 'featured-tab active' : 'featured-tab'} onClick={() => setFeaturedTab(tab)}>{tab}</button>
            ))}
          </div>
        </div>
        <div className="featured-opportunity-grid">
          {featuredItems.map((opportunity, index) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} featured index={index} isSaved={isSaved(opportunity.id, opportunity.type)} onToggleSave={onToggleSave} />
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="stats-feature-panel">
          <div className="stats-feature-heading">
            <div>
              <span className="eyebrow">A community in motion</span>
              <h2>Momentum for your next move.</h2>
            </div>
            <span className="demo-tag">SAMPLE METRICS</span>
          </div>
          <div className="stats-wrap">
            {upcomingStats.map((stat, index) => (
              <StatCard key={stat.label} value={stat.value} label={stat.label} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="container section-block">
        <SectionHeading title="Your Career Journey Starts Here" subtitle="A clear path from first profile to confident next step." />
        <div className="journey-track">
          {workflowSteps.map((step, index) => (
            <motion.article key={step.title} className="journey-step" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: index * 0.1, duration: 0.35 }}>
              <span className="journey-number">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="container section-block why-section">
        <SectionHeading title="Why CareerNest" subtitle="A more considered way to move from possibility to progress." />
        <div className="feature-grid">
          {homeCareerHighlights.map((feature, index) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.08 }} className="feature-card card-panel">
              <div className="icon-tile">
                {index === 0 && <Search size={22} />}
                {index === 1 && <Star size={22} />}
                {index === 2 && <LayoutGrid size={22} />}
                {index === 3 && <Target size={22} />}
              </div>
              <h3>{featureTitles[index]}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="career-path-panel">
          <div className="career-path-copy">
            <span className="eyebrow">Your next chapter</span>
            <h2>From First Step to Career Growth</h2>
            <p>Build momentum one thoughtful step at a time. CareerNest brings the tools and opportunities together so you can focus on what comes next.</p>
            <Link to="/signup" className="inline-link">Build your profile <ArrowRight size={16} /></Link>
          </div>
          <div className="career-path-visual" aria-label="Career path from profile to growth">
            {['Profile', 'Skills', 'Internship', 'Job', 'Career Growth'].map((label, index) => (
              <motion.div key={label} className={`career-path-node career-path-node-${index + 1}`} initial={{ opacity: 0.45, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 }}>
                <span>{index === 4 ? <TrendingUp size={18} /> : <CircleCheck size={16} />}</span>{label}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container cta-section">
        <div className="cta-box">
          <div>
            <span className="eyebrow">Career growth starts here</span>
            <h2>Your Next Opportunity Is Waiting.</h2>
          </div>
          <div className="cta-actions">
            <Link to="/jobs" className="primary-button" onClick={onExploreJobs}>Explore Jobs <ArrowRight size={18} /></Link>
            <Link to="/signup" className="secondary-button">Create Free Account</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroSection({
  onExploreJobs,
  onFindInternships,
}: {
  onExploreJobs: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
  onFindInternships: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 60, damping: 20, mass: 0.8 });
  const springY = useSpring(pointerY, { stiffness: 60, damping: 20, mass: 0.8 });
  const visualX = useTransform(springX, [-1, 1], [-7, 7]);
  const visualY = useTransform(springY, [-1, 1], [-5, 5]);
  const reduceMotion = useReducedMotion();

  const updateParallax = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
  };

  const resetParallax = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section className="hero-section">
      <div className="hero-orb orb-one" />
      <div className="hero-orb orb-two" />
      <div className="hero-orb orb-three" />

      <div className="container hero-grid">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="hero-copy">
          <span className="eyebrow">CAREER OPPORTUNITIES, REIMAGINED</span>
          <h1>Find Your Next<br /><span>Career Opportunity.</span></h1>
          <p>Discover jobs, internships, competitions and learning opportunities built to move your career forward.</p>
          <div className="hero-actions">
            <Link to="/jobs" className="primary-button" onClick={onExploreJobs}>Explore Jobs <ArrowRight size={18} /></Link>
            <Link to="/internships" className="secondary-button" onClick={onFindInternships}>Find Internships</Link>
          </div>
          <Link to="#opportunities" className="hero-text-link">Explore all opportunities <ArrowRight size={16} /></Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65, delay: 0.12 }} className="hero-visual" style={{ x: visualX, y: visualY }} onPointerMove={updateParallax} onPointerLeave={resetParallax} aria-label="CareerNest opportunity dashboard preview">
          <div className="hero-visual-glow" />
          <motion.div className="hero-opportunity-card" animate={{ y: [0, -7, 0], rotate: [-1, 0.5, -1] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="hero-card-header"><span className="hero-live-dot" /> Your next opportunity <ArrowUpRight size={16} /></div>
            <div className="hero-role-logo">NL</div>
            <div className="hero-role-copy"><strong>Product Engineer</strong><span>Northstar Labs · Hybrid</span></div>
            <div className="hero-role-match"><strong>94%</strong><span>profile match</span></div>
            <div className="hero-card-divider" />
            <div className="hero-skills-row"><span>React</span><span>TypeScript</span><span>Product</span></div>
          </motion.div>
          <motion.div className="hero-profile-card" animate={{ y: [0, 6, 0], rotate: [1.5, 0.5, 1.5] }} transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="hero-profile-top"><span className="hero-profile-avatar">AS</span><span><strong>Profile strength</strong><small>Almost there</small></span><span className="hero-profile-percent">82%</span></div>
            <div className="hero-profile-track"><span /></div>
            <div className="hero-profile-note"><CircleCheck size={14} /> Add one project to stand out</div>
          </motion.div>
          <motion.div className="hero-growth-card" animate={{ y: [0, -5, 0], rotate: [-2, -1, -2] }} transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}>
            <span className="growth-icon"><TrendingUp size={17} /></span><span><strong>Career momentum</strong><small>3 new matches this week</small></span><ArrowUpRight size={16} />
            <div className="growth-bars"><i /><i /><i /><i /><i /><i /><i /></div>
          </motion.div>
          <motion.div className="hero-internship-card" animate={{ y: [0, 5, 0], rotate: [2, 1, 2] }} transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}>
            <span className="hero-internship-mark">SC</span>
            <span><small>INTERNSHIP</small><strong>UX Design Intern</strong><em>Spark Commerce · Remote</em></span>
          </motion.div>
          <div className="hero-logo-orbit" aria-hidden="true"><span>PP</span><span>VC</span><span>SC</span></div>
          <div className="hero-particles" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        </motion.div>
      </div>
    </section>
  );
}

function CinematicTransition({ kind, onComplete }: { kind: CinematicTransitionKind; onComplete: () => void }) {
  return (
    <motion.div
      className={`cinematic-transition cinematic-transition-${kind}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      aria-hidden="true"
    >
      <div className="cinematic-shade" />
      {kind === 'rocket' && (
        <motion.div
          className="rocket-flight"
          initial={{ opacity: 0, x: '-2vw', y: '20vh', rotate: 30, scale: 0.82 }}
          animate={{ opacity: [0, 1, 1, 0], x: '12vw', y: '-72vh', rotate: 42, scale: [0.82, 1, 0.94] }}
          transition={{ duration: 0.74, ease: 'easeInOut', times: [0, 0.2, 0.8, 1] }}
          onAnimationComplete={onComplete}
        >
          <Rocket size={34} strokeWidth={1.8} />
          <span className="rocket-flame" />
          <span className="rocket-trail" />
          <span className="rocket-particles"><i /><i /><i /></span>
        </motion.div>
      )}
      {kind === 'career' && (
        <div className="career-flight">
          <motion.span className="career-token career-token-cap" initial={{ opacity: 0, x: '-10vw', y: '12vh', rotate: -14 }} animate={{ opacity: [0, 0.9, 0], x: '8vw', y: '-22vh', rotate: 8 }} transition={{ duration: 0.82, ease: 'easeInOut' }}>
            <GraduationCap size={30} strokeWidth={1.7} />
          </motion.span>
          <motion.span className="career-token career-token-case" initial={{ opacity: 0, x: '5vw', y: '18vh', rotate: 12 }} animate={{ opacity: [0, 0.85, 0], x: '-8vw', y: '-30vh', rotate: -5 }} transition={{ duration: 0.78, delay: 0.08, ease: 'easeInOut' }}>
            <BriefcaseBusiness size={26} strokeWidth={1.7} />
          </motion.span>
          <motion.span className="career-token career-token-spark" initial={{ opacity: 0, x: '8vw', y: '6vh', scale: 0.7 }} animate={{ opacity: [0, 0.8, 0], x: '-4vw', y: '-18vh', scale: [0.7, 1, 0.85] }} transition={{ duration: 0.72, delay: 0.15, ease: 'easeOut' }} onAnimationComplete={onComplete}>
            <Sparkles size={22} strokeWidth={1.8} />
          </motion.span>
        </div>
      )}
      {kind === 'success' && (
        <motion.div
          className="success-transition-mark"
          initial={{ opacity: 0, scale: 0.72, y: 8 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.72, 1.04, 1, 0.98], y: [8, 0, 0, -4] }}
          transition={{ duration: 0.62, ease: 'easeOut' }}
          onAnimationComplete={onComplete}
        >
          <Check size={30} strokeWidth={2.2} />
        </motion.div>
      )}
    </motion.div>
  );
}

function JobsPage({ isSaved, onToggleSave }: { isSaved: (id: string, type: 'job' | 'internship') => boolean; onToggleSave: (item: SavedItem) => void }) {
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [salary, setSalary] = useState('All');
  const [skills, setSkills] = useState('All');
  const [sortBy, setSortBy] = useState('Relevance');

  const filteredJobs = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    const list = jobs.filter((job) => {
      const matchesSearch =
        !normalizedSearch ||
        job.title.toLowerCase().includes(normalizedSearch) ||
        job.company.toLowerCase().includes(normalizedSearch) ||
        job.skills.some((skill) => skill.toLowerCase().includes(normalizedSearch)) ||
        job.location.toLowerCase().includes(normalizedSearch);
      const matchesLocation = selectedLocation === 'All' || job.location.includes(selectedLocation);
      const matchesMode = selectedMode === 'All' || job.workMode === selectedMode;
      const matchesType = selectedType === 'All' || job.jobType === selectedType;
      const matchesExperience = selectedExperience === 'All' || job.experience === selectedExperience;
      const matchesSalary = salary === 'All' || (salary === 'High' ? Number.parseFloat(job.salary.replace(/[^\d.]/g, '').split('.')[0]) >= 20 : true);
      const matchesSkills = skills === 'All' || job.skills.includes(skills);

      return matchesSearch && matchesLocation && matchesMode && matchesType && matchesExperience && matchesSalary && matchesSkills;
    });

    switch (sortBy) {
      case 'Newest':
        return [...list].sort((a, b) => b.postedDate.localeCompare(a.postedDate));
      case 'Salary':
        return [...list].sort((a, b) => Number.parseInt(b.salary.replace(/[^\d]/g, '')) - Number.parseInt(a.salary.replace(/[^\d]/g, '')));
      default:
        return list;
    }
  }, [search, selectedLocation, selectedMode, selectedType, selectedExperience, salary, skills, sortBy]);

  return (
    <div className="container list-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Jobs</span>
          <h1>Find Your Next Job</h1>
          <p>Explore focused opportunities from teams building what comes next.</p>
        </div>
      </div>

      <div className="filter-layout">
        <aside className="filter-panel card-panel">
          <div className="panel-header-row">
            <h3>Filters</h3>
            <SlidersHorizontal size={16} />
          </div>

          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search jobs, roles, skills or companies..."
          />

          <div className="filter-stack">
            <label>
              <span>Location</span>
              <select value={selectedLocation} onChange={(event) => setSelectedLocation(event.target.value)}>
                <option value="All">All</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Remote">Remote</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </label>
            <label>
              <span>Work Mode</span>
              <select value={selectedMode} onChange={(event) => setSelectedMode(event.target.value)}>
                <option value="All">All</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </label>
            <label>
              <span>Job Type</span>
              <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
                <option value="All">All</option>
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
              </select>
            </label>
            <label>
              <span>Experience</span>
              <select value={selectedExperience} onChange={(event) => setSelectedExperience(event.target.value)}>
                <option value="All">All</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-2 years">1-2 years</option>
                <option value="2-4 years">2-4 years</option>
                <option value="4+ years">4+ years</option>
              </select>
            </label>
            <label>
              <span>Salary</span>
              <select value={salary} onChange={(event) => setSalary(event.target.value)}>
                <option value="All">All</option>
                <option value="High">High paying</option>
              </select>
            </label>
            <label>
              <span>Skills</span>
              <select value={skills} onChange={(event) => setSkills(event.target.value)}>
                <option value="All">All</option>
                <option value="React">React</option>
                <option value="Node.js">Node.js</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="SQL">SQL</option>
              </select>
            </label>
          </div>
        </aside>

        <div className="results-panel">
          <div className="toolbar">
            <p>{filteredJobs.length} jobs found</p>
            <label>
              <span>Sort</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="Relevance">Relevance</option>
                <option value="Newest">Newest</option>
                <option value="Salary">Salary</option>
              </select>
            </label>
          </div>

          {filteredJobs.length === 0 ? (
            <EmptyState title="No jobs found" message="Try a different keyword or filter combination." />
          ) : (
            <div className="list-grid">
              {filteredJobs.map((job, index) => (
                <JobCard key={job.id} job={job} onToggleSave={onToggleSave} isSaved={isSaved(job.id, 'job')} badge={index === 0 ? 'Featured role' : undefined} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InternshipsPage({ isSaved, onToggleSave }: { isSaved: (id: string, type: 'job' | 'internship') => boolean; onToggleSave: (item: SavedItem) => void }) {
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [stipend, setStipend] = useState('All');
  const [duration, setDuration] = useState('All');
  const [skills, setSkills] = useState('All');
  const [sortBy, setSortBy] = useState('Relevance');

  const filteredInternships = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    const list = internships.filter((internship) => {
      const matchesSearch =
        !normalizedSearch ||
        internship.title.toLowerCase().includes(normalizedSearch) ||
        internship.company.toLowerCase().includes(normalizedSearch) ||
        internship.skills.some((skill) => skill.toLowerCase().includes(normalizedSearch)) ||
        internship.location.toLowerCase().includes(normalizedSearch);
      const matchesDomain = selectedDomain === 'All' || internship.domain === selectedDomain;
      const matchesLocation = selectedLocation === 'All' || internship.location.includes(selectedLocation);
      const matchesMode = selectedMode === 'All' || internship.workMode === selectedMode;
      const matchesStipend = stipend === 'All' || (stipend === 'Paid' ? internship.stipend.toLowerCase().includes('₹') : true);
      const matchesDuration = duration === 'All' || internship.duration === duration;
      const matchesSkills = skills === 'All' || internship.skills.includes(skills);

      return matchesSearch && matchesDomain && matchesLocation && matchesMode && matchesStipend && matchesDuration && matchesSkills;
    });

    return sortBy === 'Newest' ? [...list].sort((a, b) => b.postedDate.localeCompare(a.postedDate)) : list;
  }, [search, selectedDomain, selectedLocation, selectedMode, stipend, duration, skills, sortBy]);

  return (
    <div className="container list-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Internships</span>
          <h1>Find Your Dream Internship</h1>
          <p>Build experience with teams that invest in your next chapter.</p>
        </div>
      </div>

      <div className="filter-layout">
        <aside className="filter-panel card-panel">
          <div className="panel-header-row">
            <h3>Filters</h3>
            <SlidersHorizontal size={16} />
          </div>

          <SearchBar value={search} onChange={setSearch} placeholder="Search internships, skills or companies..." />

          <div className="filter-stack">
            <label>
              <span>Domain</span>
              <select value={selectedDomain} onChange={(event) => setSelectedDomain(event.target.value)}>
                <option value="All">All</option>
                <option value="Web Development">Web Development</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Data Science">Data Science</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Design">Design</option>
              </select>
            </label>
            <label>
              <span>Location</span>
              <select value={selectedLocation} onChange={(event) => setSelectedLocation(event.target.value)}>
                <option value="All">All</option>
                <option value="Remote">Remote</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Delhi">Delhi</option>
                <option value="Pune">Pune</option>
              </select>
            </label>
            <label>
              <span>Work Mode</span>
              <select value={selectedMode} onChange={(event) => setSelectedMode(event.target.value)}>
                <option value="All">All</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </label>
            <label>
              <span>Stipend</span>
              <select value={stipend} onChange={(event) => setStipend(event.target.value)}>
                <option value="All">All</option>
                <option value="Paid">Paid</option>
              </select>
            </label>
            <label>
              <span>Duration</span>
              <select value={duration} onChange={(event) => setDuration(event.target.value)}>
                <option value="All">All</option>
                <option value="3 months">3 months</option>
                <option value="4 months">4 months</option>
                <option value="5 months">5 months</option>
                <option value="6 months">6 months</option>
              </select>
            </label>
            <label>
              <span>Skills</span>
              <select value={skills} onChange={(event) => setSkills(event.target.value)}>
                <option value="All">All</option>
                <option value="React">React</option>
                <option value="Python">Python</option>
                <option value="AWS">AWS</option>
                <option value="ML">ML</option>
                <option value="Figma">Figma</option>
              </select>
            </label>
          </div>
        </aside>

        <div className="results-panel">
          <div className="toolbar">
            <p>{filteredInternships.length} internships found</p>
            <label>
              <span>Sort</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="Relevance">Relevance</option>
                <option value="Newest">Newest</option>
              </select>
            </label>
          </div>

          {filteredInternships.length === 0 ? (
            <EmptyState title="No internships found" message="Try different filters or a broader keyword search." />
          ) : (
            <div className="list-grid">
              {filteredInternships.map((internship, index) => (
                <InternshipCard key={internship.id} internship={internship} onToggleSave={onToggleSave} isSaved={isSaved(internship.id, 'internship')} badge={index === 0 ? 'Featured internship' : index === 1 ? 'Popular' : index === 2 ? 'Recommended' : undefined} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function JobDetailPage({
  onToggleSave,
  isSaved,
  currentUser,
  submitApplication,
}: {
  onToggleSave: (item: SavedItem) => void;
  isSaved: (id: string, type: 'job' | 'internship') => boolean;
  currentUser: User | null;
  submitApplication: (payload: ApplicationDraft, opportunity: Job | Internship) => void;
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const job = jobs.find((item) => item.id === id);
  const [showModal, setShowModal] = useState(false);

  if (!job) return <EmptyState title="Opportunity not found" message="This role is no longer available." />;

  return (
    <div className="container detail-page">
      <motion.div className="detail-header card-panel" layoutId={`opportunity-job-${job.id}`}>
        <div>
          <span className="eyebrow">Job opportunity</span>
          <h1>{job.title}</h1>
          <div className="company-row"><Building2 size={16} /> {job.company}</div>
          <div className="meta-row">
            <span><MapPin size={15} /> {job.location}</span>
            <span><Briefcase size={15} /> {job.workMode}</span>
            <span><Clock3 size={15} /> {job.postedDate}</span>
          </div>
        </div>
        <div className="header-actions">
          <SaveButton
            className="secondary-button"
            opportunityTitle={job.title}
            isSaved={isSaved(job.id, 'job')}
            onToggleSave={() => onToggleSave({ id: job.id, type: 'job' })}
            showLabel
          />
          <button type="button" className="primary-button" onClick={() => {
            if (!currentUser) {
              navigate('/signin');
              return;
            }
            setShowModal(true);
          }}>
            Apply Now
          </button>
        </div>
      </motion.div>

      <div className="detail-layout">
        <main className="detail-main card-panel">
          <DetailSection title="About" content={job.description} />
          <DetailList title="Responsibilities" items={job.responsibilities} />
          <DetailList title="Requirements" items={job.requirements} />
          <DetailList title="Skills" items={job.skills} isTags />
          <DetailList title="Qualifications" items={job.qualifications} />
          <DetailList title="Benefits" items={job.benefits} />
        </main>

        <aside className="detail-sidebar card-panel">
          <h3>Company</h3>
          <div className="company-box">
            <div className="company-badge">{job.companyInfo.logo}</div>
            <div>
              <strong>{job.companyInfo.name}</strong>
              <p>{job.companyInfo.industry}</p>
            </div>
          </div>
          <ul className="fact-list">
            <li><span>Salary</span><strong>{job.salary}</strong></li>
            <li><span>Location</span><strong>{job.location}</strong></li>
            <li><span>Work Mode</span><strong>{job.workMode}</strong></li>
            <li><span>Experience</span><strong>{job.experience}</strong></li>
            <li><span>Job Type</span><strong>{job.jobType}</strong></li>
          </ul>
        </aside>
      </div>

      {showModal && <ApplicationModal opportunity={job} onClose={() => setShowModal(false)} onSubmit={submitApplication} />}
    </div>
  );
}

function InternshipDetailPage({
  onToggleSave,
  isSaved,
  currentUser,
  submitApplication,
}: {
  onToggleSave: (item: SavedItem) => void;
  isSaved: (id: string, type: 'job' | 'internship') => boolean;
  currentUser: User | null;
  submitApplication: (payload: ApplicationDraft, opportunity: Job | Internship) => void;
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const internship = internships.find((item) => item.id === id);
  const [showModal, setShowModal] = useState(false);

  if (!internship) return <EmptyState title="Opportunity not found" message="This internship has ended." />;

  return (
    <div className="container detail-page">
      <motion.div className="detail-header card-panel" layoutId={`opportunity-internship-${internship.id}`}>
        <div>
          <span className="eyebrow">Internship opportunity</span>
          <h1>{internship.title}</h1>
          <div className="company-row"><Building2 size={16} /> {internship.company}</div>
          <div className="meta-row">
            <span><MapPin size={15} /> {internship.location}</span>
            <span><Briefcase size={15} /> {internship.workMode}</span>
            <span><Clock3 size={15} /> {internship.postedDate}</span>
          </div>
        </div>
        <div className="header-actions">
          <SaveButton
            className="secondary-button"
            opportunityTitle={internship.title}
            isSaved={isSaved(internship.id, 'internship')}
            onToggleSave={() => onToggleSave({ id: internship.id, type: 'internship' })}
            showLabel
          />
          <button type="button" className="primary-button" onClick={() => {
            if (!currentUser) {
              navigate('/signin');
              return;
            }
            setShowModal(true);
          }}>
            Apply Now
          </button>
        </div>
      </motion.div>

      <div className="detail-layout">
        <main className="detail-main card-panel">
          <DetailSection title="About" content={internship.description} />
          <DetailList title="Responsibilities" items={internship.responsibilities} />
          <DetailList title="Requirements" items={internship.requirements} />
          <DetailList title="Skills" items={internship.skills} isTags />
          <DetailList title="Qualifications" items={internship.qualifications} />
          <DetailList title="Benefits" items={internship.benefits} />
        </main>

        <aside className="detail-sidebar card-panel">
          <h3>Overview</h3>
          <div className="company-box">
            <div className="company-badge">{internship.companyInfo.logo}</div>
            <div>
              <strong>{internship.companyInfo.name}</strong>
              <p>{internship.companyInfo.industry}</p>
            </div>
          </div>
          <ul className="fact-list">
            <li><span>Stipend</span><strong>{internship.stipend}</strong></li>
            <li><span>Location</span><strong>{internship.location}</strong></li>
            <li><span>Work Mode</span><strong>{internship.workMode}</strong></li>
            <li><span>Duration</span><strong>{internship.duration}</strong></li>
            <li><span>Domain</span><strong>{internship.domain}</strong></li>
          </ul>
        </aside>
      </div>

      {showModal && <ApplicationModal opportunity={internship} onClose={() => setShowModal(false)} onSubmit={submitApplication} />}
    </div>
  );
}

function AuthVisual({ signup = false }: { signup?: boolean }) {
  return (
    <aside className="auth-visual-panel">
      <Link to="/" className="brand auth-brand"><span className="brand-mark">C</span><span>CareerNest</span></Link>
      <div className="auth-visual-copy">
        <span className="eyebrow">A clearer path forward</span>
        <h2>{signup ? 'Make your next move count.' : 'Your next opportunity is closer than you think.'}</h2>
        <p>Bring your goals, opportunities, and career momentum together in one place.</p>
      </div>
      <motion.div className="auth-visual-stack" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <motion.div className="auth-stack-opportunity" animate={{ y: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          <span className="auth-stack-icon">NL</span>
          <span><strong>Product Engineer</strong><small>Northstar Labs · Hybrid</small></span>
          <span className="auth-stack-match">94%</span>
        </motion.div>
        <motion.div className="auth-stack-progress" animate={{ y: [0, 4, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
          <span className="auth-stack-check"><CircleCheck size={17} /></span>
          <span><strong>Profile strength</strong><small>One step from complete</small></span>
          <span className="auth-stack-arrow"><TrendingUp size={17} /></span>
        </motion.div>
      </motion.div>
      <span className="auth-visual-footnote">A thoughtful toolkit for what comes next.</span>
    </aside>
  );
}

function SignInPage({ onSubmit }: { onSubmit: (email: string, password: string) => boolean }) {
  const [form, setForm] = useState({ email: 'aarav@example.com', password: 'demo1234' });
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = onSubmit(form.email, form.password);
    if (!success) {
      setError('Incorrect email or password. Try aarav@example.com / demo1234');
      return;
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-layout">
        <AuthVisual />
        <div className="auth-card card-panel">
        <div className="auth-intro">
          <span className="eyebrow">Welcome back</span>
          <h1>Sign In</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>

          <div className="inline-row auth-row">
            <label className="checkbox-row"><input type="checkbox" defaultChecked /> Remember Me</label>
            <a href="#">Forgot Password</a>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-button full">Sign In</button>
          <button type="button" className="secondary-button full">Continue with Google</button>
        </form>
        <p className="auth-switch">New to CareerNest? <Link to="/signup">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}

function SignUpPage({ onSubmit }: { onSubmit: (name: string, email: string, password: string) => void }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    onSubmit(form.name, form.email, form.password);
    setMessage('Account created successfully.');
    navigate('/dashboard');
  };

  return (
    <div className="auth-page container">
      <div className="auth-layout">
        <AuthVisual signup />
        <div className="auth-card card-panel">
        <div className="auth-intro">
          <span className="eyebrow">Start your journey</span>
          <h1>Create Your CareerNest Account</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Full Name</span>
            <input type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          <label>
            <span>Confirm Password</span>
            <input type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required />
          </label>

          {message && <p className="form-note">{message}</p>}

          <button type="submit" className="primary-button full">Create Account</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/signin">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ user, applications }: { user: User; applications: Application[] }) {
  const savedCount = readStorage<SavedItem[]>(STORAGE_KEYS.saved, []).length;
  const recommendedJobs = jobs.slice(0, 3);
  const recommendedInternships = internships.slice(0, 2);

  return (
    <div className="container dashboard-page">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>{getGreeting()}, {user.name.split(' ')[0]}! 👋</h1>
          <p>Ready to take the next step in your career?</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard value={recommendedJobs.length.toString()} label="Recommended Jobs" />
        <StatCard value={recommendedInternships.length.toString()} label="Internships" />
        <StatCard value={savedCount.toString()} label="Saved Opportunities" />
        <StatCard value={applications.length.toString()} label="Applications" />
      </div>

      <div className="dashboard-grid">
        <section className="card-panel dashboard-section">
          <SectionHeading title="Recommended For You" subtitle="Selected based on your search history and skills." compact />
          <div className="mini-list dashboard-list">
            {recommendedJobs.map((job, index) => (
              <motion.div
                key={job.id}
                className="mini-item"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: index * 0.05 }}
              >
                <div className="mini-dot" />
                <div>
                  <strong>{job.title}</strong>
                  <p>{job.company} · {job.location}</p>
                </div>
                <Link to={`/jobs/${job.id}`} className="mini-link">View <span aria-hidden="true">→</span></Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="card-panel dashboard-section">
          <SectionHeading title="Recently Viewed" subtitle="Keep momentum going with relevant opportunities." compact />
          <div className="mini-list dashboard-list">
            {internships.slice(0, 2).map((internship, index) => (
              <motion.div
                key={internship.id}
                className="mini-item"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: index * 0.05 }}
              >
                <div className="mini-dot alt" />
                <div>
                  <strong>{internship.title}</strong>
                  <p>{internship.company} · {internship.location}</p>
                </div>
                <Link to={`/internships/${internship.id}`} className="mini-link">View <span aria-hidden="true">→</span></Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="card-panel dashboard-section full-span">
          <SectionHeading title="Saved Opportunities" subtitle="Your shortlist stays here." compact />
          <div className="mini-list dashboard-list">
            {savedCount === 0 ? (
              <div className="empty-panel dashboard-empty-state">
                <div className="empty-icon"><Search size={24} /></div>
                <h3>No saved opportunities yet</h3>
                <p>Save roles you like and revisit them anytime.</p>
              </div>
            ) : (
              readStorage<SavedItem[]>(STORAGE_KEYS.saved, []).slice(0, 4).map((saved) => {
                const source = saved.type === 'job' ? jobs.find((job) => job.id === saved.id) : internships.find((internship) => internship.id === saved.id);
                if (!source) return null;
                return (
                  <div key={`${saved.type}-${saved.id}`} className="mini-item">
                    <div className="mini-dot alt" />
                    <div>
                      <strong>{source.title}</strong>
                      <p>{source.company}</p>
                    </div>
                    <Link to={saved.type === 'job' ? `/jobs/${source.id}` : `/internships/${source.id}`} className="mini-link">Open <span aria-hidden="true">→</span></Link>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="card-panel dashboard-section full-span">
          <SectionHeading title="Application Tracker" subtitle="Stay on top of your progress." compact />
          <div className="tracker-list">
            {['Applied', 'Under Review', 'Shortlisted', 'Interview'].map((status) => (
              <div key={status} className="tracker-row">
                <div className="tracker-label">
                  <span>{status}</span>
                  <strong>{applications.filter((app) => app.status === status).length}</strong>
                </div>
                <div className="tracker-bar">
                  <span style={{ width: `${((applications.filter((app) => app.status === status).length + 1) * 20)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfilePage({
  user,
  setUsers,
  setCurrentUser,
}: {
  user: User;
  setUsers: Dispatch<SetStateAction<User[]>>;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
}) {
  const [form, setForm] = useState<User>(user);

  const completion = Math.round(
    [
      form.name,
      form.email,
      form.phone,
      form.location,
      form.college,
      form.degree,
      form.graduationYear,
      form.skills,
      form.experience,
      form.resume,
    ].filter(Boolean).length / 10 * 100,
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updated = { ...form };
    setCurrentUser(updated);
    setUsers((current) => current.map((entry) => (entry.email.toLowerCase() === updated.email.toLowerCase() ? updated : entry)));
    writeStorage(STORAGE_KEYS.user, updated);
  };

  return (
    <div className="container profile-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Profile</span>
          <h1>Update Your Details</h1>
        </div>
      </div>

      <div className="profile-layout">
        <form className="card-panel profile-form" onSubmit={handleSubmit}>
          <div className="progress-card">
            <h3>Profile completion</h3>
            <div className="progress-bar"><span style={{ width: `${completion}%` }} /></div>
            <strong>{completion}%</strong>
          </div>

          <div className="form-grid">
            <label><span>Full Name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label><span>Email</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label><span>Phone</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
            <label><span>Location</span><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
            <label><span>College</span><input value={form.college} onChange={(event) => setForm({ ...form, college: event.target.value })} /></label>
            <label><span>Degree</span><input value={form.degree} onChange={(event) => setForm({ ...form, degree: event.target.value })} /></label>
            <label><span>Graduation Year</span><input value={form.graduationYear} onChange={(event) => setForm({ ...form, graduationYear: event.target.value })} /></label>
            <label><span>Skills</span><input value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} /></label>
            <label className="full-width"><span>Experience</span><textarea value={form.experience} onChange={(event) => setForm({ ...form, experience: event.target.value })} /></label>
            <label className="full-width"><span>Resume</span><input type="file" onChange={(event) => setForm({ ...form, resume: event.target.files?.[0]?.name ?? form.resume })} /></label>
          </div>

          <button type="submit" className="primary-button">Save Profile</button>
        </form>
      </div>
    </div>
  );
}

function SavedPage({ onToggleSave }: { onToggleSave: (item: SavedItem) => void }) {
  const saved = readStorage<SavedItem[]>(STORAGE_KEYS.saved, []);
  const [tab, setTab] = useState<'All' | 'Jobs' | 'Internships'>('All');

  const items = saved.filter((item) => {
    if (tab === 'Jobs') return item.type === 'job';
    if (tab === 'Internships') return item.type === 'internship';
    return true;
  });

  return (
    <div className="container saved-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Saved</span>
          <h1>Your Saved Opportunities</h1>
        </div>
      </div>

      <div className="tabs-row">
        {['All', 'Jobs', 'Internships'].map((item) => (
          <button key={item} type="button" className={tab === item ? 'tab active' : 'tab'} onClick={() => setTab(item as 'All' | 'Jobs' | 'Internships')}>
            {item}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState title="No saved opportunities yet" message="Save jobs and internships to revisit them later." />
      ) : (
        <div className="saved-grid">
          {items.map((item) => {
            const source = item.type === 'job' ? jobs.find((job) => job.id === item.id) : internships.find((internship) => internship.id === item.id);
            if (!source) return null;
            return (
              <div key={`${item.type}-${item.id}`} className="saved-item card-panel">
                <div>
                  <h3>{source.title}</h3>
                  <p>{source.company}</p>
                </div>
                <div className="saved-actions">
                  <Link to={item.type === 'job' ? `/jobs/${source.id}` : `/internships/${source.id}`} className="secondary-button small">View</Link>
                  <button type="button" className="ghost-button" onClick={() => onToggleSave(item)}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ApplicationsPage({ applications }: { applications: Application[] }) {
  return (
    <div className="container applications-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Applications</span>
          <h1>Application Status</h1>
        </div>
      </div>

      {applications.length === 0 ? (
        <EmptyState title="No applications yet" message="Apply to jobs or internships from their detail pages to track them here." />
      ) : (
        <div className="application-list">
          {applications.map((item) => (
            <div key={item.id} className="application-card card-panel">
              <div className="application-main">
                <div>
                  <div className="company-row"><Building2 size={16} /> {item.company}</div>
                  <h3>{item.title}</h3>
                </div>
                <span className={`status-pill status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span>
              </div>
              <div className="application-footer">
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                <span>{item.resume}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="container empty-page">
      <div className="card-panel empty-card">
        <div className="empty-icon"><Sparkles size={36} /></div>
        <h1>Page not found</h1>
        <p>We could not find that page. Explore current opportunities or return to the home page.</p>
        <Link to="/" className="primary-button">Return Home</Link>
      </div>
    </div>
  );
}

const hubPageCopy: Record<OpportunityHubKind, { title: string; subtitle: string; itemName: string; viewLabel: string; actionLabel: string }> = {
  competitions: { title: 'Discover Competitions', subtitle: 'Challenge yourself, solve real-world problems, and showcase your skills.', itemName: 'competitions', viewLabel: 'View Details', actionLabel: 'Participate' },
  hackathons: { title: 'Find Your Next Hackathon', subtitle: 'Build, innovate and solve real-world problems with your ideas.', itemName: 'hackathons', viewLabel: 'View Hackathon', actionLabel: 'Register' },
  courses: { title: 'Learn. Build. Grow.', subtitle: 'Develop the skills that move your career forward.', itemName: 'courses', viewLabel: 'View Course', actionLabel: 'Start Learning' },
  mentorship: { title: 'Learn From Industry Mentors', subtitle: 'Get guidance from experienced professionals and accelerate your career.', itemName: 'mentors', viewLabel: 'View Profile', actionLabel: 'Book Session' },
};

const hubFilterDefinitions: Record<OpportunityHubKind, Array<{ label: string; field: keyof ExploreOpportunity }>> = {
  competitions: [
    { label: 'Category', field: 'category' },
    { label: 'Mode', field: 'mode' },
    { label: 'Skill', field: 'skills' },
    { label: 'Deadline', field: 'deadline' },
  ],
  hackathons: [
    { label: 'Category', field: 'category' },
    { label: 'Mode', field: 'mode' },
  ],
  courses: [
    { label: 'Level', field: 'level' },
    { label: 'Format', field: 'format' },
    { label: 'Skill', field: 'skills' },
  ],
  mentorship: [
    { label: 'Expertise', field: 'expertise' },
    { label: 'Availability', field: 'availability' },
  ],
};

const hubFilterResetLabels: Partial<Record<keyof ExploreOpportunity, string>> = {
  category: 'All categories',
  mode: 'All modes',
  skills: 'All skills',
  deadline: 'All deadlines',
  level: 'All levels',
  format: 'All formats',
  expertise: 'All expertise',
  availability: 'Any availability',
};

const getExploreFieldValues = (item: ExploreOpportunity, field: keyof ExploreOpportunity) => {
  const value = item[field];
  if (Array.isArray(value)) return value.map(String);
  return value === undefined ? [] : [String(value)];
};

const getExploreFacts = (kind: OpportunityHubKind, item: ExploreOpportunity) => {
  const fields: Array<[string, keyof ExploreOpportunity]> = kind === 'competitions'
    ? [['Eligibility', 'eligibility'], ['Mode', 'mode'], ['Deadline', 'deadline'], ['Prize', 'prize']]
    : kind === 'hackathons'
      ? [['Date', 'date'], ['Duration', 'duration'], ['Mode', 'mode'], ['Location', 'location'], ['Team size', 'teamSize'], ['Prize', 'prize']]
      : kind === 'courses'
        ? [['Level', 'level'], ['Duration', 'duration'], ['Format', 'format'], ['Rating', 'rating']]
        : [['Company', 'organizer'], ['Experience', 'experience'], ['Rating', 'rating'], ['Availability', 'availability']];

  return fields.flatMap(([label, field]) => {
    const value = getExploreFieldValues(item, field)[0];
    return value ? [[label, label === 'Rating' ? `${value} / 5 demo` : value] as [string, string]] : [];
  });
};

function OpportunityHubPage({ kind }: { kind: OpportunityHubKind }) {
  const items = exploreOpportunities[kind];
  const config = hubPageCopy[kind];
  const filters = hubFilterDefinitions[kind];
  const [search, setSearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return items.filter((item) => {
      const searchMatches = !normalizedSearch || Object.values(item).flatMap((value) => Array.isArray(value) ? value : [value]).join(' ').toLowerCase().includes(normalizedSearch);
      const filtersMatch = filters.every(({ field }) => {
        const selected = selectedFilters[field];
        return !selected || getExploreFieldValues(item, field).includes(selected);
      });
      return searchMatches && filtersMatch;
    });
  }, [filters, items, search, selectedFilters]);

  return (
    <div className="container list-page opportunity-hub-page">
      <div className="page-intro">
        <span className="eyebrow">CareerNest · Demo listings</span>
        <h1>{config.title}</h1>
        <p>{config.subtitle}</p>
      </div>

      <section className="hub-controls card-panel" aria-label={`${config.itemName} filters`}>
        <SearchBar value={search} onChange={setSearch} placeholder={`Search ${config.itemName}, organizers, or skills...`} />
        <div className="hub-filter-grid">
          {filters.map(({ label, field }) => {
            const options = [...new Set(items.flatMap((item) => getExploreFieldValues(item, field)))].sort();
            return (
              <label key={field}>
                <span>{label}</span>
                <select value={selectedFilters[field] ?? ''} onChange={(event) => setSelectedFilters((current) => ({ ...current, [field]: event.target.value }))}>
                  <option value="">{hubFilterResetLabels[field] ?? `All ${label.toLowerCase()}`}</option>
                  {options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            );
          })}
        </div>
        <div className="hub-result-row">
          <p>{filteredItems.length} demo {filteredItems.length === 1 ? 'listing' : 'listings'}</p>
          {(search || Object.values(selectedFilters).some(Boolean)) && (
            <button type="button" className="link-button muted" onClick={() => { setSearch(''); setSelectedFilters({}); }}>Clear filters</button>
          )}
        </div>
      </section>

      {filteredItems.length === 0 ? (
        <EmptyState title="No matching opportunities" message="Try another search or clear a filter to see more demo listings." />
      ) : (
        <motion.div className="explore-opportunity-grid" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.045 } } }}>
          {filteredItems.map((item) => {
            const path = `/${kind}/${item.id}`;
            const facts = getExploreFacts(kind, item);
            return (
              <motion.article key={item.id} className={`explore-opportunity-card explore-opportunity-${kind} card-panel`} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -4 }} transition={{ duration: 0.22 }}>
                <div className="explore-card-topline">
                  <span className="demo-tag">DEMO</span>
                  <span className="explore-category-label">{item.category}</span>
                </div>
                <div className="hub-category-icon" aria-hidden="true">
                  {kind === 'competitions' && <Trophy size={20} />}
                  {kind === 'hackathons' && <Sparkles size={20} />}
                  {kind === 'courses' && <BookOpenText size={20} />}
                  {kind === 'mentorship' && <Users size={20} />}
                </div>
                {kind === 'mentorship' && <div className="mentor-avatar" aria-hidden="true">{item.title.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>}
                <h2>{item.title}</h2>
                <p className="explore-organizer">{kind === 'mentorship' ? item.category : item.organizer}{kind === 'mentorship' ? ` · ${item.organizer}` : ''}</p>
                <p className="explore-description">{kind === 'mentorship' ? item.bio : item.description}</p>
                <div className="explore-facts">
                  {facts.map(([label, value]) => <div className={`explore-fact explore-fact-${label.toLowerCase().replaceAll(' ', '-')}`} key={label}><span>{label}</span><strong>{value}</strong></div>)}
                </div>
                <div className="tag-row explore-skill-row">
                  {item.skills.slice(0, 4).map((skill) => <span key={skill} className="skill-tag">{skill}</span>)}
                </div>
                {kind === 'courses' && <div className="course-learning-cue"><span>Learning path</span><span>{item.curriculum?.length ?? 4} modules</span><i><b /></i></div>}
                <div className="explore-card-actions">
                  <Link to={path} className="secondary-button small">{config.viewLabel}</Link>
                  <Link to={`${path}#action`} className="primary-button small">{config.actionLabel}</Link>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

function OpportunityDetailPage({ kind }: { kind: OpportunityHubKind }) {
  const { id } = useParams();
  const item = exploreOpportunities[kind].find((opportunity) => opportunity.id === id);
  const config = hubPageCopy[kind];
  const [actionMessage, setActionMessage] = useState<{ id: string; message: string } | null>(null);

  if (!item) return <div className="container detail-page"><EmptyState title="Opportunity not found" message="This demo listing may have expired or moved." /><Link className="secondary-button" to={`/${kind}`}>Back to {config.itemName}</Link></div>;

  const sections: Array<{ title: string; content?: string; items?: string[]; tags?: boolean }> = [
    { title: kind === 'mentorship' ? 'About the mentor' : kind === 'courses' ? 'Course overview' : 'About', content: kind === 'mentorship' ? item.bio ?? item.about : item.about },
  ];

  if (item.challenge) sections.push({ title: kind === 'competitions' ? 'Problem statement' : 'Challenge', content: item.challenge });
  if (item.eligibility) sections.push({ title: 'Eligibility', content: item.eligibility });
  if (item.rules?.length && (kind === 'competitions' || kind === 'hackathons')) sections.push({ title: 'Rules', items: item.rules });
  if (item.timeline?.length) sections.push({ title: 'Timeline', items: item.timeline });
  if (item.teamSize) sections.push({ title: 'Team requirements', content: item.teamSize });
  if (item.prizes?.length) sections.push({ title: 'Prizes', items: item.prizes });
  if (item.prize) sections.push({ title: 'Prize information', content: item.prize });
  if (item.curriculum?.length) sections.push({ title: 'Curriculum', items: item.curriculum });
  if (item.outcomes?.length) sections.push({ title: 'Learning outcomes', items: item.outcomes });
  if (item.experience) sections.push({ title: 'Experience', content: item.experience });
  if (item.expertise?.length) sections.push({ title: 'Expertise', items: item.expertise, tags: true });
  if (item.topics?.length) sections.push({ title: 'Topics', items: item.topics });
  if (item.testimonials?.length) sections.push({ title: 'Testimonials', items: item.testimonials });
  sections.push({ title: kind === 'courses' ? 'Skills covered' : kind === 'mentorship' ? 'Skills and focus areas' : kind === 'hackathons' ? 'Technologies' : 'Skills', items: item.skills, tags: true });

  const facts = getExploreFacts(kind, item);
  const bookingCopy = kind === 'mentorship' ? 'Your demo session request is noted. The mentor would follow up with available times.' : kind === 'courses' ? 'Your demo learning path is ready. You can begin exploring the curriculum.' : `Your demo ${kind === 'competitions' ? 'participation' : 'registration'} interest is noted.`;

  return (
    <div className="container detail-page explore-detail-page">
      <div className="explore-detail-header card-panel">
        <div className="explore-detail-copy">
          <span className="eyebrow">DEMO · {kind === 'mentorship' ? 'Mentor profile' : kind.slice(0, -1)}</span>
          <h1>{item.title}</h1>
          <p className="explore-detail-organizer">{item.organizer}{kind === 'mentorship' ? ` · ${item.category}` : ''}</p>
          <p>{item.description}</p>
          <div className="tag-row">
            {item.skills.slice(0, 5).map((skill) => <span key={skill} className="skill-tag">{skill}</span>)}
          </div>
        </div>
        <div id="action" className="explore-detail-action">
          <Link to={`/${kind}`} className="link-button muted">Back to {config.itemName}</Link>
          <button type="button" className="primary-button" onClick={() => setActionMessage({ id: item.id, message: bookingCopy })}>{kind === 'courses' ? 'Start Learning' : kind === 'mentorship' ? 'Book a Session' : `${config.actionLabel} Now`}</button>
          {actionMessage?.id === item.id && <p role="status" className="form-note">{actionMessage.message}</p>}
        </div>
      </div>

      <div className="detail-layout explore-detail-layout">
        <main className="detail-main card-panel">
          {sections.map((section) => (
            <section key={section.title} className="detail-block">
              <h2>{section.title}</h2>
              {section.content && <p>{section.content}</p>}
              {section.items && (section.tags ? (
                <div className="tag-row">{section.items.map((value) => <span key={value} className="skill-tag">{value}</span>)}</div>
              ) : (
                <ul className="bullet-list">{section.items.map((value) => <li key={value}>{value}</li>)}</ul>
              ))}
            </section>
          ))}
          {item.availability && <DetailSection title="Availability and session information" content={item.availability} />}
          {kind === 'courses' && item.level && <DetailSection title="Level and duration" content={`${item.level} · ${item.duration} · ${item.format}`} />}
          <DetailSection title={kind === 'courses' ? 'Instructor / provider' : 'Organizer'} content={item.organizer} />
        </main>
        <aside className="detail-sidebar card-panel explore-detail-sidebar">
          <span className="demo-tag">SAMPLE INFORMATION</span>
          <h2>{kind === 'mentorship' ? 'Mentor snapshot' : kind === 'courses' ? 'Course details' : 'Opportunity details'}</h2>
          <ul className="fact-list">
            {facts.map(([label, value]) => <li key={label}><span>{label}</span><strong>{value}</strong></li>)}
            {kind === 'mentorship' && item.expertise?.map((value) => <li key={value}><span>Expertise</span><strong>{value}</strong></li>)}
          </ul>
          {item.prizes?.length ? <DetailList title="Prize breakdown" items={item.prizes} /> : null}
        </aside>
      </div>
    </div>
  );
}

function DetailSection({ title, content }: { title: string; content: string }) {
  return (
    <section className="detail-block">
      <h2>{title}</h2>
      <p>{content}</p>
    </section>
  );
}

function DetailList({ title, items, isTags = false }: { title: string; items: string[]; isTags?: boolean }) {
  return (
    <section className="detail-block">
      <h2>{title}</h2>
      {isTags ? (
        <div className="tag-row">
          {items.map((item) => (
            <span key={item} className="skill-tag">{item}</span>
          ))}
        </div>
      ) : (
        <ul className="bullet-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SectionHeading({ title, subtitle, compact = false }: { title: string; subtitle: string; compact?: boolean }) {
  return (
    <div className={compact ? 'section-header compact' : 'section-header'}>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function CategoryCard({ category, metric, onClick }: { category: { title: string; description: string; icon: string; href: string }; metric: string; onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void }) {
  const icons = {
    briefcase: <BriefcaseBusiness size={22} />,
    rocket: <Star size={22} />,
    trophy: <Trophy size={22} />,
    zap: <Sparkles size={22} />,
    book: <BookOpenText size={22} />,
    users: <Users size={22} />,
  };

  const categoryClass = category.title.toLowerCase().replaceAll(' ', '-');

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -4 }} className="category-card-motion">
      <Link to={category.href} className={`category-card card-panel category-${categoryClass}`} onClick={onClick}>
        <div className="icon-tile category-icon">{icons[category.icon as keyof typeof icons]}</div>
        <div className="category-card-copy"><h3>{category.title}</h3><p>{category.description}</p></div>
        <span className="category-metric">{metric}</span>
        <span className="inline-link">Explore <ArrowRight size={16} /></span>
      </Link>
    </motion.div>
  );
}

function OpportunityCard({ opportunity, featured = false, index = 0, isSaved = false, onToggleSave = () => undefined }: { opportunity: Opportunity; featured?: boolean; index?: number; isSaved?: boolean; onToggleSave?: (item: SavedItem) => void }) {
  const link = opportunity.type === 'job' ? `/jobs/${opportunity.id}` : `/internships/${opportunity.id}`;
  return (
    <motion.article layoutId={`opportunity-${opportunity.type}-${opportunity.id}`} initial={featured ? { opacity: 0, y: 14 } : false} whileInView={featured ? { opacity: 1, y: 0 } : undefined} viewport={featured ? { once: true, amount: 0.18 } : undefined} transition={{ duration: 0.28, delay: index * 0.06 }} whileHover={{ y: -5 }} className={`opportunity-card card-panel${featured ? ' featured-opportunity-card' : ''}`}>
      <div className="card-top-row">
        <div className="company-badge small">{opportunity.company.slice(0, 2).toUpperCase()}</div>
        <div className="featured-card-badges">{featured && <span className="featured-badge">Featured</span>}<span className="chip">{opportunity.type}</span><SaveButton className="save-button" opportunityTitle={opportunity.title} isSaved={isSaved} onToggleSave={() => onToggleSave({ id: opportunity.id, type: opportunity.type })} /></div>
      </div>
      <h3>{opportunity.title}</h3>
      <p className="company-name">{opportunity.company}</p>
      <div className="meta-list">
        <span><MapPin size={14} /> {opportunity.location}</span>
        <span><Briefcase size={14} /> {opportunity.meta}</span>
      </div>
      <div className="detail-data">
        <strong>{opportunity.salary ?? opportunity.stipend}</strong>
        <span>{opportunity.postedDate}</span>
      </div>
      <div className="tag-row">
        {opportunity.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
      </div>
      <Link to={link} className="inline-link">View Details <ArrowRight size={16} /></Link>
    </motion.article>
  );
}

function SaveButton({
  className,
  opportunityTitle,
  isSaved,
  onToggleSave,
  showLabel = false,
}: {
  className: string;
  opportunityTitle: string;
  isSaved: boolean;
  onToggleSave: () => void;
  showLabel?: boolean;
}) {
  const [burstId, setBurstId] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (burstId === 0) return;
    const timer = window.setTimeout(() => setBurstId(0), 450);
    return () => window.clearTimeout(timer);
  }, [burstId]);

  return (
    <motion.button
      type="button"
      className={`${className}${isSaved ? ' saved' : ''}`}
      aria-label={`${isSaved ? 'Remove saved' : 'Save'} ${opportunityTitle}`}
      aria-pressed={isSaved}
      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
      onClick={() => {
        setBurstId((current) => current + 1);
        onToggleSave();
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isSaved ? 'saved' : 'unsaved'}
          className="save-heart"
          initial={reduceMotion ? false : { opacity: 0.65, scale: 0.78 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.82 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
        >
          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
        </motion.span>
      </AnimatePresence>
      {showLabel && <span>{isSaved ? 'Saved' : 'Save'}</span>}
      <AnimatePresence initial={false}>
        {!reduceMotion && burstId > 0 && (
          <motion.span
            key={burstId}
            className="save-burst"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.2, rotate: 0 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.2, 1.1, 1.7], rotate: 32 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function JobCard({ job, isSaved, onToggleSave, badge }: { job: Job; isSaved: boolean; onToggleSave: (item: SavedItem) => void; badge?: string }) {
  return (
    <motion.article layoutId={`opportunity-job-${job.id}`} whileHover={{ y: -6 }} className={`job-card card-panel${badge ? ' job-card-featured' : ''}`}>
      <div className="card-top-row">
        <div className="job-card-brand"><div className="company-badge">{job.companyInfo.logo}</div>{badge && <span className="featured-badge">{badge}</span>}</div>
        <SaveButton className="save-button" opportunityTitle={job.title} isSaved={isSaved} onToggleSave={() => onToggleSave({ id: job.id, type: 'job' })} />
      </div>
      <h3>{job.title}</h3>
      <p className="company-name">{job.company}</p>
      <div className="meta-list">
        <span><MapPin size={14} /> {job.location}</span>
        <span><Briefcase size={14} /> {job.workMode}</span>
      </div>
      <div className="meta-list second-line">
        <span>{job.jobType}</span>
        <span>{job.experience}</span>
      </div>
      <div className="detail-data">
        <strong>{job.salary}</strong>
        <span>{job.postedDate}</span>
      </div>
      <div className="tag-row">
        {job.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
      </div>
      <div className="card-actions">
        <Link to={`/jobs/${job.id}`} className="secondary-button small">View Details</Link>
      </div>
    </motion.article>
  );
}

function InternshipCard({ internship, isSaved, onToggleSave, badge }: { internship: Internship; isSaved: boolean; onToggleSave: (item: SavedItem) => void; badge?: string }) {
  return (
    <motion.article layoutId={`opportunity-internship-${internship.id}`} whileHover={{ y: -6 }} className={`job-card card-panel internship-card${badge ? ' job-card-featured' : ''}`}>
      <div className="card-top-row">
        <div className="job-card-brand"><div className="company-badge">{internship.companyInfo.logo}</div>{badge && <span className="featured-badge">{badge}</span>}</div>
        <SaveButton className="save-button" opportunityTitle={internship.title} isSaved={isSaved} onToggleSave={() => onToggleSave({ id: internship.id, type: 'internship' })} />
      </div>
      <h3>{internship.title}</h3>
      <p className="company-name">{internship.company}</p>
      <div className="meta-list">
        <span><MapPin size={14} /> {internship.location}</span>
        <span><Briefcase size={14} /> {internship.workMode}</span>
      </div>
      <div className="meta-list second-line">
        <span>{internship.duration}</span>
        <span>{internship.stipend}</span>
      </div>
      <div className="detail-data">
        <strong>{internship.stipend}</strong>
        <span>{internship.postedDate}</span>
      </div>
      <div className="tag-row">
        {internship.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
      </div>
      <div className="card-actions">
        <Link to={`/internships/${internship.id}`} className="secondary-button small">View Internship</Link>
      </div>
    </motion.article>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="search-field">
      <Search size={16} />
      <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </div>
  );
}

function StatCard({ value, label, index = 0 }: { value: string; label: string; index?: number }) {
  const [count, setCount] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const parts = value.match(/^([\d,]+)(.*)$/);
  const target = parts ? Number(parts[1].replaceAll(',', '')) : null;
  const suffix = parts?.[2] ?? '';

  useEffect(() => {
    const card = cardRef.current;
    if (!card || target === null) return;
    let animationFrame: number | null = null;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      setHasEntered(true);
      if (reduceMotion) {
        setCount(target);
        return;
      }
      const startedAt = performance.now();
      const animateCount = (now: number) => {
        const progress = Math.min((now - startedAt) / 900, 1);
        const eased = 1 - (1 - progress) ** 3;
        setCount(Math.round(target * eased));
        if (progress < 1) animationFrame = requestAnimationFrame(animateCount);
      };
      animationFrame = requestAnimationFrame(animateCount);
    }, { threshold: 0.35 });
    observer.observe(card);
    return () => {
      observer.disconnect();
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    };
  }, [reduceMotion, target]);

  const displayValue = target === null ? value : `${(hasEntered ? count : 0).toLocaleString()}${suffix}`;

  return (
    <motion.div ref={cardRef} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="stat-card">
      <strong>{displayValue}</strong>
      <span>{label}</span>
    </motion.div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="empty-panel card-panel">
      <div className="empty-icon"><Search size={28} /></div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

function ApplicationModal({
  opportunity,
  onClose,
  onSubmit,
}: {
  opportunity: Job | Internship;
  onClose: () => void;
  onSubmit: (payload: ApplicationDraft, opportunity: Job | Internship) => void;
}) {
  const [form, setForm] = useState<ApplicationDraft>({ ...initialDraft, name: defaults.profile.name, email: defaults.profile.email, phone: defaults.profile.phone });

  const handleChange = (field: keyof ApplicationDraft, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(form, opportunity);
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="modal-card card-panel">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Apply now</span>
            <h3>{opportunity.title}</h3>
          </div>
          <button type="button" className="icon-button" aria-label="Close application form" onClick={onClose}><X size={18} /></button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label><span>Name</span><input value={form.name} onChange={(event) => handleChange('name', event.target.value)} required /></label>
          <label><span>Email</span><input type="email" value={form.email} onChange={(event) => handleChange('email', event.target.value)} required /></label>
          <label><span>Phone</span><input value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} required /></label>
          <label><span>Resume</span><input type="text" value={form.resume} onChange={(event) => handleChange('resume', event.target.value)} placeholder="resume.pdf" /></label>
          <label><span>Cover Letter</span><textarea rows={4} value={form.coverLetter} onChange={(event) => handleChange('coverLetter', event.target.value)} /></label>

          <button type="submit" className="primary-button full">Submit</button>
        </form>
      </motion.div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <Link to="/" className="brand footer-brand">
            <span className="brand-mark">C</span>
            <span>CareerNest</span>
          </Link>
          <p>Career growth starts with the right next step.</p>
        </div>
        <div className="footer-links">
          <Link to="/jobs">Jobs</Link>
          <Link to="/internships">Internships</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/signin">Sign In</Link>
        </div>
      </div>
    </footer>
  );
}

export default App;
