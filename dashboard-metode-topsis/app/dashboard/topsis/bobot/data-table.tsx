"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getExpandedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Bobot, GroupedBobot } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Pencil, Trash2 } from "lucide-react";

interface DataTableProps {
  columns: ColumnDef<GroupedBobot, any>[];
  data: Bobot[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

// grouped data per criteria name
function groupedBobot(data: Bobot[]): GroupedBobot[] {
  const map: Record<string, Bobot[]> = {};
  data.forEach((b) => {
    if (!map[b.criteria_name]) map[b.criteria_name] = [];
    map[b.criteria_name].push(b);
  });
  return Object.values(map).map((list) => ({
    ...list[0],
    children: list,
  }));
}

export function DataTable({
  columns,
  data,
  total,
  page,
  limit,
  onPageChange,
}: DataTableProps) {
  const totalPages = Math.ceil(total / limit);
  const groupedData = useMemo(() => groupedBobot(data), [data]);
  const [criteriaList, setCriteriaList] = useState<
    { id: number; name: string }[]
  >([]);
  const [idCriteria, setIdCriteria] = useState<number>(0);
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number | null>(0);
  const [score, setScore] = useState<number>(1);
  const [loading, setLoading] = React.useState(false);

  // edit mode
  const [editData, setEditData] = useState<Bobot | null>(null);

  // modal open/close
  const [open, setOpen] = useState(false);

  const table = useReactTable({
    data: groupedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => !!row.original.children?.length,
  });

  type FormType = {
    id_criteria: string;
    min_value: string;
    max_value: string;
    score: string;
  };

  const defaultForm: FormType = {
    id_criteria: "",
    min_value: "",
    max_value: "",
    score: "",
  };

  const [form, setForm] = React.useState<FormType>(defaultForm);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchCriteria = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/topsis/criteria");
        const data = await res.json();
        setCriteriaList(data.data);
        if (data.data.length > 0) setIdCriteria(data.data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCriteria();
  }, []);

  const handleAddBobot = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id_criteria: idCriteria,
      min_value: minValue,
      max_value: maxValue,
      score,
    };
    try {
      const res = await fetch("http://localhost:3000/api/topsis/bobot", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        setForm(defaultForm);

        toast.success("Success add criteria", {
          icon: "✅",
          style: {
            background: "#fff",
            color: "#4ADE80",
          },
          duration: 5000,
        });

        // reset form jika perlu
        setMinValue(0);
        setMaxValue(null);
        setScore(1);
        setOpen(false);
      } else {
        console.log(res);
        toast.error("Failed to add alternavive", {
          icon: "❌",
          style: {
            background: "#fff",
            color: "#EF4444",
          },
          duration: 5000,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Gagal tambah bobot");
    }
  };

  const handleEditBobot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;

    const payload = {
      id_criteria: idCriteria,
      min_value: minValue,
      max_value: maxValue,
      score,
    };

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3000/api/topsis/bobot/${editData.id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.ok) {
        toast.success("Success update bobot", { icon: "✅" });
        resetForm();
      } else {
        toast.error("Failed to update bobot", { icon: "❌" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBobot = async (id: number) => {
    if (!confirm("Yakin hapus bobot ini?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/topsis/bobot/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Bobot berhasil dihapus", { icon: "✅" });
      } else {
        toast.error("Gagal hapus bobot", { icon: "❌" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // open Edit Bobot
  const handleOpenEdit = (bobot: Bobot) => {
    setEditData(bobot);
    setIdCriteria(bobot.id_criteria);
    setMinValue(bobot.min_value);
    setMaxValue(bobot.max_value);
    setScore(bobot.score);
    setOpen(true);
  };

  // reset form
  const resetForm = () => {
    setIdCriteria(criteriaList[0]?.id || 0);
    setMinValue(0);
    setMaxValue(null);
    setScore(1);
    setEditData(null);
    setOpen(false);
  };

  return (
    <div className="rounded-md border px-4">
      <div className="flex items-center py-4 gap-4">
        {/* Modal Tambah / Edit Bobot Criteria */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {/* <Button variant="default" className="ml-auto">
              Tambah Bobot
            </Button> */}
          </DialogTrigger>
          <DialogContent className="md-:max-w-[600px] sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                {editData ? "Edit Bobot" : "Tambah Bobot"}
              </DialogTitle>
              <DialogDescription>
                {editData
                  ? "You can edit bobot is here. click update to save your bobot."
                  : "You can save bobot is here. click save to save your bobot."}
              </DialogDescription>
            </DialogHeader>
            <DialogContent className="md:max-w-[600px] sm:max-w-[400px]">
              <form
                onSubmit={editData ? handleEditBobot : handleAddBobot}
                className="space-y-4"
              >
                <div className="grid gap-4 mb-4 sm:mb-5">
                  <div className="w-full">
                    <Label
                      htmlFor="kriteria"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Kriteria:
                    </Label>
                    <Select
                      value={idCriteria?.toString() || ""}
                      onValueChange={(value) => setIdCriteria(Number(value))}
                    >
                      <SelectTrigger className="w-full border p-2 rounded">
                        <SelectValue placeholder="Pilih Kriteria" />
                      </SelectTrigger>
                      <SelectContent>
                        {criteriaList.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full">
                    <Label
                      htmlFor="min_value"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Min Value:
                    </Label>
                    <Input
                      type="number"
                      value={minValue}
                      onChange={(e) => setMinValue(Number(e.target.value))}
                      placeholder="Insert your Min Value"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <Label
                      htmlFor="min_value"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Max Value (kosong = ∞):
                    </Label>
                    <Input
                      type="number"
                      value={maxValue === null ? "" : maxValue}
                      onChange={(e) =>
                        setMaxValue(
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                      placeholder="Insert your Max Value"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="max_value"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Score:
                    </Label>
                    <Select
                      value={score?.toString() || ""}
                      onValueChange={(value) => setScore(Number(value))}
                    >
                      <SelectTrigger className="w-full border p-2 rounded">
                        <SelectValue placeholder="Pilih Score" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <SelectItem key={s} value={s.toString()}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button disabled={loading}>
                    {loading ? "Loading..." : editData ? "Update" : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>

              {row.getIsExpanded() && (
                <TableRow key={`${row.id}-expended`}>
                  <TableCell colSpan={columns.length}>
                    <div className="p-2 border rounded-md bg-gray-50">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Min Value</TableHead>
                            <TableHead>Max Value</TableHead>
                            <TableHead>Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {row.original.children?.map((child) => (
                            <TableRow key={child.id}>
                              <TableCell>{Number(child.min_value)}</TableCell>
                              <TableCell>
                                {Number(child.max_value) ?? "∞"}
                              </TableCell>
                              <TableCell>
                                <Badge>{child.score}</Badge>
                              </TableCell>
                              <TableCell className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenEdit(child)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                {/* <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteBobot(child.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button> */}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          <p>
            Page {page} of {totalPages}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={data.length === 0}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
