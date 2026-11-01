import { z } from "zod";

const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null));

const requiredText = (label: string, min = 2, max = 160) =>
  z
    .string()
    .trim()
    .min(min, `${label} es obligatorio`)
    .max(max, `Máximo ${max} caracteres`);

const localDate = (label: string) =>
  z
    .string()
    .min(1, `${label} es obligatoria`)
    .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), "Fecha inválida")
    .transform((value) => new Date(`${value}T00:00:00`));

const localDateTime = z
  .string()
  .min(1, "La fecha y hora son obligatorias")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Fecha y hora inválidas")
  .transform((value) => new Date(value));

const optionalPrice = z
  .union([z.literal(""), z.coerce.number().min(0, "El valor no puede ser negativo")])
  .optional()
  .transform((value) => (value === "" || value === undefined ? null : value));

const emailField = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value.toLowerCase() : null))
  .refine((value) => value === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Correo inválido");

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .transform((value) => value.toLowerCase())
    .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const patientSchema = z.object({
  fullName: requiredText("El nombre completo", 3),
  documentId: optionalText(30),
  birthDate: z
    .string()
    .optional()
    .transform((value) => (value && value.length > 0 ? new Date(`${value}T00:00:00`) : null)),
  phone: optionalText(30),
  email: emailField,
  address: optionalText(200),
  guardianName: optionalText(160),
  guardianPhone: optionalText(30),
  notes: optionalText(1000),
});

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Selecciona un paciente"),
  orthodontistId: z.string().min(1, "Selecciona un profesional"),
  type: z.enum(["VALORACION", "INSTALACION", "CONTROL", "AJUSTE", "URGENCIA", "RETIRO"]),
  startsAt: localDateTime,
  durationMin: z.coerce
    .number()
    .int("La duración debe ser un número entero")
    .min(10, "La duración mínima es de 10 minutos")
    .max(240, "La duración máxima es de 240 minutos"),
  notes: optionalText(500),
});

export const treatmentSchema = z.object({
  patientId: z.string().min(1, "Selecciona un paciente"),
  type: z.enum([
    "BRACKETS_METALICOS",
    "BRACKETS_ESTETICOS",
    "ALINEADORES",
    "RETENEDOR",
    "OTRO",
  ]),
  startedAt: localDate("La fecha de inicio"),
  estimatedEndAt: z
    .string()
    .optional()
    .transform((value) => (value && value.length > 0 ? new Date(`${value}T00:00:00`) : null)),
  totalPrice: optionalPrice,
  notes: optionalText(1000),
});

export const appointmentStatusValues = [
  "PROGRAMADA",
  "CONFIRMADA",
  "ATENDIDA",
  "CANCELADA",
  "NO_ASISTIO",
] as const;

export const appointmentStatusSchema = z.enum(appointmentStatusValues);

export const treatmentStatusValues = ["ACTIVO", "FINALIZADO", "SUSPENDIDO"] as const;

export const treatmentStatusSchema = z.enum(treatmentStatusValues);

export type LoginInput = z.infer<typeof loginSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type TreatmentInput = z.infer<typeof treatmentSchema>;

/** Convierte un error de Zod en un mapa campo -> mensaje. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
