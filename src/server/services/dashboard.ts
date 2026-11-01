import { prisma } from "@/server/db";
import { endOfDay, startOfDay } from "@/lib/dates";
import { countActivePatients } from "@/server/services/patients";

export type DashboardSummary = {
  todayAppointments: number;
  weekAppointments: number;
  activePatients: number;
  activeTreatments: number;
  pendingAppointments: number;
};

/** Métricas generales de la clínica para el tablero. */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekEnd = endOfDay(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));

  const appointmentFilter = { status: { not: "CANCELADA" as const } };

  const [todayAppointments, weekAppointments, activePatients, activeTreatments, pendingAppointments] =
    await Promise.all([
      prisma.appointment.count({
        where: { ...appointmentFilter, startsAt: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.appointment.count({
        where: { ...appointmentFilter, startsAt: { gte: todayStart, lte: weekEnd } },
      }),
      countActivePatients(),
      prisma.treatment.count({ where: { status: "ACTIVO" } }),
      prisma.appointment.count({
        where: {
          status: { in: ["PROGRAMADA", "CONFIRMADA"] },
          startsAt: { gte: todayStart },
        },
      }),
    ]);

  return { todayAppointments, weekAppointments, activePatients, activeTreatments, pendingAppointments };
}
