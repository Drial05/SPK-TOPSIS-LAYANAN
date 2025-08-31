"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import { Table as TableType } from "@tanstack/react-table";
import { generateColumns } from "./columns";
import { DataTable } from "./data-table";
import { toast } from "sonner";
import { getCookie } from "cookies-next";
import { AlternativeForm, EditScoreDialog } from "./editScore";
import { Button } from "@/components/ui/button";

interface RawScore {
  id: number;
  alternative_id: number;
  alternative_name: string;
  criteria_id: number;
  criteria_name: string;
  value: number;
  rating: number;
}

interface TableRow {
  alternative_id: number;
  alternative_name: string;
  [criteria: string]: any;
}

interface TableRowMatirks {
  alternative_id: number;
  alternative_name: string;
  [criteria: string]: any;
}

type ScoresResponse = {
  data: RawScore[];
  total: number;
};

const fetcher = async (url: string): Promise<ScoresResponse> => {
  const token = getCookie("token");
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch scores");
  }

  const json = await res.json();
  return json as ScoresResponse;
};

export default function ScoreTable() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [openDialog, setOpenDialog] = useState(false);
  const [tableInstance, setTableInstance] =
    useState<TableType<TableRow> | null>(null);
  const [selectedAlternative, setSelectedAlternative] =
    useState<AlternativeForm | null>(null);
  const [rowSelection, setRowSelection] = useState({});

  const {
    data: response,
    error,
    isLoading,
  } = useSWR<ScoresResponse>(
    `http://localhost:3000/api/topsis/scores?page=${page}&limit=${limit}`,
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  const { tableData, criteriaNames } = useMemo(() => {
    const grouped: Record<number, TableRow> = {};
    const criteriaSet: Set<string> = new Set();

    response?.data.forEach((score) => {
      const { id, alternative_id, alternative_name, criteria_name, value } =
        score;
      if (!grouped[alternative_id]) {
        grouped[alternative_id] = { id, alternative_id, alternative_name };
      }
      grouped[alternative_id][criteria_name] = value;
      criteriaSet.add(criteria_name);
    });

    return {
      tableData: Object.values(grouped),
      criteriaNames: [...criteriaSet],
    };
  }, [response]);

  const { tableDataMatriks, criteriaNamesMatriks } = useMemo(() => {
    const grouped: Record<number, TableRowMatirks> = {};
    const criteriaSet: Set<string> = new Set();

    response?.data.forEach((score) => {
      const { id, alternative_id, alternative_name, criteria_name, rating } =
        score;
      if (!grouped[alternative_id]) {
        grouped[alternative_id] = { id, alternative_id, alternative_name };
      }
      grouped[alternative_id][criteria_name] = rating;
      criteriaSet.add(criteria_name);
    });

    return {
      tableDataMatriks: Object.values(grouped),
      criteriaNamesMatriks: [...criteriaSet],
    };
  }, [response]);

  const handleEdit = (alternative_id: number) => {
    // const candidate_id = candidate.candidate_id;

    if (!response?.data) return;

    const alternativeScores = response.data.filter(
      (s) => s.alternative_id === alternative_id
    );

    const scores = alternativeScores.map((s) => ({
      id: s.id,
      criteria_id: s.criteria_id,
      value: s.value.toString(),
    }));

    const alternativeForm: AlternativeForm = {
      alternative_id,
      scores,
    };

    setSelectedAlternative(alternativeForm);
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    if (!tableInstance || !response?.data) return;

    const selectedAlternativeIds = tableInstance
      .getSelectedRowModel()
      .rows.map((row) => row.original.alternative_id);

    if (selectedAlternativeIds.length === 0) return;

    // hitung total jumlah skor yang akan dihapus (di semua halaman)
    const totalScoresToDelete = response.data.filter((score) =>
      selectedAlternativeIds.includes(score.alternative_id)
    ).length;

    const confirmDelete = confirm(
      `Alternatif yang di pilih memiliki total ${selectedAlternativeIds.length} skor.\nSemua skor ini akan dihapus \n\nYakin ingin melanjutkan?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch("http://localhost:3000/api/topsis/scores", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedAlternativeIds),
      });

      if (!res.ok) throw new Error("Gagal menghapus data");

      location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = generateColumns(criteriaNames, handleEdit);

  useEffect(() => {
    if (isLoading) {
      toast.dismiss();
      toast.loading("Memuat data score...", {
        style: {
          background: "#fff",
          color: "#EFA444",
        },
        duration: 3000,
        action: {
          label: "Close",
          onClick: () => {
            toast.dismiss(); // atau toast.dismiss(toastId) jika ingin dismiss toast tertentu
          },
        },
      });
    }
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error("Failed load data score", {
        duration: 3000,
        action: {
          label: "X",
          onClick: () => {
            toast.dismiss(); // atau toast.dismiss(toastId) jika ingin dismiss toast tertentu
          },
        },
      });
    }
  }, [error]);

  return (
    <div className="px-1">
      <DataTable
        columns={columns}
        data={tableData}
        dataMatriks={tableDataMatriks}
        onDelete={handleDelete}
        total={response?.total || 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onTableReady={(table) => setTableInstance(table)}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />

      {selectedAlternative && (
        <EditScoreDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          initialData={[selectedAlternative]}
        />
      )}
    </div>
  );
}
