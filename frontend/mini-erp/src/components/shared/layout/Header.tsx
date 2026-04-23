import { useState, useEffect, useRef } from "react"
import { useLocation, Link } from "react-router-dom"
import { Bell, Home, Menu, X, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/store/useUIStore"

interface Notification {
  id: string
  title: string
  time: string
  read: boolean
}

const MOCK_USER = {
  name: "Admin User",
  avatar: undefined, // URL would go here
  email: "admin@minierp.com"
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", title: "Low stock alert: Soda Cans", time: "2 mins ago", read: false },
  { id: "2", title: "New order #12345", time: "1 hour ago", read: false },
  { id: "3", title: "System update complete", time: "1 day ago", read: true },
]

export function Header() {
  const location = useLocation()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }
    if (isNotificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isNotificationsOpen])

  // Simple breadcrumb logic based on path
  const pathSegments = location.pathname.split("/").filter(Boolean)
  const currentPage = pathSegments.length > 0 
    ? pathSegments[pathSegments.length - 1].charAt(0).toUpperCase() + pathSegments[pathSegments.length - 1].slice(1)
    : "Dashboard"

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between w-full">
        
        {/* LEFT SIDE: Mobile Menu & Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 -ml-2 mr-1 hover:bg-slate-100 rounded-md transition-colors duration-200"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5 text-slate-600" />
            ) : (
              <Menu className="h-5 w-5 text-slate-600" />
            )}
          </button>

          <Link to="/" className="flex items-center hover:text-slate-900 transition-colors">
            <Home className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Home</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-900">{currentPage}</span>
        </div>

        {/* RIGHT SIDE: Actions */}
        <div className="flex items-center space-x-4">
          
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-slate-100 rounded-full"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell className="h-[18px] w-[18px] text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </Button>

            {/* Simple Dropdown UI for Mock Data */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Thông báo</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{unreadCount} mới</span>
                  </div>
                  <button className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                    <CheckCheck className="h-3.5 w-3.5" />
                    Đánh dấu đã đọc
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar scroll-smooth">
                  {[...MOCK_NOTIFICATIONS, 
                    { id: "4", title: "Monthly report ready", time: "2 days ago", read: true },
                    { id: "5", title: "New supplier approved", time: "3 days ago", read: true },
                    { id: "6", title: "Inventory adjustment performed", time: "4 days ago", read: true },
                    { id: "7", title: "Price update: Electronics", time: "5 days ago", read: true },
                    { id: "8", title: "Customer feedback received", time: "1 week ago", read: true },
                  ].map((notification) => (
                    <div 
                      key={notification.id}
                      className={cn(
                        "p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors relative",
                        !notification.read && "bg-blue-50/30"
                      )}
                    >
                      {!notification.read && (
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
                      )}
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-bold text-sm text-slate-900 leading-snug">{notification.title}</span>
                        <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{notification.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">Bạn có một cập nhật mới liên quan đến nội dung này trong hệ thống.</p>
                    </div>
                  ))}
                  <div className="p-4 text-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải thêm...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center space-x-2 hidden md:flex cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900 leading-none">{MOCK_USER.name}</div>
              <div className="text-xs text-slate-500 leading-none mt-1">{MOCK_USER.email}</div>
            </div>
            <Avatar className="h-9 w-9 border border-slate-200">
              <AvatarImage src={MOCK_USER.avatar} alt={MOCK_USER.name} />
              <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                {MOCK_USER.name.split(" ").map(n => n[0]).join("").slice(0,2)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}