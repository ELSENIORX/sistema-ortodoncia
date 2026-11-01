export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
};

export const idleState: ActionState = { status: "idle" };

export function successState(message: string): ActionState {
  return { status: "success", message };
}

export function errorState(message: string, errors?: Record<string, string>): ActionState {
  return { status: "error", message, errors };
}
