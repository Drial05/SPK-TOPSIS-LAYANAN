"use client";

import useSWR from "swr";
import { getCookie } from "cookies-next";
import { Criteria, columns } from "./columns";
import { DataTable } from "./data-table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type CriteriaResponse = {
  data: Criteria[];
  total: number;
};

const fetcher = async (url: string): Promise<CriteriaResponse> => {
  const token = getCookie("token");
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch criteria");
  }

  const json = await res.json();
  return json as CriteriaResponse;
};

export default function AlternativePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, error, isLoading } = useSWR<CriteriaResponse>(
    `http://localhost:3000/api/topsis/criteria?page=${page}&limit=${limit}`,
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  // console.log("Data:", data);

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
