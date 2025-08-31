"use client";

import * as React from "react";
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
  Table as TableType,
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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Import, Trash2 } from "lucide-react";
import { AddScoreDialog } from "./addScore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Spinner from "@/components/spinner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total: number;
  page: number;
  limit: number;
  rowSelection: any;
  setRowSelection: React.Dispatch<React.SetStateAction<any>>;
  isLoading: boolean;
  onDelete: (ids: number[]) => void;
  onPageChange: (page: number) => void;
  onTableReady?: (table: TableType<TData>) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total,
  page,
  limit,
  onDelete,
  isLoading,
  onPageChange,
  onTableReady,
  rowSelection,
  setRowSelection,
}: DataTableProps<TData, TValue>) {
  const totalPages = Math.ceil(total / limit);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [file, setFile] = React.useState<File | null>(null);
  const [openImport, setOpenImport] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const selectedCounts = Object.keys(rowSelection).length;
  const [showSpinner, setShowSpinner] = React.useState(true);
  const router = useRouter();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    manualPagination: false,
  });

  React.useEffect(() => {
    if (onTableReady) {
      onTableReady(table);
    }
  }, [onTableReady, table]);

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImportAlternative = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "http://localhost:3000/api/saw/scores/import-scores-alternatives",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      //console.log("import count data", data);

      if (res.ok) {
        toast.dismiss();
        toast.success(`Berhasil import ${data.alternatives} data`, {
          style: {
            background: "#fff",
            color: "#4ADE80",
          },
          icon: "✅",
          duration: 3000,
        });
      } else {
        toast.dismiss();
        toast.error(`Gagal import: ${data.message || "unknown error"}`, {
          style: {
            background: "#fff",
            color: "#EF4444",
          },
          icon: "❌",
          duration: 3000,
        });
      }

      setOpenImport(false);
    } catch (err) {
      toast.dismiss();
      toast.error("Error upload file", {
        style: {
          background: "#fff",
          color: "#EF4444",
        },
        icon: "❌",
        duration: 3000,
      });
    }
  };

  const handleDelete = (ids: number[]) => {
    onDelete(selectedIds);
  };

  React.useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowSpinner(false), 500); // min 500ms
      return () => clearTimeout(timer);
    } else {
      setShowSpinner(true);
    }
  }, [isLoading]);

  if (isLoading) {
    <div className="h-[200px] flex items-center justify-center">
      <Spinner />
    </div>;
  }

  return (
    <div className="rounded-md border px-4">
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
        <Dialog open={openImport} onOpenChange={setOpenImport}>
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-left">
              <Import /> Import
            </Button>
          </DialogTrigger>
          <DialogContent className="md:max-w-[600px] sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Import Scores</DialogTitle>
              <DialogDescription>
                Import file data scores is here, click button save if done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 mb-4 sm:mb-5">
              <div className="w-full">
                <Label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  File
                </Label>
                <Input
                  id="nama"
                  type="file"
                  name="file"
                  onChange={handleChangeFile}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleImportAlternative} disabled={loading}>
                {loading ? "Loading..." : "Import"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {selectedCounts > 0 && (
          <Button
            variant="destructive"
            onClick={() => handleDelete(selectedIds)}
          >
            <Trash2 /> Hapus {selectedCounts} Data
          </Button>
        )}
        <AddScoreDialog />
      </div>
      <div className="rounded-md border overflow-x-auto">
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
                <TableRow key={row.id}>
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
                <TableCell colSpan={columns.length} className="text-center">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Navigasi Halaman */}
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
