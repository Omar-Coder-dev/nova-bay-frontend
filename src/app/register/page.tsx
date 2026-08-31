"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import GoogleLoginButton from "@/components/layout/GoogleLoginButton";

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
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", { name, email, password });
      setUser(response.data);
      router.push("/");
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
            Create your account
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground font-medium">
            Join Nova Bay and start shopping
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <GoogleLoginButton />

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-card px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Or continue with
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-500 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-11 h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border pt-5 bg-card rounded-b-xl">
          <p className="text-sm font-medium text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}