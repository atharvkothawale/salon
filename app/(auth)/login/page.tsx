"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginInput } from "@/schemas/auth";
import { loginUser } from "@/lib/actions/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setLoading(true);
    try {
      const res = await loginUser(data);
      if (res.error) {
        setServerError(res.error);
      } else {
        router.push("/appointments");
        router.refresh();
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md border-border">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="font-serif text-2xl font-semibold">Welcome Back</CardTitle>
        <CardDescription className="text-xs">
          Enter your email and password to access your salon appointments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-[11px] text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-[11px] text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" variant="accent" className="w-full font-semibold gap-2 mt-2" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-foreground hover:text-accent underline">
            Create account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
