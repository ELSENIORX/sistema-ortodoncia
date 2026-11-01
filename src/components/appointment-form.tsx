"use client";

import { useActionState } from "react";
import { createAppointmentAction } from "@/app/actions/appointments";
import { idleState } from "@/lib/action-state";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { appointmentTypeLabels, appointmentTypes } from "@/lib/labels";

type Option = { id: string; name: string };

export function AppointmentForm({
  patients,
  professionals,
  defaultStartsAt,
  defaultPatientId,
}: {
  patients: Option[];
  professionals: { id: string; name: string }[];
  defaultStartsAt: string;
  defaultPatientId?: string;
}) {
  const [state, formAction] = useActionState(createAppointmentAction, idleState);

  return (
    <form action={formAction} className="space-y-4 px-5 py-5">
      {state.status === "success" && state.message ? (
        <Alert kind="success">{state.message}</Alert>
      ) : null}
      {state.status === "error" && state.message ? <Alert kind="error">{state.message}</Alert> : null}

      <Field label="Paciente" htmlFor="patientId" error={state.errors?.patientId}>
        <select
          id="patientId"
          name="patientId"
          className={inputClass}
          defaultValue={defaultPatientId ?? ""}
          required
        >
          <option value="" disabled>
            Selecciona un paciente
          </option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Profesional" htmlFor="orthodontistId" error={state.errors?.orthodontistId}>
        <select id="orthodontistId" name="orthodontistId" className={inputClass} required>
          {professionals.map((professional) => (
            <option key={professional.id} value={professional.id}>
              {professional.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo de cita" htmlFor="type" error={state.errors?.type}>
          <select id="type" name="type" className={inputClass} defaultValue="CONTROL">
            {appointmentTypes.map((type) => (
              <option key={type} value={type}>
                {appointmentTypeLabels[type]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Duración" htmlFor="durationMin" error={state.errors?.durationMin}>
          <select id="durationMin" name="durationMin" className={inputClass} defaultValue="40">
            <option value="20">20 min</option>
            <option value="30">30 min</option>
            <option value="40">40 min</option>
            <option value="60">60 min</option>
            <option value="90">90 min</option>
          </select>
        </Field>
      </div>

      <Field label="Fecha y hora" htmlFor="startsAt" error={state.errors?.startsAt}>
        <input
          id="startsAt"
          name="startsAt"
          type="datetime-local"
          className={inputClass}
          defaultValue={defaultStartsAt}
          required
        />
      </Field>

      <Field label="Notas (opcional)" htmlFor="notes" error={state.errors?.notes}>
        <textarea id="notes" name="notes" rows={2} className={inputClass} placeholder="Motivo, indicaciones…" />
      </Field>

      <SubmitButton pendingLabel="Agendando…" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
        Agendar cita
      </SubmitButton>
    </form>
  );
}
