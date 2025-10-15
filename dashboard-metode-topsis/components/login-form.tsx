"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setCookie } from "cookies-next";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Progress } from "./ui/progress";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modal, setModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      toast.error("Login failed", {
        description: "Please check your email dan password.",
        icon: "❌",
        style: {
          background: "#fff",
          color: "#EF4444",
        },
      });
      return;
    }

    const data = await res.json();
    setCookie("token", data.token, { maxAge: 60 * 60 * 24, path: "/" });

    setModal(true);

    setTimeout(() => {
      setProgress(25);
    }, 250);
    setTimeout(() => {
      setProgress(50);
    }, 500);
    setTimeout(() => {
      setProgress(75);
    }, 750);
    setTimeout(() => {
      setProgress(100);
    }, 1000);
  }

  useEffect(() => {
    if (progress === 100) {
      toast.success("Login successful", {
        icon: "✅",
        style: {
          background: "#fff",
          color: "#4ADE80",
        },
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    }
  }, [progress, router]);

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Masuk ke akun Anda</h1>
        {/* <p className="text-muted-foreground text-sm text-balance">
          Masukkan email Anda di bawah ini untuk masuk ke akun Anda.
        </p> */}
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            {/* <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a> */}
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Dialog open={modal}>
          <DialogContent
            className="max-w-md text-center space-y-4"
            aria-describedby=""
          >
            <DialogTitle className="text-lg font-semibold mb-4">
              Logging you in...
            </DialogTitle>
            <div>
              <p className="text-sm text-muted-foreground">{progress}</p>
              <Progress value={progress} className="h-2" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </form>
  );
}
