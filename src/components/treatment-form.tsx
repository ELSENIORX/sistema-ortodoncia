"use client";

import { useActionState } from "react";
import { createTreatmentAction } from "@/app/actions/treatments";
import { idleState } from "@/lib/action-state";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { treatmentTypeLabels, treatmentTypes } from "@/lib/labels";

export function TreatmentForm({ patientId, today }: { patientId: string; today: string }) {
  const [state, formAction] = useActionState(createTreatmentAction, idleState);

  return (
    <form action={formAction} className="space-y-4 px-5 py-5">
      {state.status === "success" && state.message ? (
        <Alert kind="success">{state.message}</Alert>
      ) : null}
      {state.status === "error" && state.message ? <Alert kind="error">{state.message}</Alert> : null}

      <input type="hidden" name="patientId" value={patientId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de tratamiento *" htmlFor="type" error={state.errors?.type}>
          <select id="type" name="type" className={inputClass} defaultValue="BRACKETS_METALICOS">
            {treatmentTypes.map((type) => (
              <option key={type} value={type}>
                {treatmentTypeLabels[type]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Valor total (COP)" htmlFor="totalPrice" error={state.errors?.totalPrice}>
          <input
            id="totalPrice"
            name="totalPrice"
            type="number"
            min={0}
            step={1000}
            className={inputClass}
            placeholder="3500000"
          />
        </Field>

        <Field label="Fecha de inicio *" htmlFor="startedAt" error={state.errors?.startedAt}>
          <input
            id="startedAt"
            name="startedAt"
            type="date"
            className={inputClass}
            defaultValue={today}
            required
          />
        </Field>

        <Field
          label="Fin estimado"
          htmlFor="estimatedEndAt"
          error={state.errors?.estimatedEndAt}
          hint="Opcional"
        >
          <input id="estimatedEndAt" name="estimatedEndAt" type="date" className={inputClass} />
        </Field>

        <Field
          label="Notas del tratamiento"
          htmlFor="treatmentNotes"
          error={state.errors?.notes}
          className="sm:col-span-2"
        >
          <textarea id="treatmentNotes" name="notes" rows={2} className={inputClass} />
        </Field>
      </div>

      <SubmitButton pendingLabel="Registrando…">Registrar tratamiento</SubmitButton>
    </form>
  );
}
