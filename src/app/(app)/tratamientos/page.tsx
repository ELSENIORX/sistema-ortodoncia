import type { Metadata } from "next";
import Link from "next/link";
import { formatCurrency, formatShortDate } from "@/lib/dates";
import { treatmentTypeLabels } from "@/lib/labels";
import { listActiveTreatments } from "@/server/services/treatments";
import { TreatmentStatusForm } from "@/components/treatment-status-form";
import { EmptyState, SectionCard, StatCard } from "@/components/ui";

export const metadata: Metadata = { title: "Tratamientos" };

export default async function TreatmentsPage() {
  const treatments = await listActiveTreatments();
  const endingSoon = treatments.filter(
    (treatment) =>
      treatment.estimatedEndAt &&
      treatment.estimatedEndAt.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000,
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-teal-700">Tratamientos</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Pacientes en tratamiento</h1>
        <p className="mt-1 text-sm text-slate-500">
          Seguimiento de los tratamientos ortodónticos activos de la clínica.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tratamientos activos" value={treatments.length} />
        <StatCard label="Pacientes diferentes" value={new Set(treatments.map((t) => t.patient.id)).size} />
        <StatCard label="Vencen en 30 días" value={endingSoon} hint="Según fin estimado" />
      </div>

      <SectionCard title="Tratamientos activos" description="Finaliza o suspende un tratamiento según el avance clínico.">
        {treatments.length === 0 ? (
          <EmptyState
            title="No hay tratamientos activos"
            description="Registra un tratamiento desde la historia del paciente."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Paciente</th>
                  <th className="px-5 py-3 font-medium">Tratamiento</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Inicio</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Fin estimado</th>
                  <th className="hidden px-5 py-3 font-medium lg:table-cell">Valor</th>
                  <th className="px-5 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {treatments.map((treatment) => (
                  <tr key={treatment.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <Link
                        href={`/pacientes/${treatment.patient.id}`}
                        className="font-medium text-slate-900 hover:text-teal-700 hover:underline"
                      >
                        {treatment.patient.fullName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{treatmentTypeLabels[treatment.type]}</td>
                    <td className="hidden px-5 py-3 text-slate-600 sm:table-cell">
                      {formatShortDate(treatment.startedAt)}
                    </td>
                    <td className="hidden px-5 py-3 text-slate-600 md:table-cell">
                      {treatment.estimatedEndAt ? formatShortDate(treatment.estimatedEndAt) : "—"}
                    </td>
                    <td className="hidden px-5 py-3 text-slate-600 lg:table-cell">
                      {formatCurrency(treatment.totalPrice ? Number(treatment.totalPrice) : null)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <TreatmentStatusForm
                          treatmentId={treatment.id}
                          patientId={treatment.patient.id}
                          status="FINALIZADO"
                          label="Finalizar"
                        />
                        <TreatmentStatusForm
                          treatmentId={treatment.id}
                          patientId={treatment.patient.id}
                          status="SUSPENDIDO"
                          label="Suspender"
                          tone="suspend"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <p className="text-xs text-slate-400">Actualizado el {formatShortDate(new Date())}.</p>
    </div>
  );
}
