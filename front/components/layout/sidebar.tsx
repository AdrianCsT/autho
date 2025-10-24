"use client"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronLeft, ChevronRight, LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

export interface SidebarMenuItem {
  title: string
  href?: string
  icon?: LucideIcon
  items?: SidebarMenuItem[]
  badge?: string | number
  roles?: string[] // Allowed roles to see this item
}

interface SidebarProps {
  items: SidebarMenuItem[]
  className?: string
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  userRoles?: string[] // Current user's roles
  logo?: React.ReactNode
  onClose?: () => void // For mobile close
}

export function Sidebar({
  items,
  className,
  collapsed = false,
  onCollapsedChange,
  userRoles = [],
  logo,
  onClose
}: SidebarProps) {
  const filteredItems = filterItemsByRole(items, userRoles)

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Logo/Brand Section */}
      <div className={cn(
        "flex items-center border-b transition-all py-3",
        collapsed ? "justify-center px-2" : "justify-between px-3"
      )}>
        {collapsed ? (
          onCollapsedChange && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCollapsedChange(!collapsed)}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )
        ) : (
          <>
            {logo || <span className="font-semibold text-lg">Dashboard</span>}
            <div className="flex items-center gap-1">
              {onCollapsedChange && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCollapsedChange(!collapsed)}
                  className="h-8 w-8 hidden md:flex"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 md:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2 scrollbar-thin">
        {filteredItems.map((item, index) => (
          <SidebarItem
            key={index}
            item={item}
            collapsed={collapsed}
            userRoles={userRoles}
          />
        ))}
      </nav>
    </aside>
  )
}

function filterItemsByRole(items: SidebarMenuItem[], userRoles: string[]): SidebarMenuItem[] {
  return items
    .filter(item => {
      // If no roles specified, show to everyone
      if (!item.roles || item.roles.length === 0) return true
      // Check if user has any of the required roles
      return item.roles.some(role => userRoles.includes(role))
    })
    .map(item => ({
      ...item,
      items: item.items ? filterItemsByRole(item.items, userRoles) : undefined
    }))
}

interface SidebarItemProps {
  item: SidebarMenuItem
  collapsed: boolean
  level?: number
  userRoles?: string[]
}

function SidebarItem({ item, collapsed, level = 0, userRoles = [] }: SidebarItemProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = item.items && item.items.length > 0
  const isActive = item.href ? pathname === item.href : false

  // Filter children by role
  const filteredChildren = hasChildren
    ? filterItemsByRole(item.items!, userRoles)
    : []

  if (hasChildren && filteredChildren.length > 0) {
    return (
      <div className={cn(level === 0 && "mb-1")}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 transition-colors",
                level > 0 && "pl-8 h-9 text-sm",
                level === 0 && "h-10 font-medium",
                collapsed && "justify-center px-2",
                isActive && "bg-secondary font-medium",
                level > 0 && !isActive && "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.icon && (
                <item.icon className={cn(
                  "shrink-0",
                  level === 0 ? "h-5 w-5" : "h-4 w-4"
                )} />
              )}
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          {!collapsed && (
            <CollapsibleContent className="space-y-0.5 pt-0.5">
              {level === 0 && (
                <div className="ml-4 border-l-2 border-muted pl-2 space-y-0.5">
                  {filteredChildren.map((subItem, index) => (
                    <SidebarItem
                      key={index}
                      item={subItem}
                      collapsed={collapsed}
                      level={level + 1}
                      userRoles={userRoles}
                    />
                  ))}
                </div>
              )}
              {level > 0 && filteredChildren.map((subItem, index) => (
                <SidebarItem
                  key={index}
                  item={subItem}
                  collapsed={collapsed}
                  level={level + 1}
                  userRoles={userRoles}
                />
              ))}
            </CollapsibleContent>
          )}
        </Collapsible>
        {level === 0 && !collapsed && <Separator className="my-2" />}
      </div>
    )
  }

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-2 transition-colors",
        level > 0 && "pl-8 h-9 text-sm font-normal",
        level === 0 && "h-10 font-medium",
        collapsed && "justify-center px-2",
        isActive && "bg-secondary font-medium",
      )}
      asChild
    >
      <Link href={item.href || "#"}>
        {item.icon && (
          <item.icon className={cn(
            "shrink-0",
            level === 0 ? "h-5 w-5" : "h-4 w-4"
          )} />
        )}
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge && (
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    </Button>
  )
}
