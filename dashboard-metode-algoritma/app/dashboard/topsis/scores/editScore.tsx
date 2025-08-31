"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { truncate } from "@/lib/truncate";
import { Minus } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { getCookie } from "cookies-next";
import { toast } from "sonner";

type Alternative = {
  id: number;
  name: string;
};

type Criteria = {
  id: number;
  name: string;
};

type ScoreInput = {
  id: number;
  criteria_id: number;
  value: string;
};

export type AlternativeForm = {
  alternative_id: number | null;
  scores: ScoreInput[];
};

type EditScoreDialogProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  initialData: AlternativeForm[];
};

export function EditScoreDialog({
  open,
  onClose,
  initialData,
}: EditScoreDialogProps) {
  const token = getCookie("token");
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [criteriaList, setCriteriaList] = useState<Criteria[]>([]);
  const [formAlternatives, setFormAlternatives] = useState<AlternativeForm[]>(
    []
  );

  useEffect(() => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    fetch("http://localhost:3000/api/topsis/alternative/all", { headers })
      .then((res) => res.json())
      .then((data) => setAlternatives(data));

    fetch("http://localhost:3000/api/topsis/criteria", { headers })
      .then((res) => res.json())
      .then((data) => setCriteriaList(data.data));
  }, []);

  useEffect(() => {
    // Isi form dengan data awal saat component pertama kali mount
    if (
      initialData &&
      Array.isArray(initialData) &&
      initialData.length > 0 &&
      initialData[0].alternative_id != null
    ) {
      setFormAlternatives(
        initialData.map((alternative) => ({
          alternative_id: alternative.alternative_id,
          scores: alternative.scores ?? [],
        }))
      );
    }
  }, [initialData]);

  const handleScoreChange = (
    alternativeIndex: number,
    criteriaId: number,
    value: string
  ) => {
    setFormAlternatives((prev) =>
      prev.map((alternative, i) =>
        i === alternativeIndex
          ? {
              ...alternative,
              scores: alternative.scores.map((s) =>
                s.criteria_id === criteriaId ? { ...s, value } : s
              ),
            }
          : alternative
      )
    );
  };

  const handleRemoveAlternative = (index: number) => {
    setFormAlternatives((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateScore = async () => {
    const payload = formAlternatives.flatMap((alternative) =>
      alternative.scores.map((score) => ({
        id: score.id,
        alternative_id: alternative.alternative_id,
        criteria_id: score.criteria_id,
        value: parseFloat(score.value),
      }))
    );

    console.log(payload);

    const res = await fetch("http://localhost:3000/topsis/api/scores", {
      method: "PUT", // untuk update
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success("Score updated successfully", {
        style: { background: "#fff", color: "#4ADE80" },
        icon: "✅",
        duration: 3000,
      });
    } else {
      toast.error("Failed to update score", {
        style: { background: "#fff", color: "#EF4444" },
        icon: "❌",
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Edit Score
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[1200px] sm:max-w-[400px] md:max-h-full px-4">
        <DialogHeader>
          <DialogTitle>Edit Score</DialogTitle>
          <DialogDescription>
            Update nilai alternative berdasarkan criteria yang tersedia.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 overflow-y-auto max-h-64">
          {formAlternatives.map((form, index) => (
            <div
              className="border p-4 rounded-md space-y-4 bg-muted/30"
              key={index}
            >
              <div className="flex justify-between items-center">
                <Label>Alternative #{index + 1}</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveAlternative(index)}
                >
                  <Minus className="w-4 h-4" />
                  Remove
                </Button>
              </div>

              <Select disabled value={form.alternative_id?.toString() ?? ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose Alternative" />
                </SelectTrigger>
                <SelectContent>
                  {alternatives.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {criteriaList.map((c) => (
                  <div key={c.id} className="space-y-4">
                    <Label>{truncate(c.name, 25)}</Label>
                    <Input
                      type="number"
                      value={
                        form.scores?.find((s) => s.criteria_id === c.id)
                          ?.value ?? ""
                      }
                      onChange={(e) =>
                        handleScoreChange(index, c.id, e.target.value)
                      }
                      placeholder={`Value for ${c.name}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleUpdateScore}>Update Scores</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
