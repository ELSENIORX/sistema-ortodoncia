import type { Metadata } from "next";
import Link from "next/link";
import { formatAge, formatShortDate } from "@/lib/dates";
import { listPatients } from "@/server/services/patients";
import { PatientForm } from "@/components/patient-form";
import { Badge, EmptyState, SectionCard, inputClass, primaryButtonClass } from "@/components/ui";

export const metadata: Metadata = { title: "Pacientes" };

type PageProps = { searchParams: Promise<{ q?: string }> };

export default async function PatientsPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const patients = await listPatients({ query });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Pacientes</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Historias de ortodoncia</h1>
          <p className="mt-1 text-sm text-slate-500">
            {patients.length} {patients.length === 1 ? "paciente" : "pacientes"}
            {query ? ` que coinciden con “${query}”` : " activos"}
          </p>
        </div>

        <form action="/pacientes" method="get" className="flex w-full gap-2 sm:w-auto">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar por nombre, documento o teléfono"
            className={`${inputClass} sm:w-72`}
            aria-label="Buscar pacientes"
          />
          <button type="submit" className={primaryButtonClass}>
            Buscar
          </button>
          {query ? (
            <Link
              href="/pacientes"
              className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              Limpiar
            </Link>
          ) : null}
        </form>
      </div>

      <SectionCard
        title="Registrar paciente"
        description="Completa los datos básicos para abrir la historia clínica."
        className="overflow-hidden"
      >
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium text-teal-700 hover:bg-slate-50">
            <span>Abrir formulario de registro</span>
            <span className="text-lg transition group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <div className="border-t border-slate-100">
            <PatientForm />
          </div>
        </details>
      </SectionCard>

      <SectionCard title="Listado de pacientes" description="Haz clic en un paciente para ver tratamientos y citas.">
        {patients.length === 0 ? (
          <EmptyState
            title={query ? "No encontramos pacientes" : "Todavía no hay pacientes registrados"}
            description={
              query
                ? "Prueba con otro nombre, documento o teléfono."
                : "Registra el primer paciente con el formulario de arriba."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Paciente</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Documento</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Edad</th>
                  <th className="hidden px-5 py-3 font-medium lg:table-cell">Teléfono</th>
                  <th className="px-5 py-3 font-medium">Tratamientos</th>
                  <th className="px-5 py-3 font-medium">Citas</th>
                  <th className="px-5 py-3 font-medium">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => {
                  const activeTreatments = patient.treatments.filter(
                    (treatment) => treatment.status === "ACTIVO",
                  ).length;

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3">
                        <Link
                          href={`/pacientes/${patient.id}`}
                          className="font-medium text-slate-900 hover:text-teal-700 hover:underline"
                        >
                          {patient.fullName}
                        </Link>
                        <p className="text-xs text-slate-500 sm:hidden">
                          {patient.documentId ?? "Sin documento"}
                        </p>
                      </td>
                      <td className="hidden px-5 py-3 text-slate-600 sm:table-cell">
                        {patient.documentId ?? "—"}
                      </td>
                      <td className="hidden px-5 py-3 text-slate-600 md:table-cell">
                        {formatAge(patient.birthDate)}
                      </td>
                      <td className="hidden px-5 py-3 text-slate-600 lg:table-cell">
                        {patient.phone ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        {activeTreatments > 0 ? (
                          <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">
                            {activeTreatments} activo{activeTreatments === 1 ? "" : "s"}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{patient._count.appointments}</td>
                      <td className="px-5 py-3 text-slate-500">
                        {formatShortDate(patient.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
