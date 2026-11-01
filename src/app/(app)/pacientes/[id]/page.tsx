import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatAge,
  formatCurrency,
  formatShortDate,
  formatTime,
  toDayParam,
} from "@/lib/dates";
import {
  appointmentStatusLabels,
  appointmentStatusStyles,
  appointmentTypeLabels,
  treatmentStatusLabels,
  treatmentStatusStyles,
  treatmentTypeLabels,
} from "@/lib/labels";
import { getPatientById } from "@/server/services/patients";
import { TreatmentForm } from "@/components/treatment-form";
import { TreatmentStatusForm } from "@/components/treatment-status-form";
import { Badge, EmptyState, SectionCard, cardClass } from "@/components/ui";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const patient = await getPatientById(id);
  return { title: patient ? patient.fullName : "Paciente" };
}

function DataRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800">{value ?? "—"}</dd>
    </div>
  );
}

export default async function PatientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const patient = await getPatientById(id);
  if (!patient) notFound();

  const activeTreatment = patient.treatments.find((treatment) => treatment.status === "ACTIVO");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/pacientes" className="text-sm font-medium text-teal-700 hover:underline">
          ← Volver a pacientes
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{patient.fullName}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>{patient.documentId ?? "Sin documento"}</span>
              <span aria-hidden>·</span>
              <span>{formatAge(patient.birthDate)}</span>
              <span aria-hidden>·</span>
              <span>Paciente desde {formatShortDate(patient.createdAt)}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeTreatment ? (
              <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">
                En tratamiento
              </Badge>
            ) : (
              <Badge className="bg-slate-100 text-slate-600 ring-slate-200">Sin tratamiento activo</Badge>
            )}
            <Badge
              className={
                patient.active
                  ? "bg-sky-50 text-sky-700 ring-sky-200"
                  : "bg-slate-100 text-slate-500 ring-slate-200"
              }
            >
              {patient.active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`${cardClass} p-5 lg:col-span-2`}>
          <h2 className="text-sm font-semibold text-slate-900">Datos de contacto</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <DataRow label="Teléfono" value={patient.phone} />
            <DataRow label="Correo" value={patient.email} />
            <DataRow label="Dirección" value={patient.address} className="sm:col-span-2" />
            <DataRow label="Acudiente" value={patient.guardianName} />
            <DataRow label="Teléfono del acudiente" value={patient.guardianPhone} />
          </dl>
          {patient.notes ? (
            <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Notas clínicas</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{patient.notes}</p>
            </div>
          ) : null}
        </div>

        <div className={`${cardClass} p-5`}>
          <h2 className="text-sm font-semibold text-slate-900">Resumen</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Tratamientos</dt>
              <dd className="font-medium text-slate-900">{patient.treatments.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Citas registradas</dt>
              <dd className="font-medium text-slate-900">{patient.appointments.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Citas atendidas</dt>
              <dd className="font-medium text-slate-900">
                {patient.appointments.filter((item) => item.status === "ATENDIDA").length}
              </dd>
            </div>
          </dl>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Última cita</p>
            {patient.appointments[0] ? (
              <p className="mt-1 text-sm text-slate-700">
                {formatShortDate(patient.appointments[0].startsAt)} ·{" "}
                {formatTime(patient.appointments[0].startsAt)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-400">Sin citas registradas</p>
            )}
          </div>
        </div>
      </div>

      <SectionCard title="Tratamientos" description="Historial ortodóntico del paciente.">
        {patient.treatments.length === 0 ? (
          <EmptyState title="Sin tratamientos registrados" description="Registra el primero debajo." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Tratamiento</th>
                  <th className="px-5 py-3 font-medium">Inicio</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Fin estimado</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Valor</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patient.treatments.map((treatment) => (
                  <tr key={treatment.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{treatmentTypeLabels[treatment.type]}</p>
                      {treatment.notes ? (
                        <p className="text-xs text-slate-500">{treatment.notes}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{formatShortDate(treatment.startedAt)}</td>
                    <td className="hidden px-5 py-3 text-slate-600 sm:table-cell">
                      {treatment.estimatedEndAt ? formatShortDate(treatment.estimatedEndAt) : "—"}
                    </td>
                    <td className="hidden px-5 py-3 text-slate-600 sm:table-cell">
                      {formatCurrency(treatment.totalPrice ? Number(treatment.totalPrice) : null)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={treatmentStatusStyles[treatment.status]}>
                        {treatmentStatusLabels[treatment.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {treatment.status !== "FINALIZADO" ? (
                          <TreatmentStatusForm
                            treatmentId={treatment.id}
                            patientId={patient.id}
                            status="FINALIZADO"
                            label="Finalizar"
                          />
                        ) : null}
                        {treatment.status === "ACTIVO" ? (
                          <TreatmentStatusForm
                            treatmentId={treatment.id}
                            patientId={patient.id}
                            status="SUSPENDIDO"
                            label="Suspender"
                            tone="suspend"
                          />
                        ) : null}
                        {treatment.status === "SUSPENDIDO" ? (
                          <TreatmentStatusForm
                            treatmentId={treatment.id}
                            patientId={patient.id}
                            status="ACTIVO"
                            label="Reactivar"
                            tone="reactivate"
                          />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <details className="group border-t border-slate-100">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium text-teal-700 hover:bg-slate-50">
            <span>Registrar nuevo tratamiento</span>
            <span className="text-lg transition group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <div className="border-t border-slate-100 bg-slate-50/50">
            <TreatmentForm patientId={patient.id} today={toDayParam(new Date())} />
          </div>
        </details>
      </SectionCard>

      <SectionCard title="Historial de citas" description="Últimas 25 citas del paciente.">
        {patient.appointments.length === 0 ? (
          <EmptyState title="Sin citas registradas" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {patient.appointments.map((appointment) => (
              <li key={appointment.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <span className="w-40 font-medium text-slate-800">
                  {formatShortDate(appointment.startsAt)} · {formatTime(appointment.startsAt)}
                </span>
                <span className="text-slate-600">{appointmentTypeLabels[appointment.type]}</span>
                <span className="text-xs text-slate-500">
                  {appointment.durationMin} min · {appointment.orthodontist.name}
                </span>
                <Badge className={`ml-auto ${appointmentStatusStyles[appointment.status]}`}>
                  {appointmentStatusLabels[appointment.status]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <div className="flex justify-end">
        <Link
          href="/agenda"
          className="text-sm font-medium text-teal-700 hover:underline"
        >
          Ir a la agenda →
        </Link>
      </div>
    </div>
  );
}
