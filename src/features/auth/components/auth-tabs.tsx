"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

export function AuthTabs() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {(
          [
            { id: "login", label: "เข้าสู่ระบบ" },
            { id: "register", label: "สมัครสมาชิก" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition",
              tab === item.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
