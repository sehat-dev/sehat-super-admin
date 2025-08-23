import * as React from "react"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center space-x-2 text-sm text-gray-500 mb-6", className)}>
      <a
        href="/dashboard"
        className="flex items-center hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
      >
        <Home className="h-4 w-4" />
      </a>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.href ? (
            <a
              href={item.href}
              className="hover:text-gray-700 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 font-medium px-2 py-1 bg-gray-100 rounded-lg">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
} 