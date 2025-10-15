"use client";

import { ColumnDef } from "@tanstack/react-table";
import { GroupedBobot } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export const columns: ColumnDef<GroupedBobot>[] = [
  {
    accessorKey: "criteria_name",
    header: "Kriteria",
    cell: ({ row }) => {
      // ambil state expanded dari row
      const isExpanded = row.getIsExpanded();
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={row.getToggleExpandedHandler()}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          <span>{row.original.criteria_name}</span>
        </div>
      );
    },
  },
  // {
  //   accessorKey: "criteria_weight",
  //   header: "Weight",
  //   cell: ({ row }) => <div>{row.original.criteria_weight}</div>,
  // },
  // {
  //   accessorKey: "criteria_attribute",
  //   header: "Attribute",
  //   cell: ({ row }) => <div>{row.original.criteria_attribute}</div>,
  // },
  // {
  //   id: "actions",
  //   header: "Action",
  //   cell: () => <span>-</span>,
  // },
];
