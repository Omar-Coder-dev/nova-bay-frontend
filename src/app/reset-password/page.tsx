"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/reset-password", { email, otp, newPassword });
      setSuccess(true);

      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg border-border bg-card shadow-2xl text-foreground backdrop-blur-md">
      <CardHeader className="space-y-1 text-center pb-6">
        <CardTitle
          className="text-3xl font-extrabold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Reset password
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground font-medium">
          Enter the code we sent to your email
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {success ? (
          <div className="rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-500 font-medium text-center">
            Password reset successful! Redirecting you to sign in...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-500 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-11 h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                  value={email}
                  disabled
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="otp"
                className="text-xs font-bold uppercase tracking-wider text-foreground"
              >
                6-Digit Code
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  className="pl-11 h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500 tracking-[0.3em]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-xs font-bold uppercase tracking-wider text-foreground"
              >
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
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
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border pt-5 bg-card rounded-b-xl">
        <p className="text-sm font-medium text-muted-foreground">
          Didn&apos;t get a code?{" "}
          <Link
            href="/forgot-password"
            className="font-bold text-blue-600 hover:text-blue-500 hover:underline"
          >
            Request again
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 antialiased">
      <Suspense
        fallback={<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}