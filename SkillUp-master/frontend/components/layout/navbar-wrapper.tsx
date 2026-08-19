"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import { useState, useEffect } from "react";
import { isAuthenticated } from "@/lib/auth";

export function NavbarWrapper() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check auth state on mount
    setIsLoggedIn(isAuthenticated());

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = () => {
      setIsLoggedIn(isAuthenticated());
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Custom event for same-tab auth changes
    const handleAuthChange = () => {
      setIsLoggedIn(isAuthenticated());
    };
    
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Learn", link: "/learn" },
    { name: "Goals", link: "/goals" },
    { name: "Quiz", link: "/quiz" },
    { name: "About", link: "/about" },
  ];

  return (
    <Navbar>
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        {isLoggedIn ? (
          <NavbarButton href="/learn" variant="primary">
            Get Started
          </NavbarButton>
        ) : (
          <div className="flex items-center gap-2">
            <NavbarButton href="/login" variant="secondary">
              Login
            </NavbarButton>
            <NavbarButton href="/signup" variant="primary">
              Sign Up
            </NavbarButton>
          </div>
        )}
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                className="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            {isLoggedIn ? (
              <NavbarButton href="/learn" variant="primary" className="w-full mt-4">
                Get Started
              </NavbarButton>
            ) : (
              <>
                <NavbarButton href="/login" variant="secondary" className="w-full mt-4">
                  Login
                </NavbarButton>
                <NavbarButton href="/signup" variant="primary" className="w-full mt-2">
                  Sign Up
                </NavbarButton>
              </>
            )}
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

