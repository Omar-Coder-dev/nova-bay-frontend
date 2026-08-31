"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Mail, Loader2, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 antialiased">
      <Card className="w-full max-w-lg border-border bg-card shadow-2xl text-foreground backdrop-blur-md">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle
            className="text-3xl font-extrabold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            Forgot password?
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground font-medium">
            Enter your email and we&apos;ll send you a reset code
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-500 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-11 h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/30"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending code...
                </>
              ) : (
                <>
                  Send Reset Code
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border pt-5 bg-card rounded-b-xl">
          <p className="text-sm font-medium text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}