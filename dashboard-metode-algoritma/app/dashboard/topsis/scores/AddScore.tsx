"use client";

import { useEffect, useState } from "react";
import { CirclePlus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { truncate } from "@/lib/truncate";
import { Plus, Minus } from "lucide-react";
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
  criteria_id: number;
  value: string;
};

type CandidateForm = {
  candidate_id: number | null;
  scores: ScoreInput[];
};

export function AddScoreDialog() {
  const token = getCookie("token");
  const [candidates, setCandidates] = useState<Alternative[]>([]);
  const [criteriaList, setCriteriaList] = useState<Criteria[]>([]);
  const [formCandidates, setFormCandidates] = useState<CandidateForm[]>([]);

  useEffect(() => {
    // ambil data candidate
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    fetch("http://localhost:3000/api/topsis/alternative/all", { headers })
      .then((res) => res.json())
      .then((data) => {
        const candidateData = data;
        setCandidates(candidateData);
      });

    fetch("http://localhost:3000/api/topsis/criteria", { headers })
      .then((res) => res.json())
      .then((data) => {
        const criteriaData: Criteria[] = data.data;
        setCriteriaList(criteriaData);
      });
  }, []);

  const handleAddCandidate = () => {
    const newCandidate: CandidateForm = {
      candidate_id: null,
      scores: criteriaList.map((c) => ({ criteria_id: c.id, value: "" })),
    };
    setFormCandidates((prev) => [...prev, newCandidate]);
  };

  const handleRemoveCandidate = (index: number) => {
    setFormCandidates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChangeCandidate = (index: number, value: string) => {
    const id = parseInt(value);
    setFormCandidates((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, candidate_id: id } : item
      )
    );
  };

  const handleScoreChange = (
    candidateIndex: number,
    criteriaId: number,
    value: string
  ) => {
    setFormCandidates((prev) =>
      prev.map((candidate, i) =>
        i === candidateIndex
          ? {
              ...candidate,
              scores: candidate.scores.map((s) =>
                s.criteria_id === criteriaId ? { ...s, value } : s
              ),
            }
          : candidate
      )
    );
  };

  const handleAddScore = async () => {
    const payload = formCandidates.flatMap((candidate) =>
      candidate.scores.map((score) => ({
        candidate_id: candidate.candidate_id,
        criteria_id: score.criteria_id,
        value: parseFloat(score.value),
      }))
    );

    const res = await fetch("http://localhost:3000/api/topsis/scores", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success("Score success added", {
        style: {
          background: "#fff",
          color: "#4ADE80",
        },
        icon: "✅",
        duration: 3000,
      });
      setFormCandidates([]);
    } else {
      toast.error("Failed add score", {
        style: {
          background: "#fff",
          color: "#Ef4444",
        },
        icon: "❌",
        duration: 3000,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <CirclePlus /> Add Score
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[1200px] sm:max-w-[400px] md:max-h-full px-4">
        <DialogHeader>
          <DialogTitle>Add Score</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 overflow-y-auto max-h-64">
          {formCandidates.map((form, index) => (
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
                  onClick={() => handleRemoveCandidate(index)}
                >
                  <Minus className="w-4 h-4" />
                  Remove
                </Button>
              </div>

              <Select
                value={form.candidate_id?.toString() ?? ""}
                onValueChange={(val) => handleChangeCandidate(index, val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose Candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => (
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
                        form.scores.find((s) => s.criteria_id === c.id)
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
        <div className="flex justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddCandidate}
          >
            <Plus className="w-4 h-4" />
            Add Alternative
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={handleAddScore}>Save All</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
