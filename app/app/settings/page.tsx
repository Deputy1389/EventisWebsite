"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [firmName, setFirmName] = useState<string>("");
  const [firmTier, setFirmTier] = useState<string>("starter");

  const fetchFirm = useCallback(async () => {
    try {
      let firmId = session?.user?.firmId;
      if (!firmId) {
        const firmsRes = await fetch("/api/citeline/firms");
        if (!firmsRes.ok) return;
        const firms = await firmsRes.json();
        if (!firms || firms.length === 0) return;
        firmId = firms[0].id;
      }
      const res = await fetch(`/api/citeline/firms/${firmId}`);
      if (res.ok) {
        const data = await res.json();
        setFirmName(data.name || "");
        setFirmTier(data.tier || "starter");
      }
    } catch {
      // ignore
    }
  }, [session?.user?.firmId]);

  useEffect(() => {
    void fetchFirm();
  }, [fetchFirm]);

  return (
    <div className="max-w-2xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Your account and firm details.</p>
      </header>

      <section className="bg-surface-dark border border-border-dark rounded-xl p-6 space-y-6">
        <h3 className="text-lg font-semibold text-white">Account</h3>
        <div className="grid gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</label>
            <p className="text-sm text-white mt-1">{session?.user?.name || "—"}</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</label>
            <p className="text-sm text-white mt-1">{session?.user?.email || "—"}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 bg-surface-dark border border-border-dark rounded-xl p-6 space-y-6">
        <h3 className="text-lg font-semibold text-white">Firm</h3>
        <div className="grid gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Firm Name</label>
            <p className="text-sm text-white mt-1">{firmName || "—"}</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan Tier</label>
            <p className="text-sm text-white mt-1 capitalize">{firmTier}</p>
          </div>
        </div>
      </section>

      <p className="mt-8 text-xs text-slate-600">
        Need to update your account details? Contact{" "}
        <a href="mailto:patrick@linecite.com" className="text-primary hover:underline">
          patrick@linecite.com
        </a>
      </p>
    </div>
  );
}
