import type { Metadata } from "next";
import Link from "next/link";
import {
  addDays,
  formatLongDate,
  formatTime,
  formatTimeRange,
  parseDayParam,
  toDateTimeInput,
  toDayParam,
} from "@/lib/dates";
import { appointmentStatusLabels, appointmentStatusStyles, appointmentTypeLabels } from "@/lib/labels";
import { getDaySummary, listAppointmentsByDay } from "@/server/services/appointments";
import { updateAppointmentStatusAction } from "@/app/actions/appointments";
import { getDashboardSummary } from "@/server/services/dashboard";
import { listPatients } from "@/server/services/patients";
import { listProfessionals } from "@/server/services/users";
import { AppointmentForm } from "@/components/appointment-form";
import {
  Alert,
  Badge,
  EmptyState,
  SectionCard,
  StatCard,
  cardClass,
  secondaryButtonClass,
} from "@/components/ui";

export const metadata: Metadata = { title: "Agenda" };

type PageProps = { searchParams: Promise<{ fecha?: string }> };

function defaultStartFor(day: Date): string {
  const now = new Date();
  if (toDayParam(day) !== toDayParam(now)) {
    const morning = new Date(day);
    morning.setHours(8, 0, 0, 0);
    return toDateTimeInput(morning);
  }

  const next = new Date(now.getTime() + 60 * 60 * 1000);
  next.setMinutes(Math.ceil(next.getMinutes() / 15) * 15, 0, 0);
  return toDateTimeInput(next);
}

const actionClass =
  "rounded-md border px-2.5 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500";

function StatusAction({
  id,
  status,
  label,
  tone,
}: {
  id: string;
  status: "CONFIRMADA" | "ATENDIDA" | "CANCELADA" | "NO_ASISTIO";
  label: string;
  tone: "teal" | "emerald" | "slate" | "rose";
}) {
  const tones = {
    teal: "border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    slate: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
    rose: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  } as const;

  return (
    <form action={updateAppointmentStatusAction} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={`${actionClass} ${tones[tone]}`}>
        {label}
      </button>
    </form>
  );
}

export default async function AgendaPage({ searchParams }: PageProps) {
  const { fecha } = await searchParams;
  const day = parseDayParam(fecha);

  const [appointments, summary, dashboard, patients, professionals] = await Promise.all([
    listAppointmentsByDay(day),
    getDaySummary(day),
    getDashboardSummary(),
    listPatients(),
    listProfessionals(),
  ]);

  const previousDay = toDayParam(addDays(day, -1));
  const nextDay = toDayParam(addDays(day, 1));
  const isToday = toDayParam(day) === toDayParam(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Agenda</p>
          <h1 className="mt-1 text-2xl font-semibold capitalize text-slate-900">
            {formatLongDate(day)}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {summary.total} {summary.total === 1 ? "cita" : "citas"} en el día ·{" "}
            {summary.attended} atendidas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={{ pathname: "/agenda", query: { fecha: previousDay } }}
            className={secondaryButtonClass}
            aria-label="Día anterior"
          >
            ←
          </Link>
          <Link
            href="/agenda"
            className={`${secondaryButtonClass} ${isToday ? "border-teal-200 bg-teal-50 text-teal-800" : ""}`}
          >
            Hoy
          </Link>
          <Link
            href={{ pathname: "/agenda", query: { fecha: nextDay } }}
            className={secondaryButtonClass}
            aria-label="Día siguiente"
          >
            →
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Citas del día" value={summary.total} hint={`${dashboard.weekAppointments} en los próximos 7 días`} />
        <StatCard label="Confirmadas" value={summary.confirmed} hint={`${summary.pending} por atender`} />
        <StatCard label="Pacientes activos" value={dashboard.activePatients} />
        <StatCard label="Tratamientos activos" value={dashboard.activeTreatments} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Citas del día"
          description="Confirma, atiende o cancela cada cita."
          className="lg:col-span-2"
        >
          {appointments.length === 0 ? (
            <EmptyState
              title="No hay citas agendadas para este día"
              description="Usa el formulario de la derecha para agendar la primera."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {appointments.map((appointment) => (
                <li key={appointment.id} className="flex flex-wrap gap-4 px-5 py-4">
                  <div className="w-24 shrink-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatTime(appointment.startsAt)}
                    </p>
                    <p className="text-xs text-slate-500">
                      hasta {formatTimeRange(appointment.startsAt, appointment.durationMin).split(" – ")[1]}
                    </p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/pacientes/${appointment.patient.id}`}
                      className="font-medium text-slate-900 hover:text-teal-700 hover:underline"
                    >
                      {appointment.patient.fullName}
                    </Link>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                      <span>{appointmentTypeLabels[appointment.type]}</span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: appointment.orthodontist.color }}
                          aria-hidden
                        />
                        {appointment.orthodontist.name}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{appointment.durationMin} min</span>
                    </p>
                    {appointment.notes ? (
                      <p className="mt-1 text-xs text-slate-500">{appointment.notes}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge className={appointmentStatusStyles[appointment.status]}>
                      {appointmentStatusLabels[appointment.status]}
                    </Badge>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {appointment.status === "PROGRAMADA" ? (
                        <StatusAction id={appointment.id} status="CONFIRMADA" label="Confirmar" tone="teal" />
                      ) : null}
                      {(appointment.status === "PROGRAMADA" || appointment.status === "CONFIRMADA") ? (
                        <>
                          <StatusAction id={appointment.id} status="ATENDIDA" label="Atender" tone="emerald" />
                          <StatusAction id={appointment.id} status="NO_ASISTIO" label="No asistió" tone="slate" />
                        </>
                      ) : null}
                      {appointment.status !== "CANCELADA" && appointment.status !== "ATENDIDA" ? (
                        <StatusAction id={appointment.id} status="CANCELADA" label="Cancelar" tone="rose" />
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <div className="space-y-6">
          <div className={`${cardClass} overflow-hidden`}>
            <header className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">Nueva cita</h2>
              <p className="mt-0.5 text-sm text-slate-500">Evitamos cruces de horario automáticamente.</p>
            </header>

            {patients.length === 0 ? (
              <div className="px-5 py-6">
                <Alert kind="info">
                  Aún no hay pacientes registrados.{" "}
                  <Link href="/pacientes" className="font-medium underline">
                    Registra el primero
                  </Link>
                  .
                </Alert>
              </div>
            ) : (
              <AppointmentForm
                patients={patients.map((patient) => ({ id: patient.id, name: patient.fullName }))}
                professionals={professionals}
                defaultStartsAt={defaultStartFor(day)}
              />
            )}
          </div>

          <div className={`${cardClass} px-5 py-4`}>
            <h2 className="text-sm font-semibold text-slate-900">Estado de la agenda</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Programadas</dt>
                <dd className="font-medium text-slate-900">
                  {appointments.filter((item) => item.status === "PROGRAMADA").length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Confirmadas</dt>
                <dd className="font-medium text-slate-900">
                  {appointments.filter((item) => item.status === "CONFIRMADA").length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Atendidas</dt>
                <dd className="font-medium text-slate-900">
                  {appointments.filter((item) => item.status === "ATENDIDA").length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Canceladas / no asistió</dt>
                <dd className="font-medium text-slate-900">
                  {
                    appointments.filter(
                      (item) => item.status === "CANCELADA" || item.status === "NO_ASISTIO",
                    ).length
                  }
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
