"use client";

import { useActionState } from "react";
import { createPatientAction } from "@/app/actions/patients";
import { idleState } from "@/lib/action-state";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

export function PatientForm() {
  const [state, formAction] = useActionState(createPatientAction, idleState);

  return (
    <form action={formAction} className="space-y-4 px-5 py-5">
      {state.status === "success" && state.message ? (
        <Alert kind="success">{state.message}</Alert>
      ) : null}
      {state.status === "error" && state.message ? <Alert kind="error">{state.message}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nombre completo *"
          htmlFor="fullName"
          error={state.errors?.fullName}
          className="sm:col-span-2"
        >
          <input
            id="fullName"
            name="fullName"
            className={inputClass}
            placeholder="Ana María Rodríguez"
            required
          />
        </Field>

        <Field label="Documento de identidad" htmlFor="documentId" error={state.errors?.documentId}>
          <input id="documentId" name="documentId" className={inputClass} placeholder="1020304050" />
        </Field>

        <Field label="Fecha de nacimiento" htmlFor="birthDate" error={state.errors?.birthDate}>
          <input id="birthDate" name="birthDate" type="date" className={inputClass} />
        </Field>

        <Field label="Teléfono" htmlFor="phone" error={state.errors?.phone}>
          <input id="phone" name="phone" className={inputClass} placeholder="300 123 4567" />
        </Field>

        <Field label="Correo electrónico" htmlFor="email" error={state.errors?.email}>
          <input id="email" name="email" type="email" className={inputClass} placeholder="ana@correo.com" />
        </Field>

        <Field
          label="Dirección"
          htmlFor="address"
          error={state.errors?.address}
          className="sm:col-span-2"
        >
          <input id="address" name="address" className={inputClass} placeholder="Cra 45 # 12-34" />
        </Field>

        <Field label="Acudiente" htmlFor="guardianName" error={state.errors?.guardianName} hint="Para pacientes menores de edad.">
          <input id="guardianName" name="guardianName" className={inputClass} />
        </Field>

        <Field label="Teléfono del acudiente" htmlFor="guardianPhone" error={state.errors?.guardianPhone}>
          <input id="guardianPhone" name="guardianPhone" className={inputClass} />
        </Field>

        <Field
          label="Notas clínicas"
          htmlFor="notes"
          error={state.errors?.notes}
          className="sm:col-span-2"
        >
          <textarea id="notes" name="notes" rows={3} className={inputClass} placeholder="Alergias, antecedentes, observaciones…" />
        </Field>
      </div>

      <SubmitButton pendingLabel="Registrando…" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
        Registrar paciente
      </SubmitButton>
    </form>
  );
}
