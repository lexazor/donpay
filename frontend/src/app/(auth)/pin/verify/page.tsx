"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PinInput } from "@/components/pin-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-client";

export default function VerifyPinPage() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    if (pin.length !== 6) return toast.error("PIN harus 6 digit");
    setLoading(true);
    try {
      await apiRequest("/auth/verify-pin", { method: "POST", token: getAccessToken() ?? undefined, body: { pin } });
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PIN tidak valid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <Card className="rounded-3xl border-white/50 bg-white/90 shadow-xl">
          <CardHeader><CardTitle className="font-heading text-2xl">Masukkan PIN</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <PinInput value={pin} onChange={setPin} />
            <Button onClick={submit} disabled={loading} className="w-full rounded-2xl">{loading ? "Memverifikasi..." : "Konfirmasi PIN"}</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
