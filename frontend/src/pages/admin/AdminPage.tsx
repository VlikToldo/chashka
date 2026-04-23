import { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { LogOut, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import Loader from "../../components/ui/Loader";

const ProfileManager = lazy(() => import("../../components/admin/ProfileManager"));
const SectionManager = lazy(() => import("../../components/admin/SectionManager"));
const MenuItemManager = lazy(() => import("../../components/admin/MenuItemManager"));
const WorkingHoursManager = lazy(() => import("../../components/admin/WorkingHoursManager"));
const CoverPhotoManager = lazy(() => import("../../components/admin/CoverPhotoManager"));
const AboutManager = lazy(() => import("../../components/admin/AboutManager"));

type Tab = "profile" | "sections" | "menu" | "hours" | "cover" | "about";

export default function AdminPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useLanguage();
  const a = t.admin;
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const TABS: { id: Tab; label: string }[] = [
    { id: "profile",  label: a.tabs.profile },
    { id: "sections", label: a.tabs.sections },
    { id: "menu",     label: a.tabs.menu },
    { id: "hours",    label: a.tabs.hours },
    { id: "cover",    label: a.tabs.cover },
    { id: "about",    label: a.tabs.about },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-primary/20 py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="text-xs tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground transition-colors"
          >
            ← CHASHKA
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {user?.email}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut size={13} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogIn size={13} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-8">
          {a.heading}
        </h1>

        {/* Tab bar */}
        <div className="flex border-b border-border mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm tracking-wide whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-foreground text-foreground -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <Suspense fallback={<Loader />}>
          <div>
            {activeTab === "profile" && (
              <section>
                <div className="mb-6">
                  <h2 className="text-xl font-light tracking-wide mb-1">
                    {a.profile.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{a.profile.desc}</p>
                </div>
                <ProfileManager />
              </section>
            )}

            {activeTab === "sections" && (
              <section>
                <div className="mb-6">
                  <h2 className="text-xl font-light tracking-wide mb-1">
                    {a.sections.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{a.sections.desc}</p>
                </div>
                <SectionManager />
              </section>
            )}

            {activeTab === "menu" && (
              <section>
                <div className="mb-6">
                  <h2 className="text-xl font-light tracking-wide mb-1">
                    {a.menu.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{a.menu.desc}</p>
                </div>
                <MenuItemManager />
              </section>
            )}

            {activeTab === "hours" && (
              <section>
                <div className="mb-6">
                  <h2 className="text-xl font-light tracking-wide mb-1">
                    {a.hours.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{a.hours.desc}</p>
                </div>
                <WorkingHoursManager />
              </section>
            )}

            {activeTab === "cover" && (
              <section>
                <div className="mb-6">
                  <h2 className="text-xl font-light tracking-wide mb-1">
                    {a.cover.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{a.cover.desc}</p>
                </div>
                <CoverPhotoManager />
              </section>
            )}

            {activeTab === "about" && (
              <section>
                <div className="mb-6">
                  <h2 className="text-xl font-light tracking-wide mb-1">
                    {a.about.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{a.about.desc}</p>
                </div>
                <AboutManager />
              </section>
            )}
          </div>
        </Suspense>
      </div>
    </main>
  );
}
