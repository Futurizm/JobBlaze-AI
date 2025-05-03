"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Briefcase,
  FileText,
  Home,
  MessageSquare,
  Mic,
  PenTool,
  Settings,
  Users,
  BarChart2,
  Laptop,
  Camera,
  Map,
  LaptopMinimalIcon,
  FileUser,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <Sidebar variant="floating" collapsible="icon" className="border-none shadow-md main-sidebar">
      <SidebarHeader className="py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              JobBlaze
            </span>
          </div>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/")} className="hover:bg-primary/5">
              <Link href="/">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/resume-enhancer")} className="hover:bg-primary/5">
              <Link href="/resume-enhancer">
                <PenTool className="h-5 w-5" />
                <span>Resume Enhancer</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/resume-builder")} className="hover:bg-primary/5">
              <Link href="/resume-builder">
                <FileText className="h-5 w-5" />
                <span>Resume Builder</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/interview-prep")} className="hover:bg-primary/5">
              <Link href="/interview-prep">
                <MessageSquare className="h-5 w-5" />
                <span>Interview Prep</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* New AR Job Search menu item */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/ar-job-search")} className="hover:bg-primary/5">
              <Link href="/ar-job-search">
                <Camera className="h-5 w-5" />
                <span>AR Job Search</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/ar-job-search")} className="hover:bg-primary/5">
              <Link href="/map">
                <Map className="h-5 w-5" />
                <span>Map</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/ar-job-search")} className="hover:bg-primary/5">
              <Link href="/career-page">
                <LaptopMinimalIcon className="h-5 w-5" />
                <span>Career</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/ar-job-search")} className="hover:bg-primary/5">
              <Link href="/resume-rating">
                <FileUser className="h-5 w-5" />
                <span>Resume Rating</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-100 dark:border-gray-800 py-2">
        <div className="p-2">
          <div className="flex items-center gap-2 p-2 rounded-md hover:bg-primary/5 transition-colors">
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarImage src="/placeholder.svg?height=36&width=36" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">John Doe</span>
              <span className="text-xs text-muted-foreground">john@example.com</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
