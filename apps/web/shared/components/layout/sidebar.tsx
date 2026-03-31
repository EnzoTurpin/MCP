import { cn } from "@/shared/lib/utils";
import {
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  User,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { getUser } from "@/shared/lib/auth";

const Sidebar = () => {
  const [collapse, setCollapse] = useState(true);

  const { handleLogout } = useAuth();

  const { pathname: pathName } = useLocation();
  const navLinks = [{ href: "/boards", label: "Dashboard", icon: LayoutDashboard }];

  const user = getUser();

  return (
    <div
      className={cn(
        "flex flex-col justify-between h-screen transition-all duration-300 bg-sidebar shrink-0",
        collapse ? "w-16" : "w-60",
      )}
      role="complementary"
      aria-label="Sidebar"
    >
      <nav className="flex flex-col gap-2 p-2">
        <button
          aria-expanded={!collapse}
          aria-label="Toggle Button"
          onClick={() => setCollapse(!collapse)}
          className="flex items-center gap-3 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted w-full"
        >
          {!collapse && <PanelLeftClose />}
          {collapse && <PanelLeftOpen />}
        </button>
        {!collapse && (
          <h2 className="whitespace-nowrap overflow-hidden px-2 text-m">
            Bonjour {user?.display_name} !
          </h2>
        )}
        {navLinks.map((link) => (
          <TooltipProvider key={link.href}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md w-full",
                    pathName === link.href
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <link.icon />
                  {!collapse && <span>{link.label}</span>}
                </a>
              </TooltipTrigger>
              {collapse && (
                <TooltipContent side="right">{link.label}</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </nav>
      <footer className="flex flex-col gap-2 p-2">
        <a
          href="/profile"
          aria-label="Profil"
          className="flex items-center gap-3 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted w-full"
        >
          <User />
          {!collapse && <p>Profil</p>}
        </a>
        <button
          aria-label="Déconnexion"
          onClick={() => handleLogout()}
          className="flex items-center gap-3 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted w-full"
        >
          <LogOut />
          {!collapse && <p>Déconnexion</p>}
        </button>
      </footer>
    </div>
  );
};

export default Sidebar;
