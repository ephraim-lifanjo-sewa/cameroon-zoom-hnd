"use client";

import Link from "next/link";
import {
  Search,
  User,
  Shield,
  LogOut,
  Plus,
  LayoutDashboard
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

import { useState, useEffect } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";

import {
  useUser,
  useFirestore,
  useDoc,
  useMemoFirebase
} from "@/firebase";

import { useRouter, usePathname } from "next/navigation";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const userDocRef = useMemoFirebase(
    () => (db && user ? doc(db, "users", user.uid) : null),
    [db, user]
  );

  const { data: profile } = useDoc(userDocRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const onHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (headerSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(headerSearch)}`);
      setHeaderSearch("");
    } else {
      router.push("/search");
    }
  };

  if (!mounted) return null;

  const isAdmin =
    user?.email?.toLowerCase() === "admin@gmail.com" ||
    profile?.isAdmin;

  const isHomePage = pathname === "/";
  const isSearchPage = pathname === "/search";

  return (
    <nav className="bg-white border-b border-gray-200 h-[72px] flex items-center w-full z-50">
      <div className="container mx-auto px-4 flex items-center justify-between gap-6 max-w-7xl">

        {/* Logo */}
        <Link href="/" aria-label="Go to homepage" className="flex items-center shrink-0">
          <span className="font-black text-xl tracking-tighter uppercase text-primary">
            Cameroon
          </span>
          <span className="font-black text-xl tracking-tighter uppercase text-secondary ml-1">
            Zoom
          </span>
        </Link>

        {/* Search */}
        <div className="grow max-w-md hidden md:block">
          {!isHomePage && !isSearchPage && (
            <form
              onSubmit={onHeaderSearch}
              role="search"
              className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 p-0.5 focus-within:border-primary"
            >
              <Input
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search businesses..."
                aria-label="Search businesses"
                className="h-10 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm px-4"
              />

              <Button
                type="submit"
                size="icon"
                variant="ghost"
                aria-label="Search"
                className="h-9 w-9"
              >
                <Search className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Mobile search */}
          {isHomePage && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open search"
              onClick={() => router.push("/search")}
            >
              <Search className="w-5 h-5" />
            </Button>
          )}

          {/* Logged in */}
          {user ? (
            <Sheet>
              <SheetTrigger asChild>
                <button
                  aria-label="User menu"
                  className="flex items-center gap-2 hover:opacity-80"
                >
                  <Avatar className="h-10 w-10 border rounded-lg">
                    <AvatarImage src={profile?.profilePhoto || undefined} />
                    <AvatarFallback className="font-black bg-primary text-white">
                      {profile?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-75 p-0 flex flex-col"
              >
                <SheetHeader className="p-8 border-b">
                  <SheetTitle className="text-lg font-black uppercase">
                    {profile?.name || "User"}
                  </SheetTitle>

                  <p className="text-xs text-gray-500">
                    {profile?.city || "Cameroon"}
                  </p>
                </SheetHeader>

                <div className="grow p-4 space-y-1">

                  <Link
                    href="/profile"
                    className="flex items-center gap-4 h-12 px-4 font-semibold text-sm hover:bg-gray-100 rounded-xl"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>

                  <Link
                    href="/profile?tab=management"
                    className="flex items-center gap-4 h-12 px-4 font-semibold text-sm hover:bg-gray-100 rounded-xl"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Businesses
                  </Link>

                  <Link
                    href="/add-business"
                    className="flex items-center gap-4 h-12 px-4 font-semibold text-sm hover:bg-gray-100 rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                    Add Business
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-4 h-12 px-4 font-semibold text-sm hover:bg-gray-100 rounded-xl"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
                </div>

                <div className="p-6 border-t mt-auto">
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center text-sm">
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>

              <Button asChild>
                <Link href="/signup" className="">Join Us</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}