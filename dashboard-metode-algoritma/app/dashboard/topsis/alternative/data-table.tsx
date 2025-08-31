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
import { Columns2, Import, CirclePlus, Trash2 } from "lucide-react";
import { getCookie } from "cookies-next";
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total: number;
  page: number;
  limit: number;
  rowSelection: any;
  setRowSelection: React.Dispatch<React.SetStateAction<any>>;
  onPageChange: (page: number) => void;
  onTableReady?: (table: TableType<TData>) => void;
  onDelete: (ids: number[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total,
  page,
  limit,
  onPageChange,
  onTableReady,
  rowSelection,
  setRowSelection,
  onDelete,
}: DataTableProps<TData, TValue>) {
  const totalPages = Math.ceil(total / limit);
  const [sorting, setSorting] = React.useState<SortingState>([]);
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

  type FormType = {
    name: string;
  };

  const defaultForm: FormType = {
    name: "",
  };

  const [form, setForm] = React.useState<FormType>(defaultForm);
  const [modalAdd, setModalAdd] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [openImport, setOpenImport] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const selectedCounts = Object.keys(rowSelection).length;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const token = getCookie("token");

    const payload = {
      name: form.name,
    };

    const res = await fetch("http://localhost:3000/api/topsis/alternative", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setForm(defaultForm);

      toast.success("Success add alternative", {
        icon: "✅",
        style: {
          background: "#fff",
          color: "#4ADE80",
        },
        duration: 5000,
      });

      setModalAdd(false);
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
    setLoading(false);
  };

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    const token = getCookie("token");

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "http://localhost:3000/api/topsis/alternative/import",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success(`Behasil import ${data.count} data`, {
          style: {
            background: "#fff",
            color: "#4ADE80",
          },
          icon: "✅",
          duration: 3000,
        });
      } else {
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

  return (
    <div className="rounded-md border px-4">
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Filter name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-left">
              <Columns2 /> Columns
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
        {/* Modal import customer */}
        {/* <Dialog open={openImport} onOpenChange={setOpenImport}>
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-left">
              <Import /> Import
            </Button>
          </DialogTrigger>
          <DialogContent className="md:max-w-[600px] sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Import Alternative</DialogTitle>
              <DialogDescription>
                Import file data alternative is here, click button save if done.
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
              <Button onClick={handleImport} disabled={loading}>
                {loading ? "Loading..." : "Import"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog> */}
        {/* Modal add alternatif */}
        {selectedCounts > 0 && (
          <Button
            variant="destructive"
            onClick={() => handleDelete(selectedIds)}
          >
            <Trash2 /> Hapus {selectedCounts} Data
          </Button>
        )}
        <Dialog open={modalAdd} onOpenChange={setModalAdd}>
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <CirclePlus /> Add Alternative
            </Button>
          </DialogTrigger>
          <DialogContent className="md:max-w-[600px] sm:max-w-[400px]">
            <form action={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Alternative</DialogTitle>
                <DialogDescription>
                  You can add alternative is here. clicl save to save your
                  alternative.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 mb-4 sm:mb-5">
                <div className="w-full">
                  <Label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Insert your name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button disabled={loading}>
                  {loading ? "Loading..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
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
