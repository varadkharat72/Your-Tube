import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  User,
  Download,
  DollarSign,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Channeldialogue from "./channeldialogue";
import { useUser } from "@/lib/AuthContext";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const { user } = useUser();
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const closeMobileSidebar = () => {
    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };
  const menuItemClass = ` w-full h-11  px-3 flex items-center  rounded-lg  transition-colors hover:bg-gray-100`;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}
      <aside
        className={`  fixed md:sticky top-16  md:top-16  z-50  h-screen  border-r bg-background transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden ${sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-20 md:translate-x-0"} `}
      >
        <div className="flex justify-end p-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={closeMobileSidebar}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <nav className="px-2 pb-6 space-y-1">
          <Link href="/" onClick={closeMobileSidebar}>
            <Button
              variant="ghost"
              className={` ${menuItemClass} ${sidebarOpen ? "justify-start" : "justify-center"} `}
            >
              <Home className="w-5 h-5 shrink-0" />
              <span
                className={`  whitespace-nowrap  transition-all  duration-200  ${sidebarOpen ? "opacity-100 ml-3" : "opacity-0 w-0 overflow-hidden"} `}
              >
                Home
              </span>
            </Button>
          </Link>
          <Link href="/explore" onClick={closeMobileSidebar}>
            <Button
              variant="ghost"
              className={` ${menuItemClass} ${sidebarOpen ? "justify-start" : "justify-center"} `}
            >
              <Compass className="w-5 h-5 shrink-0" />
              <span
                className={` whitespace-nowrap transition-all  duration-200  ${sidebarOpen ? "opacity-100 ml-3" : "opacity-0 w-0 overflow-hidden"}`}
              >
                Explore
              </span>
            </Button>
          </Link>
          <Link href="/subscriptions" onClick={closeMobileSidebar}>
            <Button
              variant="ghost"
              className={` ${menuItemClass}  ${sidebarOpen ? "justify-start" : "justify-center"} `}
            >
              <PlaySquare className="w-5 h-5 shrink-0" />
              <span
                className={` whitespace-nowrap  transition-all duration-200  ${sidebarOpen ? "opacity-100 ml-3" : "opacity-0 w-0 overflow-hidden"} `}
              >
                Subscriptions
              </span>
            </Button>
          </Link>
          {user && (
            <div className="border-t mt-3 pt-3 space-y-1">
              <Link href="/history" onClick={closeMobileSidebar}>
                <Button
                  variant="ghost"
                  className={` ${menuItemClass}  ${sidebarOpen ? "justify-start" : "justify-center"} `}
                >
                  <History className="w-5 h-5 shrink-0" />
                  <span
                    className={`  whitespace-nowrap  transition-all  duration-200  ${sidebarOpen ? "opacity-100 ml-3" : "opacity-0 w-0 overflow-hidden"}  `}
                  >
                    History
                  </span>
                </Button>
              </Link>
              <Link href="/liked" onClick={closeMobileSidebar}>
                <Button
                  variant="ghost"
                  className={`  ${menuItemClass} ${sidebarOpen ? "justify-start" : "justify-center"} `}
                >
                  <ThumbsUp className="w-5 h-5 shrink-0" />
                  <span
                    className={`  whitespace-nowrap transition-all duration-200 ${sidebarOpen ? "opacity-100 ml-3" : "opacity-0 w-0 overflow-hidden"} `}
                  >
                    Liked videos
                  </span>
                </Button>
              </Link>
              <Link href="/watch-later" onClick={closeMobileSidebar}>
                <Button
                  variant="ghost"
                  className={`  ${menuItemClass} ${sidebarOpen ? "justify-start" : "justify-center"}`}
                >
                  <Clock className="w-5 h-5 shrink-0" />
                  <span
                    className={`  whitespace-nowrap  transition-all  duration-200  ${sidebarOpen ? "opacity-100 ml-3" : "opacity-0 w-0 overflow-hidden"}  `}
                  >
                    Watch later
                  </span>
                </Button>
              </Link>
              <Link href="/download-content" onClick={closeMobileSidebar}>
                <Button
                  variant="ghost"
                  className={`  ${menuItemClass}  ${sidebarOpen ? "justify-start" : "justify-center"} `}
                >
                  <Download className="w-5 h-5 shrink-0" />
                  <span
                    className={`  whitespace-nowrap  transition-all duration-200 ${sidebarOpen ? "opacity-100 ml-3" : "opacity-0 w-0 overflow-hidden"}`}
                  >
                    Download
                  </span>
                </Button>
              </Link>
              <Link href="/premium" onClick={closeMobileSidebar}>
                <Button
                  variant="ghost"
                  className={`  ${menuItemClass} ${sidebarOpen ? "justify-start" : "justify-center"} `}
                >
                  <DollarSign className="w-5 h-5 shrink-0" />
                  <span
                    className={` whitespace-nowrap  transition-all duration-200 ${sidebarOpen ? "opacity-100 ml-3" : "opacity-0 w-0 overflow-hidden"} `}
                  >
                    Premium
                  </span>
                </Button>
              </Link>
              {user?.channelname ? (
                <Link href={`/channel/${user.id}`} onClick={closeMobileSidebar}>
                  <Button
                    variant="ghost"
                    className={` ${menuItemClass}  ${sidebarOpen ? "justify-start" : "justify-center"}`}
                  >
                    <User className="w-5 h-5 shrink-0" />
                    <span
                      className={`whitespace-nowrap transition-all duration-200 ${sidebarOpen ? "opacity-100 ml-3" : "opacity-0 w-0 overflow-hidden"} `}
                    >
                      Your channel
                    </span>
                  </Button>
                </Link>
              ) : (
                <div className="px-1 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full whitespace-nowrap overflow-hidden"
                    onClick={() => setisdialogeopen(true)}
                  >
                    {sidebarOpen ? "Create Channel" : "+"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </nav>
        <Channeldialogue
          isopen={isdialogeopen}
          onclose={() => setisdialogeopen(false)}
          mode="create"
        />
      </aside>
    </>
  );
};

export default Sidebar;
