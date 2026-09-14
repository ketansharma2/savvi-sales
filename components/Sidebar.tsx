"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Phone,
  UserCircle,
  LogOut,
} from "lucide-react";

type User = {
  name?: string;
  email?: string;
  current_role?: string;
  role?: string;
  phone?: string;
  empId?: string;
  manager?: string;
  location?: string;
  joiningDate?: string;
};

type SidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenProfile: () => void;
};

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  onOpenProfile,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // ==================================================
  // LOAD REAL LOGGED-IN USER
  // ==================================================

  useEffect(() => {
    setMounted(true);

    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setUser(null);
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      if (parsedUser && typeof parsedUser === "object") {
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to load logged-in user:", error);
      setUser(null);
    }
  }, []);

  // ==================================================
  // USER DISPLAY
  // ==================================================

  const userName = user?.name || "User";

  const userRole =
    user?.current_role ||
    user?.role ||
    "Lead Generation";

  // ==================================================
  // LOGOUT
  // ==================================================

const handleLogout = async () => {
  try {
    // ------------------------------------------
    // SERVER SIDE LOGOUT
    // Clears HTTP-only access/refresh cookies
    // ------------------------------------------

    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    // ------------------------------------------
    // CLEAR ALL LOCAL STORAGE DATA
    // ------------------------------------------

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error(
        "Local storage clear error:",
        error
      );
    }

    // ------------------------------------------
    // REDIRECT TO LOGIN
    // ------------------------------------------

    router.replace("/");
  }
};

  // ==================================================
  // MENU
  // ==================================================

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard/leadgen",
      icon: <LayoutGrid size={18} />,
    },
    {
      name: "My Leads",
      href: "/dashboard/leadgen/leads",
      icon: <Phone size={18} />,
    },
  ];

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <aside
      onMouseEnter={() => {
        setIsCollapsed(false);
      }}
      onMouseLeave={() => {
        setIsCollapsed(true);
      }}
      className={`
        relative
        bg-[#24a9ec]
        text-white
        min-h-screen
        flex
        flex-col
        z-50
        font-['Cambria']
        border-r
        border-white/10
        shadow-2xl
        transition-[width]
        duration-300
        ease-in-out
        shrink-0
        print:hidden
        overflow-hidden
        ${isCollapsed ? "w-20" : "w-72"}
      `}
    >
      {/* ==================================================
          TOP: LOGO
      ================================================== */}

      <div
        className="
          p-3
          border-b
          border-white/10
          flex
          items-center
          h-16
          shrink-0
        "
      >
        {!isCollapsed ? (
          <div
            className="
              bg-white/10
              backdrop-blur-sm
              px-4
              py-2
              rounded-2xl
              shadow-inner
              relative
              flex
              items-center
              justify-center
              h-12
              w-full
              border
              border-white/20
            "
          >
            <Image
              src="/logo.webp"
              alt="Maven Jobs"
              width={50}
              height={12}
              priority
              className="object-contain"
            />
          </div>
        ) : (
          <div
            className="
              mx-auto
              bg-white/10
              backdrop-blur-sm
              p-2
              rounded-xl
              shadow-md
              font-black
              text-lg
              text-white
            "
          >
            SS
          </div>
        )}
      </div>

      {/* ==================================================
          SECTOR BADGE
      ================================================== */}

      {!isCollapsed && (
        <div className="mt-2 px-4 shrink-0">
          <span
            className="
              inline-block
              text-[10px]
              bg-white/10
              px-3
              py-1
              rounded-full
              uppercase
              tracking-widest
              font-bold
              text-white/90
            "
          >
            Corporate Sector
          </span>
        </div>
      )}

      {/* ==================================================
          NAVIGATION
      ================================================== */}

      <nav
        className="
          flex-1
          px-3
          space-y-1
          my-3
          overflow-y-auto
          custom-scrollbar
        "
      >
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`
                flex
                items-center
                rounded-2xl
                transition-all
                duration-200
                group
                relative
                w-full
                ${
                  isCollapsed
                    ? "justify-center p-3"
                    : "justify-start px-3 py-2.5"
                }
                ${
                  isActive
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }
              `}
            >
              <div
                className={`
                  flex
                  items-center
                  ${
                    isCollapsed
                      ? "justify-center"
                      : "gap-3"
                  }
                  min-w-0
                `}
              >
                <span
                  className={`
                    transition-transform
                    duration-200
                    w-6
                    min-w-6
                    flex
                    justify-center
                    ${
                      isActive
                        ? "text-white scale-110"
                        : "group-hover:text-white"
                    }
                  `}
                >
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <span
                    className="
                      text-[13px]
                      tracking-wide
                      font-semibold
                      truncate
                      whitespace-nowrap
                    "
                  >
                    {item.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ==================================================
          BOTTOM: PROFILE + LOGOUT
      ================================================== */}

      {mounted && (
        <div
          className="
            p-2
            border-t
            border-white/10
            bg-black/10
            flex
            flex-col
            gap-1.5
            shrink-0
          "
        >
          {/* PROFILE */}

          <button
            type="button"
            onClick={onOpenProfile}
            title={isCollapsed ? "My Profile" : undefined}
            className={`
              flex
              items-center
              ${
                isCollapsed
                  ? "justify-center"
                  : "justify-start gap-2"
              }
              w-full
              p-1.5
              rounded-xl
              bg-white/5
              hover:bg-white/10
              text-white
              transition-all
              duration-200
              group
              overflow-hidden
            `}
          >
            <div
              className="
                bg-white/10
                backdrop-blur-sm
                p-1
                rounded-full
                text-white
                shrink-0
              "
            >
              <UserCircle
                size={22}
                strokeWidth={1.5}
              />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col text-left min-w-0">
                <p
                  className="
                    text-[11px]
                    font-black
                    leading-none
                    uppercase
                    tracking-tight
                    truncate
                    max-w-[180px]
                  "
                >
                  {userName}
                </p>

                <p
                  className="
                    text-[8px]
                    font-black
                    text-white/70
                    mt-1
                    uppercase
                    tracking-widest
                    leading-none
                    truncate
                    max-w-[180px]
                  "
                >
                  {userRole}
                </p>
              </div>
            )}
          </button>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? "Sign Out" : undefined}
            className={`
              flex
              items-center
              ${
                isCollapsed
                  ? "justify-center"
                  : "justify-start gap-2 px-2.5"
              }
              w-full
              py-2
              rounded-xl
              bg-red-500/20
              hover:bg-red-500
              text-red-200
              hover:text-white
              transition-all
              duration-200
              text-[11px]
              font-black
              uppercase
              tracking-wider
            `}
          >
            <LogOut
              size={16}
              className="shrink-0"
            />

            {!isCollapsed && (
              <span>Sign Out</span>
            )}
          </button>
        </div>
      )}
    </aside>
  );
}