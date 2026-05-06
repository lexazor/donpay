"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { setAccessToken } from "@/lib/auth-client";

const loginSchema = z.object({
  identifier: z.string().min(4, "Email/WA wajib diisi"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);
    try {
      const res = await apiRequest<{ accessToken: string; isPinSet: boolean }>("/auth/login", {
        method: "POST",
        body: values,
      });
      setAccessToken(res.accessToken);
      router.push(res.isPinSet ? "/pin/verify" : "/pin/setup");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <Card className="rounded-3xl border-white/40 bg-white/90 shadow-xl backdrop-blur">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Masuk ke DonPay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative"><Mail className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Email atau WhatsApp (+62...)" {...form.register("identifier")} /></div>
            <div className="relative"><Lock className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input className="pl-9" type="password" placeholder="Password" {...form.register("password")} /></div>
            <Button onClick={onSubmit} disabled={loading} className="h-11 w-full rounded-2xl">{loading ? "Memproses..." : "Login"}</Button>
            <p className="text-center text-sm text-muted-foreground">Belum punya akun? <Link href="/register" className="text-primary">Daftar</Link></p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
