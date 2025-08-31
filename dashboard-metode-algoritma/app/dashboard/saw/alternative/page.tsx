"use client";

import useSWR from "swr";
import { getCookie } from "cookies-next";
import { Alternative, columns } from "./columns";
import { DataTable } from "./data-table";
import { Table as TableType } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface TableRow {
  id: number;
  name: string;
  email: string;
}

type AlternativeResponse = {
  data: Alternative[];
  total: number;
};

export type AlternativeForm = {
  id: number | null;
  name: string | null;
  email: string | null;
};

const fetcher = async (url: string): Promise<AlternativeResponse> => {
  const token = getCookie("token");
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch alternatives");
  }

  const json = await res.json();
  return json as AlternativeResponse;
};

export default function AlternativePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, error, isLoading } = useSWR<AlternativeResponse>(
    `http://localhost:3000/api/saw/alternative?page=${page}&limit=${limit}`,
    fetcher,
    {
      refreshInterval: 5000,
    }
  );
  const [tableInstance, setTableInstance] = useState<TableType<any> | null>(
    null
  );
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error("Failed to fetch Alternative", {
        style: {
          background: "#fff",
          color: "#EF4444",
        },
        icon: "❌",
        duration: 2000,
      });
      router.refresh();
    }
  }, [error, router]);

  if (isLoading) return <p className="px-4">Loading data...</p>;

  // hapus multiple Alternative
  const handleDelete = async () => {
    // const token = getCookie("token");
    if (!tableInstance) {
      toast.error("Tabel belum siap. coba lagi");
      return;
    }

    const selectedRows = tableInstance.getSelectedRowModel().rows || [];

    if (selectedRows.length === 0) {
      toast.error("Tidak ada Alternative yang dipilih");
      return;
    }

    const selectedAlternativeIds = selectedRows.map(
      (row) => (row.original as TableRow).id
    );

    // hitung total jumlah skor yang akan dihapus (di semua halaman)
    const totalAlternativeToDelete =
      data?.data?.filter((alternative) =>
        selectedAlternativeIds.includes(Number(alternative.id))
      ).length || 0;

    const confirmDelete = confirm(
      `Alternative yang di pilih memiliki total ${totalAlternativeToDelete} skor.\nSemua skor ini akan dihapus \n\nYakin ingin melanjutkan?`
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch("http://localhost:3000/api/saw/alternative", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedAlternativeIds),
      });

      //console.log("Select Delete", selectedCandidateIds);

      if (!res.ok) throw new Error("Gagal menghapus data");

      location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-2">
      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.total || 0}
        page={page}
        limit={limit}
        onDelete={handleDelete}
        onPageChange={setPage}
        onTableReady={(table) => setTableInstance(table)}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  );
}
