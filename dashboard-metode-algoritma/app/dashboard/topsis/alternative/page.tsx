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
}

type AlternativeResponse = {
  data: Alternative[];
  total: number;
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
    throw new Error("Failed to fetch candidates");
  }

  const json = await res.json();
  return json as AlternativeResponse;
};

export default function AlternativePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, error, isLoading } = useSWR<AlternativeResponse>(
    `http://localhost:3000/api/topsis/alternative?page=${page}&limit=${limit}`,
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  const [tableInstance, setTableInstance] = useState<TableType<any> | null>(
    null
  );
  const [rowSelection, setRowSelection] = useState({});

  // console.log("Data:", data);

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error("Failed to fetch alternative", {
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

  // hapus multiple alternative
  const handleDelete = async () => {
    const token = getCookie("token");
    if (!tableInstance) {
      toast.error("Tabel belum siap. coba lagi");
      return;
    }

    const selectedRows = tableInstance.getSelectedRowModel().rows || [];

    if (selectedRows.length === 0) {
      toast.error("Tidak ada alternative yang di pilih");
      return;
    }

    const selecttedAlternatives = selectedRows.map(
      (row) => (row.original as TableRow).id
    );

    // hitung total jumlah alternative yang akan di hapus
    const totalAlternative =
      data?.data?.filter((alternative) =>
        selecttedAlternatives.includes(Number(alternative.id))
      ).length || 0;

    const confirmDelete = confirm(
      `Alternatives yang di pilih memiliki total ${totalAlternative} skor.\nSemua skor ini akan di hapus \n Yakin ingin melanjutkan?`
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch("http://localhost:3000/api/topsis/alternative", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(selecttedAlternatives),
      });

      if (!res.ok) throw new Error("Failed to delete alternatives");

      location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  // const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="container mx-auto px-2">
      {/* {selectedCount > 0 && (
        <Button variant="destructive" onClick={handleDelete} className="py-4">
          Hapus {selectedCount} Data
        </Button>
      )} */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.total || 0}
        onDelete={handleDelete}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onTableReady={(table) => setTableInstance(table)}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  );
}
