"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  UserCog,
  Warehouse,
  Users,
  X,
} from "lucide-react";

import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "ภาพรวม",
    links: [
      { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
      { href: "/reports", label: "รายงาน", icon: BarChart3 },
    ],
  },
  {
    label: "ข้อมูลหลัก",
    links: [
      { href: "/products", label: "สินค้า", icon: Package },
      { href: "/customers", label: "ลูกค้า", icon: Users },
      { href: "/suppliers", label: "ผู้ขาย", icon: Truck },
      { href: "/branches", label: "สาขา", icon: Building2 },
      { href: "/warehouses", label: "คลังสินค้า", icon: Warehouse },
    ],
  },
  {
    label: "ปฏิบัติการ",
    links: [
      { href: "/inventory", label: "สต็อกสินค้า", icon: Boxes },
      { href: "/sales", label: "ขาย", icon: ShoppingCart },
      { href: "/purchases", label: "จัดซื้อ", icon: ClipboardList },
      { href: "/invoices", label: "ใบแจ้งหนี้", icon: FileText },
    ],
  },
  {
    label: "ระบบ",
    links: [
      { href: "/settings", label: "ตั้งค่าบริษัท", icon: Settings },
      { href: "/users", label: "ผู้ใช้และสิทธิ์", icon: UserCog },
    ],
  },
];

export function AppShell({
  children,
  companyName,
  userName,
  email,
  role,
}: {
  children: React.ReactNode;
  companyName: string;
  userName: string;
  email: string;
  role: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-slate-200 p-3">
      <div className="rounded-lg bg-slate-50 px-3 py-2">
        <p className="truncate text-sm font-medium text-slate-800">
          {userName}
        </p>
        <p className="truncate text-xs text-slate-500">{email}</p>
        <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
          {role}
        </p>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            M
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              MiniERP
            </p>
            <p className="truncate text-xs text-slate-500">{companyName}</p>
          </div>
        </div>
        {navigation}
        {footer}
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            M
          </span>
          <span className="text-sm font-semibold">MiniERP</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
              <span className="text-sm font-semibold">เมนู</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {navigation}
            {footer}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
