import { Bell, Menu, Mic, Search, User, VideoIcon, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Channeldialogue from "./channeldialogue";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { user, logout, handlegooglesignin } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const startVideoCall = () => {
    const roomId = crypto.randomUUID();
    router.push(`/call/${roomId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchQuery.trim();
    if (query) {
      setMobileSearchOpen(false);

      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  const openMobileSearch = () => {
    setMobileSearchOpen(true);
    setTimeout(() => {
      mobileSearchRef.current?.focus();
    }, 100);
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
  };

  return (
    <>
      <header className="  sticky top-0 z-[100] w-full h-16 border-b flex items-center px-2 sm:px-4 gap-1 sm:gap-2">
        <div className="flex items-center shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <Link
            href="/"
            className="flex items-center gap-1 ml-1 sm:ml-2 shrink-0 "
          >
            <div className="bg-red-600 p-1 rounded">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-medium">YourTube</span>
            <span className="hidden sm:inline text-xs ml-1">IN</span>
          </Link>
        </div>
        <form
          onSubmit={handleSearch}
          className=" hidden sm:flex items-center flex-1 min-w-0 max-w-2xl mx-auto "
        >
          <div className="flex flex-1 min-w-0">
            <Input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onKeyDown={handleKeypress}
              onChange={(e) => setSearchQuery(e.target.value)}
              className=" min-w-0 w-full rounded-l-full border-r-0 focus-visible:ring-0 "
            />
            <Button
              type="submit"
              className=" rounded-r-full  px-4  sm:px-6  border  border-l-0  shrink-0 "
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full ml-1 shrink-0"
          >
            <Mic className="w-5 h-5" />
          </Button>
        </form>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={openMobileSearch}
          className=" sm:hidden shrink-0 rounded-full "
        >
          <Search className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-0 sm:gap-1 shrink-0">
          {user ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className=" sm:hidden shrink-0 rounded-full "
              >
                <Mic className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={startVideoCall}
                className="shrink-0 rounded-full"
              >
                <VideoIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full p-0 shrink-0"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} />
                      <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  forceMount
                  className="  w-56  bg-background  text-popover-foreground  border  border-border shadow-lg  rounded-xl p-1  z-[200] "
                >
                  {user?.channelname ? (
                    <DropdownMenuItem
                      asChild
                      className=" cursor-pointer  rounded-lg text-foreground   focus:bg-accent  focus:text-accent-foreground  "
                    >
                      <Link href={`/channel/${user?._id}`}>Your channel</Link>
                    </DropdownMenuItem>
                  ) : (
                    <div className="px-2 py-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => setisdialogeopen(true)}
                      >
                        Create Channel
                      </Button>
                    </div>
                  )}
                  <DropdownMenuItem
                    asChild
                    className="  cursor-pointer rounded-lg text-foreground  focus:bg-accent focus:text-accent-foreground "
                  >
                    <Link href="/history">History</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="  cursor-pointer  rounded-lg  text-foreground  focus:bg-accent  focus:text-accent-foreground  "
                  >
                    <Link href="/liked">Liked videos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className=" cursor-pointer  rounded-lg text-foreground focus:bg-accent focus:text-accent-foreground "
                  >
                    <Link href="/watch-later">Watch later</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={logout}
                    className=" cursor-pointer  rounded-lg  text-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              className="  flex  items-center  gap-2  px-2sm:px-4"
              onClick={handlegooglesignin}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign in</span>
            </Button>
          )}
        </div>
        {mobileSearchOpen && (
          <form
            onSubmit={handleSearch}
            className=" absolute  top-16  left-0  right-0 z-[110]  flex  items-center  gap-2 p-2 bg-background border-b shadow-md sm:hidden "
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={closeMobileSearch}
              className="shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="flex flex-1 min-w-0">
              <Input
                ref={mobileSearchRef}
                type="search"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className=" flex-1 min-w-0 rounded-l-full rounded-r-none focus-visible:ring-0"
              />
              <Button
                type="submit"
                className=" rounded-l-nonerounded-r-full shrink-0 px-4"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </form>
        )}
      </header>
      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
    </>
  );
};

export default Header;
