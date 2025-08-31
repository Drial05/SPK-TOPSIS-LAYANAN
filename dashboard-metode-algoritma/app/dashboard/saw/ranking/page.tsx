"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { Ranking, columns } from "./columns";
import { DataTable } from "./data-table";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";

type RankingResponse = {
  data: Ranking[];
  total: number;
};

const fetcher = async (url: string): Promise<RankingResponse> => {
  // console.log("url params:", url);
  const token = getCookie("token");
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch ranking");
  }

  const json = await res.json();
  return json as RankingResponse;
};

export default function RankingPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  // state untuk memastikan getSaw sudah selesai
  const [sawDone, setSawDone] = useState(false);

  // panggil api getSaw sekali sudah selesai
  useEffect(() => {
    const calculateSaw = async () => {
      try {
        toast.dismiss();
        toast.loading("Menghitung Saw...", {
          duration: 2000,
          action: {
            label: "Close",
            onClick: () => {
              toast.dismiss(); // atau toast.dismiss(toastId) jika ingin dismiss toast tertentu
            },
          },
        });
        const token = getCookie("token");
        const res = await fetch("http://localhost:3000/api/saw/calculate", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to calculate SAW");

        toast.dismiss();
        toast.success("Perhitungan SAW selesai", {
          icon: "✅",
          duration: 3000,
          style: {
            background: "#fff",
            color: "#4ADE80",
          },
        });
        setSawDone(true);
      } catch (err) {
        toast.dismiss();
        toast.error("Gagal menghitung SAW", {
          style: {
            background: "#fff",
            color: "#EF4444",
          },
          icon: "❌",
          duration: 3000,
        });
        console.error(err);
      }
    };

    calculateSaw();
  }, []);

  const { data, error, isLoading } = useSWR<RankingResponse>(
    sawDone
      ? `http://localhost:3000/api/saw/results?page=${page}&limit=${limit}`
      : null,
    fetcher,
    {
      refreshInterval: 5000,
    }
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
    toast.dismiss();
    toast.loading("Loading data", {
      duration: 5000,
      action: {
        label: "Close",
        onClick: () => {
          toast.dismiss(); // atau toast.dismiss(toastId) jika ingin dismiss toast tertentu
        },
      },
    });
  }

  return (
    <div className="container mx-auto px-4">
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
