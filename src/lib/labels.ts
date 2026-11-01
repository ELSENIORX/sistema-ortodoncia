import type {
  AppointmentStatus,
  AppointmentType,
  Role,
  TreatmentStatus,
  TreatmentType,
} from "@prisma/client";

export const roleLabels: Record<Role, string> = {
  ADMIN: "Administrador",
  ODONTOLOGO: "Odontólogo",
  ASISTENTE: "Asistente",
};

export const appointmentTypeLabels: Record<AppointmentType, string> = {
  VALORACION: "Valoración",
  INSTALACION: "Instalación",
  CONTROL: "Control",
  AJUSTE: "Ajuste",
  URGENCIA: "Urgencia",
  RETIRO: "Retiro",
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  PROGRAMADA: "Programada",
  CONFIRMADA: "Confirmada",
  ATENDIDA: "Atendida",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistió",
};

export const treatmentTypeLabels: Record<TreatmentType, string> = {
  BRACKETS_METALICOS: "Brackets metálicos",
  BRACKETS_ESTETICOS: "Brackets estéticos",
  ALINEADORES: "Alineadores",
  RETENEDOR: "Retenedor",
  OTRO: "Otro",
};

export const treatmentStatusLabels: Record<TreatmentStatus, string> = {
  ACTIVO: "Activo",
  FINALIZADO: "Finalizado",
  SUSPENDIDO: "Suspendido",
};

export const appointmentStatusStyles: Record<AppointmentStatus, string> = {
  PROGRAMADA: "bg-amber-50 text-amber-700 ring-amber-200",
  CONFIRMADA: "bg-sky-50 text-sky-700 ring-sky-200",
  ATENDIDA: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELADA: "bg-slate-100 text-slate-500 ring-slate-200",
  NO_ASISTIO: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const treatmentStatusStyles: Record<TreatmentStatus, string> = {
  ACTIVO: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  FINALIZADO: "bg-slate-100 text-slate-600 ring-slate-200",
  SUSPENDIDO: "bg-amber-50 text-amber-700 ring-amber-200",
};

export const appointmentTypes = Object.keys(appointmentTypeLabels) as AppointmentType[];
export const treatmentTypes = Object.keys(treatmentTypeLabels) as TreatmentType[];
