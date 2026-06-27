import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  Home,
  BookOpen,
  BarChart,
  Upload,
  List,
  HelpCircle,
  FileEdit,
  ChevronRight,
  Briefcase,
  Gift,
  FolderOpen,
  Mic
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export function DashboardSidebar() {
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: Home,
      count: 0
    },
    {
      title: "AI Resume Analysis",
      path: "/dashboard/analyze",
      icon: Upload,
      count: 0
    },
    {
      title: "AI Resume Builder",
      path: "/dashboard/builder",
      icon: FileText,
      count: 0
    },
    {
      title: "AI Job Match",
      path: "/dashboard/job-match",
      icon: BarChart,
      count: 0
    },
    {
      title: "AI Cover Letters",
      path: "/dashboard/cover-letter",
      icon: FileEdit,
      count: 0,
      isNew: true
    },
    {
      title: "My Documents",
      path: "/dashboard/my-documents",
      icon: FolderOpen,
      count: 0
    },
    {
      title: "Help & Tips",
      path: "/dashboard/help",
      icon: HelpCircle,
      count: 0
    },
    {
      title: "Refer & Earn",
      path: "/dashboard/referral",
      icon: Gift,
      count: 0,
      isNew: true
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Sidebar className="bg-background border-r border-border">
      <SidebarRail className="bg-background border-r border-border" />

      <SidebarHeader className="border-b border-border/40 pb-3 sm:pb-4 h-14 sm:h-16 flex items-center bg-background/50 backdrop-blur-sm">
        <Link to="/" className="flex items-center p-2 group">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white mr-2 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <span className="font-bold text-sm">R</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-foreground font-heading tracking-tight">Resuvio</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-3 sm:py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2 px-3">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                    className={`group relative overflow-hidden transition-all duration-300 ${isActive(item.path)
                      ? 'bg-primary/5 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                  >
                    <Link to={item.path} className="flex items-center justify-between py-2">
                      {isActive(item.path) && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-blue-500 rounded-r-full" />
                      )}
                      <div className="flex items-center z-10">
                        <item.icon className={`${isActive(item.path) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} transition-colors duration-300`} size={18} />
                        <span className="ml-3 mr-2 text-sm">{item.title}</span>
                        {item.isNew && (
                          <Badge className="ml-1 text-[9px] h-4.5 px-1.5 bg-gradient-to-r from-violet-500/10 to-blue-500/10 text-violet-500 border border-violet-500/20 hover:bg-violet-500/20">New</Badge>
                        )}
                      </div>

                      {item.count > 0 && (
                        <div className="flex items-center z-10">
                          <Badge variant="outline" className="text-[10px] bg-background/50 text-muted-foreground border-border/50">
                            {item.count}
                          </Badge>
                          <ChevronRight size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                        </div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-6 sm:mt-8 px-3 sm:px-4">
          <div className="relative rounded-xl overflow-hidden p-4 border border-border/40 bg-card/50 shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/10 to-blue-500/10 blur-xl -z-10 rounded-full translate-x-1/3 -translate-y-1/3" />
            <h4 className="font-semibold text-foreground mb-1.5 flex items-center text-sm">
              <BookOpen size={14} className="mr-2 text-violet-500" />
              Pro Tips
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tailoring your resume to each job increases your chances by 60%
            </p>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-border py-2 sm:py-3 px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-foreground"></div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Premium Plan</span> - Active
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
