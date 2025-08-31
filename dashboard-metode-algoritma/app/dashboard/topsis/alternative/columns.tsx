"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Alternative = {
  id: string;
  name: string;
};

export const columns: ColumnDef<Alternative>[] = [
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
    accessorKey: "id",
    header: "No",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const alternative = row.original;
      const [editModal, setEditModal] = useState(false);
      const [deleteModal, setDeleteModal] = useState(false);
      const [loading, setLoading] = useState(false);
      const [updateData, setUpdateData] = useState({
        name: alternative.name,
      });

      const router = useRouter();

      // update alternative
      const handleUpdate = async () => {
        setLoading(true);
        const token = getCookie("token");

        try {
          const res = await fetch(
            `http://localhost:3000/api/topsis/alternative/${alternative.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                ...updateData,
              }),
            }
          );

          if (res.ok) {
            router.refresh();
            setEditModal(false);
            toast.success("Alternative updated", {
              icon: "✅",
              duration: 3000,
              style: {
                background: "#fff",
                color: "#4ADE80",
              },
            });
          } else {
            const error = await res.json();
            toast.error(error.message, {
              icon: "❌",
              duration: 3000,
              style: {
                background: "#fff",
                color: "#EF4444",
              },
              description: "Failed to update Alternative",
            });
          }
        } catch (err) {
          console.error("Error updating alternative:", err);
        } finally {
          setLoading(false);
        }
      };

      const handleDelete = async () => {
        setLoading(true);
        const token = getCookie("token");
        try {
          const res = await fetch(
            `http://localhost:3000/api/topsis/alternative/${alternative.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.ok) {
            router.refresh();
            setDeleteModal(false);
            toast.success("Deleted alternative success", {
              icon: "✅",
              duration: 3000,
              style: {
                background: "#fff",
                color: "#4ADE80",
              },
            });
          }
        } catch (err) {
          console.error("error deleting alternative:", err);
        } finally {
          setLoading(false);
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(alternative.name)}
              >
                Copy alternative
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setUpdateData({
                    name: alternative.name,
                  });
                  setEditModal(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteModal(true)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={editModal} onOpenChange={setEditModal}>
            <DialogContent className="md:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Alternative</DialogTitle>
                <DialogDescription>
                  update alternative is here, click update to save change
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 mb-4 grid-cols-1 sm:mb-5">
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
                    value={updateData.name}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, name: e.target.value })
                    }
                    placeholder="Update name alternative in here"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdate} disabled={loading}>
                  {loading ? "Loading..." : "Update"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
            <DialogContent>
              <DialogHeader>Delete Alternative</DialogHeader>
              <DialogTitle>
                <DialogDescription>
                  are you sure you want to delete this <b>{alternative.name}</b>
                  ? This action cannot be undone.
                </DialogDescription>
              </DialogTitle>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setDeleteModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
