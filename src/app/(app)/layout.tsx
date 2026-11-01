import Link from "next/link";
import { requireUser } from "@/lib/session";
import { logoutAction } from "@/app/actions/auth";
import { Nav } from "@/components/nav";
import { roleLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/agenda" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-base text-white">
              🦷
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight text-slate-900">
                OrtoAgenda
              </span>
              <span className="block text-xs text-slate-500">Clínica de ortodoncia</span>
            </span>
          </Link>

          <div className="order-3 w-full sm:order-none sm:ml-4 sm:w-auto">
            <Nav />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{roleLabels[user.role]}</p>
            </div>
            <span
              className="grid h-9 w-9 place-items-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: user.color }}
              aria-hidden
            >
              {initials(user.name)}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        OrtoAgenda · Sistema de agendamiento de citas de ortodoncia
      </footer>
    </div>
  );
}
