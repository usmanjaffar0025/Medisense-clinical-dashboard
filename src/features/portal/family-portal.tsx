"use client";

import { Lock, LogOut } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/sheet";
import { portalLogin } from "@/data/portal";
import { useDemoStore } from "@/state/demo-store";
import { FamilyView } from "./family-view";

export function SignIn() {
  const signIn = useDemoStore((s) => s.setFamilySignedIn);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const valid =
      email.trim().toLowerCase() === portalLogin.email && code.trim() === portalLogin.code;
    if (valid) signIn(true);
    else setError("That email and access code don't match. Check them and try again.");
  }

  return (
    <main className="hero-page flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-100 rounded-sheet border border-border bg-surface px-6 py-7 shadow-overlay">
        <p className="headline text-h2">Medisense</p>
        <h1 className="mt-5 headline text-h1">Family portal</h1>
        <p className="mt-1 text-small text-ink-700">
          See visits, home practice, goals and approved reports for your family member.
        </p>
        <form noValidate onSubmit={submit} className="mt-5 flex flex-col gap-4">
          <Field label="Email">
            <input
              type="email"
              autoComplete="off"
              className={inputClass}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
            />
          </Field>
          <Field label="Access code">
            <input
              type="password"
              autoComplete="off"
              className={inputClass}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
            />
          </Field>
          {error && (
            <p role="alert" className="text-small font-medium text-over">
              {error}
            </p>
          )}
          <Button variant="primary" type="submit">
            <Lock className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Sign in
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-caption">
          <button
            type="button"
            onClick={() => {
              setEmail(portalLogin.email);
              setCode(portalLogin.code);
              setError(null);
            }}
            className="cursor-pointer font-medium text-accent hover:text-accent-hover"
          >
            Use demo family details
          </button>
          <Link href="/" className="font-medium">
            Back to staff view
          </Link>
        </div>
      </div>
    </main>
  );
}

/** The family's own front door, separate from the staff product. */
export function FamilyPortal() {
  const signedIn = useDemoStore((s) => s.familySignedIn);
  const signOut = useDemoStore((s) => s.setFamilySignedIn);
  const hydrated = useSyncExternalStore(
    (notify) => useDemoStore.persist.onFinishHydration(notify),
    () => useDemoStore.persist.hasHydrated(),
    () => false,
  );

  if (!hydrated) return <div className="min-h-screen bg-canvas" />;
  if (!signedIn) return <SignIn />;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 md:px-6">
        <span className="headline text-h2">Medisense</span>
        <Button size="sm" onClick={() => signOut(false)}>
          <LogOut className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          Sign out
        </Button>
      </header>
      <main className="mx-auto max-w-280">
        <FamilyView />
      </main>
    </div>
  );
}
