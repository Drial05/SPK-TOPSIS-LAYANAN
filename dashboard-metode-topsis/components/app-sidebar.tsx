"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
  LayoutDashboard,
  Component,
  Ligature,
  ListCheck,
  Trophy,
  List,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavDashboard } from "@/components/nav-dashboard";
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
import { useThemeConfig } from "./active-theme";
import { cn } from "@/lib/utils";

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
    // {
    //   title: "Dashboard",
    //   url: "/dashboard/",
    //   icon: LayoutDashboard,
    // },
    {
      title: "Alternative",
      url: "/dashboard/topsis/scores",
      icon: Ligature,
    },
    {
      title: "Criteria",
      url: "/dashboard/topsis/bobot",
      icon: ListCheck,
    },
    {
      title: "Nilai Preferensi",
      url: "/dashboard/topsis/criteria",
      icon: List,
    },
    {
      title: "Ranking",
      url: "/dashboard/topsis/ranking",
      icon: Trophy,
    },
  ],
  // navMain: [
  //   {
  //     title: "SPK",
  //     url: "#",
  //     icon: BookOpen,
  //     items: [
  //       // {
  //       //   title: "Alternative",
  //       //   url: "/dashboard/topsis/scores",
  //       // },
  //       // {
  //       //   title: "Alternative",
  //       //   url: "/dashboard/topsis/alternative",
  //       // },
  //       {
  //         title: "Criteria",
  //         url: "/dashboard/topsis/bobot",
  //       },
  //       {
  //         title: "Nilai Preferensi",
  //         url: "/dashboard/topsis/criteria",
  //       },
  //       {
  //         title: "Ranking",
  //         url: "/dashboard/topsis/ranking",
  //       },
  //       // {
  //       //   title: "Chart",
  //       //   url: "/dashboard/topsis/chart",
  //       // },
  //     ],
  //   },
  // ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

export function AppSidebar(props: AppSidebarProps) {
  // const { activeTheme } = useThemeConfig();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavDashboard items={data.navDashboard} />
        {/* <NavMain items={data.navMain} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
