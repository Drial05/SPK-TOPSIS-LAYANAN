"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import {
  Ligature,
  List,
  TrendingDownIcon,
  TrendingUp,
  TrendingUpIcon,
} from "lucide-react";
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
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { useThemeConfig } from "./active-theme";
import { useUser } from "@/contexts/user-context";
import Spinner from "./spinner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// config warna (sesuai theme atau manual)
const chartConfig = {
  weight: { label: "weight" },
} satisfies ChartConfig;

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const { name, value, fill } = payload[0];

    return (
      <div
        style={{
          background: "#fff",
          border: `1px solid ${fill}`,
          padding: "6px 10px",
          borderRadius: "4px",
          fontSize: 12,
        }}
      >
        {/* Nama criteria */}
        <div style={{ marginBottom: 4, fontWeight: 500 }}>Kriteria: {name}</div>
        {/* Nilai weight, dipisah dengan spasi */}
        <div style={{ marginBottom: 4, fontWeight: 500 }}>Bobot: {value}</div>
      </div>
    );
  }
  return null;
}

export default function SectionCards() {
  const user = useUser();
  const router = useRouter();
  const { activeTheme } = useThemeConfig();

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  // ambil data alternative topsis dari api
  const {
    data: resultsTopsis,
    error: resultsTopsisError,
    isLoading: resultsTopsisLoading,
  } = useSWR(
    "http://localhost:3000/api/topsis/results/all-data-results",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // ambil data criteria topsis dari api
  const {
    data: criteriaTopsis,
    error: criteriaTopsisError,
    isLoading: criteriaTopsisLoading,
  } = useSWR("http://localhost:3000/api/topsis/criteria", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // console.log("data criteria", criteriaTopsis);

  // ambil data alternative saw dari api
  const {
    data: resultsSaw,
    error: resultsSawError,
    isLoading: resultsSawLoading,
  } = useSWR(
    "http://localhost:3000/api/saw/results/all-data-results",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // ambil data criteria saw dari api
  const {
    data: criteriaSaw,
    error: criteriaSawError,
    isLoading: criteriaSawLoading,
  } = useSWR("http://localhost:3000/api/saw/criteria", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0,
  });

  useEffect(() => {
    if (resultsTopsisError || criteriaTopsisError) {
      toast.dismiss();
      toast.error("Failed to fetch data", {
        style: {
          background: "#fff",
          color: "#EF4444",
        },
        icon: "❌",
        duration: 3000,
      });
      router.refresh();
    }
  }, [resultsTopsisError, criteriaTopsisError, router]);

  // useEffect(() => {
  //   if (resultsTopsisLoading || criteriaTopsisLoading) {
  //     toast.dismiss();
  //     toast.loading("Loading data", {
  //       duration: 2000,
  //       action: {
  //         label: "Close",
  //         onClick: () => {
  //           toast.dismiss(); // atau toast.dismiss(toastId) jika ingin dismiss toast tertentu
  //         },
  //       },
  //     });
  //   }
  // }, [resultsTopsisLoading, criteriaTopsisLoading]);

  useEffect(() => {
    if (resultsSawError || criteriaSawError) {
      toast.dismiss();
      toast.error("Failed to fetch data", {
        style: {
          background: "#fff",
          color: "#EF4444",
        },
        icon: "❌",
        duration: 3000,
      });
      router.refresh();
    }
  }, [resultsSawError, criteriaSawError, router]);

  const chartDataTopsis =
    criteriaTopsis?.data?.map((item: any, index: number) => ({
      kriteria: item.name,
      weight: item.weight,
      fill: `var(--chart-${index + 1})`, // kasih warna dinamis sesuai index
    })) ?? [];

  const chartDataSaw =
    criteriaSaw?.data?.map((item: any, index: number) => ({
      kriteria: item.name,
      weight: item.weight,
      fill: `var(--chart-${index + 1})`, // kasih warna dinamis sesuai index
    })) ?? [];

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-2 grid grid-cols-1 gap-4 px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-4">
      {user?.role === "Admin" && (
        <>
          {/* Card SAW */}
          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Criteria</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-xl font-semibold tabular-nums">
                {criteriaSaw?.data?.length ?? 0}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <List className="size-10" />
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total Criteria SAW
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Alternative</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-xl font-semibold tabular-nums">
                {resultsSaw?.length ?? 0}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Ligature className="size-10" />
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total alternatives SAW
              </div>
            </CardFooter>
          </Card>

          {/* Card TOPSIS */}
          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Criteria</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-xl font-semibold tabular-nums">
                {criteriaTopsis?.data?.length ?? 0}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <List className="size-10" />
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total Criteria TOPSIS
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Alternative</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-xl font-semibold tabular-nums">
                {resultsTopsis?.length ?? 0}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Ligature className="size-10" />
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total alternatives TOPSIS
              </div>
            </CardFooter>
          </Card>

          {/* Card chart criteria SAW */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>BOBOT KRITERIA SAW</CardTitle>
            </CardHeader>
            <CardContent className="h-60 pb-0">
              <ResponsiveContainer width="100%" height="100%">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip cursor={false} content={CustomTooltip} />
                    <Pie
                      data={chartDataSaw} // pakai criteria data
                      dataKey="weight"
                      nameKey="kriteria"
                      labelLine={false}
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        value,
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius =
                          innerRadius + (outerRadius - innerRadius) / 2;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="white"
                            textAnchor="middle"
                            dominantBaseline="central"
                          >
                            {(value * 100).toFixed(0)}%
                          </text>
                        );
                      }}
                    />
                  </PieChart>
                </ChartContainer>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 text-sm">
              <div className="font-medium">Chart Bobot Kriteria</div>
              <div className="flex flex-wrap gap-4">
                {chartDataSaw.map((entry: any, index: any) => (
                  <div key={index} className="flex items-center gap-4">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    ></span>
                    <span className="text-sm">
                      {truncateText(entry.kriteria, 15)} :{" "}
                      {(entry.weight * 100).toFixed(0) + "%"}
                    </span>
                  </div>
                ))}
              </div>
            </CardFooter>
          </Card>

          {/* Card chart criteria TOPSIS */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>BOBOT KRITERIA TOPSIS</CardTitle>
            </CardHeader>
            <CardContent className="h-60 pb-0">
              <ResponsiveContainer width="100%" height="100%">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip cursor={false} content={CustomTooltip} />
                    <Pie
                      data={chartDataTopsis} // pakai criteria data
                      dataKey="weight"
                      nameKey="kriteria"
                    />
                  </PieChart>
                </ChartContainer>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 text-sm">
              <div className="font-medium">Chart Weight Criteria</div>
              <div className="flex flex-wrap gap-4">
                {chartDataTopsis.map((entry: any, index: any) => (
                  <div key={index} className="flex items-center gap-4">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    ></span>
                    <span className="text-sm">
                      {entry.kriteria} : {entry.weight}
                    </span>
                  </div>
                ))}
              </div>
            </CardFooter>
          </Card>
        </>
      )}

      {/* SAW  */}
      {user?.role === "User1" && (
        <>
          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Criteria</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {criteriaSawLoading ? (
                  <Spinner />
                ) : (
                  criteriaSaw?.data?.length ?? 0
                )}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <List className="size-15" />
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total Criteria
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Alternative</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {resultsSawLoading ? <Spinner /> : resultsSaw?.length ?? 0}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Ligature className="size-15" />
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total alternatives
              </div>
            </CardFooter>
          </Card>

          {/* Card chart criteria */}
          <Card className="flex flex-col col-span-2">
            <CardHeader>
              <CardTitle>Weight Criteria</CardTitle>
            </CardHeader>
            <CardContent className="h-60 pb-0">
              <ResponsiveContainer width="100%" height="100%">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip cursor={false} content={CustomTooltip} />
                    <Pie
                      data={chartDataSaw} // pakai criteria data
                      dataKey="weight"
                      nameKey="kriteria"
                      labelLine={false}
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        value,
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius =
                          innerRadius + (outerRadius - innerRadius) / 2;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="white"
                            textAnchor="middle"
                            dominantBaseline="central"
                          >
                            {(value * 100).toFixed(0)}%
                          </text>
                        );
                      }}
                    />
                  </PieChart>
                </ChartContainer>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 text-sm">
              <div className="font-medium">Chart Weight Criteria</div>
              <div className="flex flex-wrap gap-4">
                {chartDataSaw.map((entry: any, index: any) => (
                  <div key={index} className="flex items-center gap-4">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    ></span>
                    <span className="text-sm">
                      {truncateText(entry.kriteria, 25)} :{" "}
                      {(entry.weight * 100).toFixed(0) + "%"}
                    </span>
                  </div>
                ))}
              </div>
            </CardFooter>
          </Card>
        </>
      )}

      {/* TOPSIS  */}
      {user?.role === "User2" && (
        <>
          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Criteria</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {criteriaTopsis?.data?.length ?? 0}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <List className="size-15" />
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total Criteria
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Alternative</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {resultsTopsis?.length ?? 0}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Ligature className="size-15" />
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total alternatives
              </div>
            </CardFooter>
          </Card>

          {/* Card chart criteria */}
          <Card className="flex flex-col col-span-2">
            <CardHeader>
              <CardTitle>Weight Criteria</CardTitle>
            </CardHeader>
            <CardContent className="h-60 pb-0">
              <ResponsiveContainer width="100%" height="100%">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip cursor={false} content={CustomTooltip} />
                    <Pie
                      data={chartDataTopsis} // pakai criteria data
                      dataKey="weight"
                      nameKey="kriteria"
                    />
                  </PieChart>
                </ChartContainer>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 text-sm">
              <div className="font-medium">Chart Weight Criteria</div>
              <div className="flex flex-wrap gap-4">
                {chartDataTopsis.map((entry: any, index: any) => (
                  <div key={index} className="flex items-center gap-4">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    ></span>
                    <span className="text-sm">
                      {entry.kriteria} : {entry.weight}
                    </span>
                  </div>
                ))}
              </div>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
