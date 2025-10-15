"use client";

import React, { useEffect } from "react";
import useSWR from "swr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useThemeConfig } from "@/components/active-theme";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// warna sesuai theme
const THEME_COLORS: Record<string, string> = {
  default: "#3b82f6", // biru default
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  "default-scaled": "#2563eb",
  "blue-scaled": "#1d4ed8",
  "mono-scaled": "#6b7280",
};

export default function SectionCards() {
  const router = useRouter();
  const { activeTheme } = useThemeConfig(); // ⬅️ ambil theme aktif

  // ambil data dari api
  const { data, error, isLoading } = useSWR(
    "http://localhost:3000/api/topsis/results/all-data-results",
    fetcher
  );

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error("Failed to fetch ranking", {
        style: {
          background: "#fff",
          color: "#EF4444",
        },
        icon: "❌",
        duration: 3000,
      });
      router.refresh();
    }
  }, [error, router]);

  if (isLoading) {
    toast.loading("Loading data", {
      id: "loading-data",
      duration: Infinity,
      action: {
        label: "Close",
        onClick: () => {
          toast.dismiss(); // atau toast.dismiss(toastId) jika ingin dismiss toast tertentu
        },
      },
    });
  } else {
    toast.dismiss("loading-data");
  }

  const charData = (data || []).map((item: any) => ({
    name: item.alternative_name,
    score: Number(item.total_score.toFixed(4)),
  }));

  // pilih warna berdasarkan theme
  const barColor = THEME_COLORS[activeTheme] || THEME_COLORS["default"];

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-1 @5xl/main:grid-cols-1 grid grid-cols-1 gap-4 px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-4">
      <Card className="py-0">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
            <CardTitle>
              Hasil Ranking Penilaian Per Layanan - Interactive
            </CardTitle>
            <CardDescription>
              Showing total transaction for today
            </CardDescription>
          </div>
          <div className="flex">
            <button
              key=""
              data-active=""
              className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
            >
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {data?.length ?? 0}
              </span>
              <span className="text-muted-foreground text-xs">Layanan</span>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={charData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={100}
              />
              <YAxis />
              <Tooltip cursor={{ fill: "#e0f2fe", opacity: 0.3 }} />
              <Bar dataKey="score" fill={barColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
