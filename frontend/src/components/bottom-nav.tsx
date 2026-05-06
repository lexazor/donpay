"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CreditCard, Home, QrCode, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Beranda", href: "/dashboard", icon: Home },
  { label: "Keuangan", href: "/deposit", icon: CreditCard },
  { label: "Bayar", href: "/layanan", icon: QrCode, center: true },
  { label: "Notifikasi", href: "/riwayat", icon: Bell },
  { label: "Profil", href: "/profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-border/70 bg-white/90 px-3 py-2 backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-2xl p-2 text-[11px] text-muted-foreground transition",
                active && "text-primary",
                item.center && "-mt-5 rounded-3xl bg-primary p-3 text-primary-foreground shadow-lg",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
