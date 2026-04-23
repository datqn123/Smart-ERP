import { useRef, useEffect, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { 
  LayoutDashboard,
  Package, 
  ShoppingCart, 
  Banknote, 
  Settings, 
  LogOut,
  FileInput,
  Brain,
  ChevronDown
} from "lucide-react"
import { useSidebarStore, type NavItemKey } from "@/store/sidebarStore"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { useUIStore } from "@/store/useUIStore"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface NavItem {
  id: NavItemKey
  label: string
  icon: React.ReactNode
  subItems?: { label: string; path: string }[]
}

interface SidebarProps {
  isMobile?: boolean
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
    subItems: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "AI Insights", path: "/dashboard/ai-insights" },
    ],
  },
  {
    id: "inventory",
    label: "Kho hàng",
    icon: <Package className="h-[18px] w-[18px]" />,
    subItems: [
      { label: "Tồn kho", path: "/inventory/stock" },
      { label: "Phiếu nhập kho", path: "/inventory/inbound" },
      { label: "Xuất kho & Điều phối", path: "/inventory/dispatch" },
      { label: "Kiểm kê kho", path: "/inventory/audit" },
    ],
  },
  {
    id: "products",
    label: "Sản phẩm",
    icon: <Package className="h-[18px] w-[18px]" />,
    subItems: [
      { label: "Danh mục sản phẩm", path: "/products/categories" },
      { label: "Quản lý sản phẩm", path: "/products/list" },
      { label: "Nhà cung cấp", path: "/products/suppliers" },
      { label: "Khách hàng", path: "/products/customers" },
    ],
  },
  {
    id: "orders",
    label: "Đơn hàng",
    icon: <ShoppingCart className="h-[18px] w-[18px]" />,
    subItems: [
      { label: "Đơn bán lẻ", path: "/orders/retail" },
      { label: "Đơn bán sỉ", path: "/orders/wholesale" },
      { label: "Đơn trả hàng", path: "/orders/returns" },
    ],
  },
  {
    id: "approvals",
    label: "Phê duyệt",
    icon: <FileInput className="h-[18px] w-[18px]" />,
    subItems: [
      { label: "Chờ phê duyệt", path: "/approvals/pending" },
      { label: "Lịch sử phê duyệt", path: "/approvals/history" },
    ],
  },
  {
    id: "cashflow",
    label: "Dòng tiền",
    icon: <Banknote className="h-[18px] w-[18px]" />,
    subItems: [
      { label: "Giao dịch thu chi", path: "/cashflow/transactions" },
      { label: "Sổ nợ", path: "/cashflow/debt" },
      { label: "Sổ cái tài chính", path: "/cashflow/ledger" },
    ],
  },
  {
    id: "ai-tools",
    label: "AI & Trợ lý",
    icon: <Brain className="h-[18px] w-[18px]" />,
    subItems: [
      { label: "Trợ lý ảo AI", path: "/ai/chat" },
    ],
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: <Settings className="h-[18px] w-[18px]" />,
    subItems: [
      { label: "Thông tin cửa hàng", path: "/settings/store-info" },
      { label: "Quản lý nhân viên", path: "/settings/employees" },
      { label: "Cấu hình cảnh báo", path: "/settings/alerts" },
      { label: "Nhật ký hệ thống", path: "/settings/system-logs" },
    ],
  },
]

export function Sidebar({ isMobile = false }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { expandedItems, toggleItem, expandItem } = useSidebarStore()
  const { setSidebarOpen, sidebarWidth, setSidebarWidth } = useUIStore()
  const isResizing = useRef(false)
  const user = useAuthStore(state => state.user)

  // Use useMemo to prevent infinite re-renders since .filter() creates a new array reference
  const filteredNavItems = useMemo(() => {
    return navItems.filter(item => {
      if (item.id === 'approvals' && user?.role !== 'Owner') return false
      if (item.id === 'cashflow' && user?.role === 'Staff') return false
      return true
    })
  }, [user?.role])

  const isActiveRoute = (path: string) => location.pathname === path
  
  const isParentActive = (item: NavItem) => {
    return item.subItems?.some(sub => sub.path === location.pathname)
  }

  useEffect(() => {
    // Find parent of current route and expand it automatically
    const activeParent = filteredNavItems.find(item => 
      item.subItems?.some(sub => sub.path === location.pathname)
    )
    if (activeParent) {
      expandItem(activeParent.id)
    }
  }, [location.pathname, expandItem, filteredNavItems])

  const handleNavigation = (path: string) => {
    navigate(path)
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true
    document.body.style.cursor = 'col-resize'
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      
      const newWidth = e.clientX
      if (newWidth >= 192 && newWidth <= 320) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = 'default'
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [setSidebarWidth])

  return (
    <aside
      className={`relative bg-slate-100 flex flex-col flex-shrink-0 h-screen ${
        isMobile ? "w-full" : "border-r border-slate-200"
      } ${!isResizing.current ? "transition-[width] duration-300 ease-in-out" : ""}`}
      style={{ width: isMobile ? '100%' : sidebarWidth }}
    >
      {/* Resizer Handle */}
      {!isMobile && (
        <div
          className="absolute top-0 right-[-3px] w-1.5 h-full cursor-col-resize z-50 hover:bg-slate-300/50 active:bg-slate-400/50 transition-colors"
          onMouseDown={startResizing}
        />
      )}

      {/* Logo Section */}
      <div className="h-14 flex items-center justify-center border-b border-slate-200 px-4 flex-shrink-0">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="ml-3 font-semibold text-slate-900 text-sm whitespace-nowrap truncate overflow-hidden">
          Mini ERP
        </span>
      </div>

      {/* Navigation Items - Scrollable */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {filteredNavItems.map((item) => (
          <div key={item.id} className="space-y-2">
            <Collapsible
              open={expandedItems.has(item.id)}
              onOpenChange={() => toggleItem(item.id)}
            >
              <CollapsibleTrigger asChild>
                <button 
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-all duration-200 h-11 ${
                    isParentActive(item) 
                      ? "text-slate-900 bg-slate-200/50" 
                      : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`${isParentActive(item) ? "text-primary" : "text-slate-600"} flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <span className={`text-sm ${isParentActive(item) ? "font-semibold" : "font-medium"} truncate`}>
                      {item.label}
                    </span>
                  </div>
                  {item.subItems && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 flex-shrink-0 ${
                        isParentActive(item) ? "text-primary" : "text-slate-600"
                      } ${
                        expandedItems.has(item.id) ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
              </CollapsibleTrigger>

              {/* Sub Items - No 1px borders, use whitespace */}
              {item.subItems && (
                <CollapsibleContent className="space-y-1 mt-1.5 pl-6 overflow-hidden">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.path}
                      onClick={() => handleNavigation(subItem.path)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 h-10 flex items-center truncate ${
                        isActiveRoute(subItem.path)
                          ? "relative bg-slate-200 text-slate-900 font-medium before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary overflow-hidden"
                          : "text-slate-700 hover:bg-slate-200/50 hover:text-slate-900"
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </CollapsibleContent>
              )}
            </Collapsible>

            {/* Reduced vertical whitespace between groups: 12px */}
            {item.id !== "settings" && <div className="h-3" />}
          </div>
        ))}
      </nav>

      {/* Footer - Logout */}
      <div className="border-t border-slate-200 p-3 flex-shrink-0">
        <Button
          variant="ghost"
          onClick={() => {
            navigate("/login")
            if (isMobile) setSidebarOpen(false)
          }}
          className="w-full h-11 justify-start space-x-3 text-alert hover:bg-alert-light rounded-md transition-all truncate"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          <span className="text-sm font-medium">Đăng xuất</span>
        </Button>
      </div>
    </aside>
  )
}
