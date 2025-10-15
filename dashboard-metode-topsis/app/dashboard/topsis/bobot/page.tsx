"use client";

import useSWR from "swr";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Bobot } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { toast } from "sonner";

type BobotResponse = {
  data: Bobot[];
  total: number;
};

const fetcher = async (url: string): Promise<BobotResponse> => {
  const token = getCookie("token");
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Bobot");
  }

  const json = await res.json();
  return json as BobotResponse;
};

export default function BobotPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useSWR<BobotResponse>(
    // `http://localhost:3000/api/topsis/bobot?page=${page}&limit=${limit}`,
    "http://localhost:3000/api/topsis/bobot/all",
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error("Failed to fetch criteria", {
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

  if (isLoading) return <p className="px-4">Loading data...</p>;

  return (
    <div className="container mx-auto px-2">
      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.total || 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />
    </div>
  );
}
