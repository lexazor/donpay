"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

const registerSchema = z
  .object({
    fullName: z.string().min(3, "Nama wajib diisi"),
    whatsapp: z.string().regex(/^\+62\d{8,13}$/, "Format WA wajib +62"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(8),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);
    try {
      await apiRequest<{ userId: string; username: string }>("/auth/register", {
        method: "POST",
        body: {
          fullName: values.fullName,
          whatsapp: values.whatsapp,
          email: values.email,
          password: values.password,
        },
      });
      toast.success("Registrasi berhasil, silakan login");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal registrasi");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <Card className="rounded-3xl border-white/50 bg-white/95 shadow-xl">
          <CardHeader><CardTitle className="font-heading text-2xl">Buat Akun</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Nama lengkap" {...form.register("fullName")} />
            <Input placeholder="Nomor WhatsApp (+62)" {...form.register("whatsapp")} />
            <Input placeholder="Email" {...form.register("email")} />
            <Input type="password" placeholder="Password" {...form.register("password")} />
            <Input type="password" placeholder="Konfirmasi Password" {...form.register("confirmPassword")} />
            <Button onClick={onSubmit} disabled={loading} className="h-11 w-full rounded-2xl">{loading ? "Memproses..." : "Daftar"}</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
