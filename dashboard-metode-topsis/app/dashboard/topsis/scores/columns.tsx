import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditScoreDialog, AlternativeForm } from "../scores/editScore";
import { useState } from "react";

type ScoreRow = {
  id: number;
  alternative_id: number;
  name: string;
  scores: { criteria_id: number; value: string }[];
};

export const generateColumns = (
  criteriaNames: string[],
  handleEdit: (alternative_id: number) => void
): ColumnDef<any>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "alternative_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Alternative
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  ...criteriaNames.map((name) => {
    // deteksi kolom currency
    const isCurrency = [
      "rata-rata nominal transaksi",
      "biaya transaksi",
    ].includes(name.toLowerCase());

    // ubah huruf pertama jadi kapital
    const headerLabel = name.charAt(0).toUpperCase() + name.slice(1);

    return {
      accessorKey: name,
      header: headerLabel,
      cell: ({ row }: { row: Row<any> }) => {
        const value = row.getValue(name);
        if (isCurrency) {
          return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(Number(value) || 0);
        }
        return value;
      },
    };
  }),
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuItem
  //             onClick={() => navigator.clipboard.writeText(row.original.name)}
  //           >
  //             Copy alternative name
  //           </DropdownMenuItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem
  //             onClick={() => handleEdit(row.original.alternative_id)}
  //           >
  //             Edit
  //           </DropdownMenuItem>
  //           <DropdownMenuItem>Delete</DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];
