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

  const segment = pathName.split("/").at(-1);
  const pageTitle = segment
    ? segment.charAt(0).toUpperCase() + segment.slice(1)
    : "Home";

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
          className="flex items-center gap-3 p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 w-full"
        >
          {!collapse && <PanelLeftClose />}
          {collapse && <PanelLeftOpen />}
        </button>
        {!collapse && (
          <h2 className="whitespace-nowrap overflow-hidden px-2 text-m">
            Bonjour {user?.first_name} !
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
                      ? "text-white bg-neutral-800"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800",
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
          className="flex items-center gap-3 p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 w-full"
        >
          <User />
          {!collapse && <p>Profil</p>}
        </a>
        <button
          aria-label="Déconnexion"
          onClick={() => handleLogout()}
          className="flex items-center gap-3 p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 w-full"
        >
          <LogOut />
          {!collapse && <p>Déconnexion</p>}
        </button>
      </footer>
    </div>
  );
};

export default Sidebar;
