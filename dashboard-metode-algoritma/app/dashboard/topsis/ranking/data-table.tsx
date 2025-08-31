"use client";

import { FileDown } from "lucide-react";
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
import { getCookie } from "cookies-next";
import { toast } from "sonner";

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

  const handleExportResults = async () => {
    // const token = getCookie("token");

    try {
      const res = await fetch(
        "http://localhost:3000/api/topsis/results/export-topsis-results",
        {
          method: "GET",
        }
      );

      if (res.ok) {
        // ambil file sebagai blob
        const blob = await res.blob();

        // buat url sementara untuk blob
        const url = window.URL.createObjectURL(blob);

        // buat link download dan klik otomatis
        const a = document.createElement("a");
        a.href = url;
        a.download = "result-calculation-topsis";
        document.body.appendChild(a);
        a.click();

        // gapus elemen dan revoke url
        a.remove();
        window.URL.revokeObjectURL(url);

        toast.success("File success in download", {
          style: {
            background: "#fff",
            color: "#4ADE80",
          },
          icon: "✅",
          duration: 3000,
        });
      } else {
        toast.error("Failed to donwload", {
          style: {
            background: "#fff",
            color: "#EF4444",
          },
          icon: "❌",
          duration: 3000,
        });
      }
    } catch (err) {
      toast.error("Error to download", {
        style: {
          background: "#fff",
          color: "#EF4444",
        },
        icon: "❌",
        duration: 3000,
      });
    }
  };

  // panggil api getTopsis sekali sudah selesai
  const calculateTopsis = async () => {
    try {
      toast.dismiss();
      toast.loading("Menghitung Topsis...", {
        duration: 2000,
        action: {
          label: "Close",
          onClick: () => {
            toast.dismiss(); // atau toast.dismiss(toastId) jika ingin dismiss toast tertentu
          },
        },
      });
      const token = getCookie("token");
      const res = await fetch("http://localhost:3000/api/topsis/calculate", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal menghitung TOPSIS");

      toast.dismiss();
      toast.success("Perhitungan Topsis selesai", {
        icon: "✅",
        duration: 3000,
        style: {
          background: "#fff",
          color: "#4ADE80",
        },
      });
    } catch (err) {
      toast.error("Gagal menghitung TOPSIS", {
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

  return (
    <div>
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Filter alternative name..."
          value={
            (table.getColumn("alternative_name")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("alternative_name")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-left">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <Button
            variant="outline"
            className="ml-left"
            onClick={handleExportResults}
          >
            <FileDown />
            Exports
          </Button>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" className="ml-left" onClick={calculateTopsis}>
          Hitung
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
