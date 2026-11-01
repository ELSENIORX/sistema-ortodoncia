import type { AppointmentStatus, AppointmentType, Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { addMinutes, endOfDay, startOfDay } from "@/lib/dates";
import type { AppointmentInput } from "@/lib/schemas";

export type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: {
    patient: { select: { id: true; fullName: true; phone: true } };
    orthodontist: { select: { id: true; name: true; color: true } };
  };
}>;

const appointmentInclude = {
  patient: { select: { id: true, fullName: true, phone: true } },
  orthodontist: { select: { id: true, name: true, color: true } },
} satisfies Prisma.AppointmentInclude;

export class AppointmentConflictError extends Error {
  constructor(public readonly conflict: AppointmentWithRelations) {
    super(
      `El profesional ya tiene una cita de ${conflict.patient.fullName} en ese horario.`,
    );
    this.name = "AppointmentConflictError";
  }
}

export class AppointmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppointmentValidationError";
  }
}

export async function listAppointmentsByDay(day: Date): Promise<AppointmentWithRelations[]> {
  return prisma.appointment.findMany({
    where: { startsAt: { gte: startOfDay(day), lte: endOfDay(day) } },
    include: appointmentInclude,
    orderBy: { startsAt: "asc" },
  });
}

export async function listAppointmentsByPatient(
  patientId: string,
  take = 25,
): Promise<AppointmentWithRelations[]> {
  return prisma.appointment.findMany({
    where: { patientId },
    include: appointmentInclude,
    orderBy: { startsAt: "desc" },
    take,
  });
}

export async function listUpcomingAppointments(take = 5): Promise<AppointmentWithRelations[]> {
  return prisma.appointment.findMany({
    where: {
      startsAt: { gte: new Date() },
      status: { in: ["PROGRAMADA", "CONFIRMADA"] },
    },
    include: appointmentInclude,
    orderBy: { startsAt: "asc" },
    take,
  });
}

/**
 * Busca una cita que se cruce con el intervalo indicado para el mismo
 * profesional, ignorando las canceladas y las marcadas como no asistidas.
 */
export async function findConflictingAppointment(params: {
  orthodontistId: string;
  startsAt: Date;
  durationMin: number;
  excludeId?: string;
}): Promise<AppointmentWithRelations | null> {
  const { orthodontistId, startsAt, durationMin, excludeId } = params;
  const endsAt = addMinutes(startsAt, durationMin);

  const sameDay = await prisma.appointment.findMany({
    where: {
      orthodontistId,
      status: { notIn: ["CANCELADA", "NO_ASISTIO"] },
      startsAt: { gte: startOfDay(startsAt), lte: endOfDay(startsAt) },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    include: appointmentInclude,
    orderBy: { startsAt: "asc" },
  });

  return (
    sameDay.find((appointment) => {
      const otherEnd = addMinutes(appointment.startsAt, appointment.durationMin);
      return startsAt < otherEnd && appointment.startsAt < endsAt;
    }) ?? null
  );
}

export async function createAppointment(input: AppointmentInput): Promise<AppointmentWithRelations> {
  if (input.startsAt.getTime() < Date.now() - 60_000) {
    throw new AppointmentValidationError("No se pueden agendar citas en el pasado.");
  }

  const conflict = await findConflictingAppointment({
    orthodontistId: input.orthodontistId,
    startsAt: input.startsAt,
    durationMin: input.durationMin,
  });
  if (conflict) throw new AppointmentConflictError(conflict);

  return prisma.appointment.create({
    data: {
      patientId: input.patientId,
      orthodontistId: input.orthodontistId,
      type: input.type,
      startsAt: input.startsAt,
      durationMin: input.durationMin,
      notes: input.notes,
    },
    include: appointmentInclude,
  });
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<AppointmentWithRelations> {
  return prisma.appointment.update({
    where: { id },
    data: { status },
    include: appointmentInclude,
  });
}

export type DaySummary = {
  total: number;
  confirmed: number;
  attended: number;
  pending: number;
};

export async function getDaySummary(day: Date): Promise<DaySummary> {
  const appointments = await prisma.appointment.findMany({
    where: {
      startsAt: { gte: startOfDay(day), lte: endOfDay(day) },
      status: { not: "CANCELADA" },
    },
    select: { status: true },
  });

  return {
    total: appointments.length,
    confirmed: appointments.filter(
      (appointment) => appointment.status === "CONFIRMADA" || appointment.status === "ATENDIDA",
    ).length,
    attended: appointments.filter((appointment) => appointment.status === "ATENDIDA").length,
    pending: appointments.filter(
      (appointment) => appointment.status === "PROGRAMADA" || appointment.status === "CONFIRMADA",
    ).length,
  };
}

export type AppointmentTypeCount = { type: AppointmentType; count: number };

export async function countAppointmentsByTypeSince(since: Date): Promise<AppointmentTypeCount[]> {
  const grouped = await prisma.appointment.groupBy({
    by: ["type"],
    where: { startsAt: { gte: since }, status: { not: "CANCELADA" } },
    _count: { _all: true },
  });

  return grouped.map((item) => ({ type: item.type, count: item._count._all }));
}
