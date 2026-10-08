"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, MapPin, Loader2, Save } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [name, setName] = useState(user?.name || "");
  const [address, setAddress] = useState(user?.address || "");
  const [saving, setSaving] = useState(false);

  // Safely redirect on client-side only when unauthenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Keep local state in sync if store user loads asynchronously
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAddress(user.address || "");
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.patch("/users/profile", { name, address });
      setUser({ ...user, ...response.data });
      toast.success("Profile updated.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-3xl font-bold text-foreground">My Profile</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-border bg-card p-6"
        >
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Email
            </Label>
            <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-xs font-bold uppercase tracking-wider text-foreground"
            >
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-11 h-12 bg-muted border-border text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-xs font-bold uppercase tracking-wider text-foreground"
            >
              Default Shipping Address
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="Street, city, country..."
                className="w-full resize-none rounded-lg border border-border bg-muted py-3 pl-11 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This won&apos;t auto-fill at checkout yet — you&apos;ll still type
              your address there each time.
            </p>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold"
          >
            {saving ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}