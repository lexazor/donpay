"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownToLine, History, Wallet } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-client";

type Category = { id: string; name: string; logo: string; badge: string | null };
type Profile = { fullName: string; balance: number | string };

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    void Promise.all([
      apiRequest<Profile>("/user/profile", { token }),
      apiRequest<Category[]>("/categories"),
    ]).then(([p, c]) => {
      setProfile(p);
      setCategories(c);
    });
  }, []);

  return (
    <>
      <AppShell>
        <motion.section initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", damping: 16 }}>
          <Card className="rounded-3xl border-white/50 bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 p-5 text-white shadow-xl">
            <div className="mb-3 flex items-center gap-2 text-sm"><Wallet className="size-4" />Saldo Kamu</div>
            {profile ? <p className="font-heading text-3xl">{rupiah.format(Number(profile.balance))}</p> : <Skeleton className="h-10 w-44 bg-white/20" />}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="secondary" className="rounded-2xl"><ArrowDownToLine />Deposit</Button>
              <Button variant="secondary" className="rounded-2xl"><History />Riwayat</Button>
            </div>
          </Card>
        </motion.section>
        <section>
          <h2 className="mb-3 font-heading text-lg">Kategori Layanan</h2>
          <div className="grid grid-cols-3 gap-3">
            {categories.length === 0
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-3xl" />)
              : categories.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-3xl border bg-white p-3 text-center text-sm shadow-sm">
                    {item.name}
                  </motion.div>
                ))}
          </div>
        </section>
      </AppShell>
      <BottomNav />
    </>
  );
}
