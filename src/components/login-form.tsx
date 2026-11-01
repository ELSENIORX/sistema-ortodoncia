"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { idleState } from "@/lib/action-state";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, idleState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "error" && state.message ? <Alert kind="error">{state.message}</Alert> : null}

      <Field label="Correo electrónico" htmlFor="email" error={state.errors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue="admin@ortodoncia.co"
          className={inputClass}
          required
        />
      </Field>

      <Field label="Contraseña" htmlFor="password" error={state.errors?.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className={inputClass}
          required
        />
      </Field>

      <SubmitButton pendingLabel="Ingresando…" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
        Ingresar
      </SubmitButton>
    </form>
  );
}
