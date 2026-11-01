import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "@/components/login-form";
import { cardClass } from "@/components/ui";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/agenda");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 px-4 py-12">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-teal-800 p-10 text-teal-50 md:flex">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-base">🦷</span>
              OrtoAgenda
            </div>
            <h1 className="mt-10 text-3xl font-semibold leading-tight">
              Tu agenda de ortodoncia, ordenada.
            </h1>
            <p className="mt-4 text-sm text-teal-100/90">
              Gestiona pacientes, tratamientos y citas en un solo lugar. Controla la agenda diaria de
              cada profesional y evita cruces de horario.
            </p>
          </div>
          <ul className="mt-10 space-y-3 text-sm text-teal-100/90">
            <li className="flex gap-2">
              <span aria-hidden>✓</span> Agenda por día y por profesional
            </li>
            <li className="flex gap-2">
              <span aria-hidden>✓</span> Historia clínica y tratamientos
            </li>
            <li className="flex gap-2">
              <span aria-hidden>✓</span> Detección automática de choques de horario
            </li>
          </ul>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8 md:hidden">
            <div className="flex items-center gap-2 text-lg font-semibold text-teal-800">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-base">🦷</span>
              OrtoAgenda
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900">Iniciar sesión</h2>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            Ingresa con tu cuenta de la clínica para continuar.
          </p>

          <LoginForm />

          <div className={`${cardClass} mt-8 border-dashed bg-slate-50 px-4 py-3`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Demo</p>
            <p className="mt-1 text-sm text-slate-700">admin@ortodoncia.co</p>
            <p className="text-sm text-slate-700">Contraseña: demo1234</p>
          </div>
        </div>
      </div>
    </main>
  );
}
