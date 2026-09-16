"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <ThemeToggle />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Hindi Pa Naka-setup ang Supabase</CardTitle>
            <CardDescription>
              Ilagay ang Supabase credentials sa .env.local, o subukan muna ang
              demo mode.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/dashboard">Magpatuloy sa Demo Mode</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Bumalik sa Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      toast.success(
        "Welcome! 3 araw free trial — pwede ka nang mag-POS at inventory."
      );
      router.push("/dashboard");
      router.refresh();
      return;
    }

    toast.success("Account created! Pwede ka nang mag-login.");
    router.push("/auth/login");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-500/20 via-indigo-500/10 to-transparent blur-3xl" />
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex justify-center">
            <BrandLogo size="lg" />
          </Link>
          <CardTitle className="text-2xl">Gumawa ng account</CardTitle>
          <CardDescription>
            3 araw free trial — walang email confirm. Simula ₱100/buwan pagkatapos.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Buong Pangalan</Label>
              <Input
                id="fullName"
                placeholder="Juan Dela Cruz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Gumawa ng Account"
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              May account ka na?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-indigo-500 hover:underline"
              >
                Mag-login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
