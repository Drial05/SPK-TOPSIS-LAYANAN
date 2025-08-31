"use client";

import * as React from "react";
import { useEffect } from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
  LayoutDashboard,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavDashboard } from "@/components/nav-dashboard";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { deleteCookie, getCookie } from "cookies-next";
import { toast } from "sonner";

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navDashboard: [
    {
      title: "Dashboard",
      url: "/dashboard/",
      icon: LayoutDashboard,
    },
  ],
  navMain: [
    {
      title: "SAW",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Alternative",
          url: "/dashboard/saw/alternative",
        },
        {
          title: "Criteria",
          url: "/dashboard/saw/criteria",
        },
        {
          title: "Scores",
          url: "/dashboard/saw/scores",
        },
        {
          title: "Ranking",
          url: "/dashboard/saw/ranking",
        },
        {
          title: "Chart",
          url: "/dashboard/saw/chart",
        },
      ],
    },
    {
      title: "Topsis",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Alternative",
          url: "/dashboard/topsis/alternative",
        },
        {
          title: "Criteria",
          url: "/dashboard/topsis/criteria",
        },
        {
          title: "Scores",
          url: "/dashboard/topsis/scores",
        },
        {
          title: "Ranking",
          url: "/dashboard/topsis/ranking",
        },
        {
          title: "Chart",
          url: "/dashboard/topsis/chart",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavDashboard items={data.navDashboard} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
