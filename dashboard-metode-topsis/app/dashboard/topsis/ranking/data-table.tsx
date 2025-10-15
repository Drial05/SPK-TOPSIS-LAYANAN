"use client";

import { CircleAlert, FileDown } from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total,
  page,
  limit,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const totalPages = Math.ceil(total / limit);

  // state react-table
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // state topsis
  const [open, setOpen] = useState(false);
  const [topsisData, setTopsisData] = useState<any>(null);
  const [calculated, setCalculated] = useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    manualPagination: false,
  });

  // export hasil topsis
  const handleExportResults = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/topsis/results/export-topsis-results",
        { method: "GET" }
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "result-calculation-topsis";
        document.body.appendChild(a);
        a.click();

        a.remove();
        window.URL.revokeObjectURL(url);

        toast.success("File berhasil diunduh", {
          style: { background: "#fff", color: "#4ADE80" },
          icon: "✅",
          duration: 3000,
        });
      } else {
        toast.error("Gagal mengunduh file", {
          style: { background: "#fff", color: "#EF4444" },
          icon: "❌",
          duration: 3000,
        });
      }
    } catch (err) {
      toast.error("Error saat mengunduh file", {
        style: { background: "#fff", color: "#EF4444" },
        icon: "❌",
        duration: 3000,
      });
    }
  };

  // hitung topsis
  const calculateTopsis = async () => {
    try {
      toast.dismiss();
      toast.loading("Menghitung TOPSIS...", { duration: 2000 });

      const res = await fetch("http://localhost:3000/api/topsis/calculate");
      const data = await res.json();

      if (!res.ok) throw new Error("Gagal menghitung TOPSIS");

      setTopsisData(data);
      setCalculated(true);

      toast.dismiss();
      toast.success("Perhitungan TOPSIS selesai", {
        icon: "✅",
        duration: 3000,
        style: { background: "#fff", color: "#4ADE80" },
      });
    } catch (err) {
      toast.error("Gagal menghitung TOPSIS", {
        style: { background: "#fff", color: "#EF4444" },
        icon: "❌",
        duration: 3000,
      });
      console.error(err);
    }
  };

  return (
    <div>
      {/* --- Toolbar --- */}
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Filter alternative name..."
          value={
            (table.getColumn("alternative_name")?.getFilterValue() as string) ??
            ""
          }
          onChange={(e) =>
            table.getColumn("alternative_name")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" onClick={handleExportResults}>
          <FileDown className="mr-2 h-4 w-4" /> Exports
        </Button>

        <Button variant="outline" onClick={calculateTopsis}>
          Hitung
        </Button>

        {/* muncul hanya kalau sudah dihitung */}
        {calculated && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <CircleAlert className="mr-2 h-4 w-4" /> Lihat Proses
              </Button>
            </DialogTrigger>
            <DialogContent className="md:max-w-[1000px] sm:max-w-[400px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Hasil Perhitungan TOPSIS</DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="trace" className="w-full mt-2">
                <TabsList>
                  <TabsTrigger value="trace">Trace</TabsTrigger>
                </TabsList>

                <TabsContent value="trace">
                  {topsisData?.trace ? (
                    <div className="space-y-8">
                      {/* Criteria */}
                      <div>
                        <h3 className="font-semibold mb-2">
                          Kriteria (Ternormalisasi)
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Nama</TableHead>
                              <TableHead>Bobot</TableHead>
                              <TableHead>Atribut</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topsisData.trace.criteriaNormalized.map(
                              (c: any) => (
                                <TableRow key={c.id}>
                                  <TableCell>{c.id}</TableCell>
                                  <TableCell>{c.name}</TableCell>
                                  <TableCell>{c.weight}</TableCell>
                                  <TableCell>{c.attribute}</TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Matriks Keputusan */}
                      <div>
                        <h3 className="font-semibold mb-2">
                          Matriks Keputusan
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {topsisData.trace.criteriaNormalized.map(
                                (c: any) => (
                                  <TableHead key={c.id}>{c.name}</TableHead>
                                )
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topsisData.trace.decisionMatrix.map(
                              (row: number[], i: number) => (
                                <TableRow key={i}>
                                  {row.map((val: number, j: number) => (
                                    <TableCell key={j}>{val}</TableCell>
                                  ))}
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Normalisasi */}
                      <div>
                        <h3 className="font-semibold mb-2">Normalisasi</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {topsisData.trace.criteriaNormalized.map(
                                (c: any) => (
                                  <TableHead key={c.id}>{c.name}</TableHead>
                                )
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topsisData.trace.normalizedMatrix.map(
                              (row: number[], i: number) => (
                                <TableRow key={i}>
                                  {row.map((val: number, j: number) => (
                                    <TableCell key={j}>
                                      {val.toFixed(4)}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Matriks Ternormalisasi Terbobot */}
                      <div>
                        <h3 className="font-semibold mb-2">
                          Matriks Ternormalisasi Terbobot
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {topsisData.trace.criteriaNormalized.map(
                                (c: any) => (
                                  <TableHead key={c.id}>{c.name}</TableHead>
                                )
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topsisData.trace.weightedMatrix.map(
                              (row: number[], i: number) => (
                                <TableRow key={i}>
                                  {row.map((val: number, j: number) => (
                                    <TableCell key={j}>
                                      {val.toFixed(4)}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Solusi Ideal */}
                      <div>
                        <h3 className="font-semibold mb-2">Solusi Ideal (+)</h3>
                        <div className="flex gap-2 flex-wrap">
                          {topsisData.trace.idealPositive.map(
                            (val: number, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-green-100 rounded text-xs"
                              >
                                {val.toFixed(4)}
                              </span>
                            )
                          )}
                        </div>
                        <h3 className="font-semibold mt-4 mb-2">
                          Solusi Ideal (-)
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                          {topsisData.trace.idealNegative.map(
                            (val: number, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-red-100 rounded text-xs"
                              >
                                {val.toFixed(4)}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p>Tidak ada data trace</p>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* --- Table Data --- */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- Pagination --- */}
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
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={data.length === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
