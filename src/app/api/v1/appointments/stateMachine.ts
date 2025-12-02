export type AppointmentEvent =
  | "confirmado"
  | "cancelado"
  | "completo";

export type AppointmentStatus =
  | "pendente"
  | "confirmado"
  | "cancelado"
  | "concluido";

export const allowedTransitions: Record<
  AppointmentStatus,
  AppointmentStatus[]
> = {
  pendente: ["confirmado", "cancelado"],
  confirmado: ["cancelado", "concluido"],
  cancelado: [],
  concluido: [],
};

export function canTransition(current: AppointmentStatus, next: AppointmentStatus): boolean {
  return allowedTransitions[current]?.includes(next) ?? false;
}
export const stateTransitions: Record<
  AppointmentStatus,
  Record<AppointmentEvent, AppointmentStatus | null>
> = {
  pendente: {
    confirmado: "confirmado",
    cancelado: "cancelado",
    completo: null,
  },
  confirmado: {
    confirmado: null,
    cancelado: "cancelado",
    completo: "concluido",
  },
  concluido: {
    confirmado: null,
    cancelado: null,
    completo: null,
  },
  cancelado: {
    confirmado: null,
    cancelado: null,
    completo: null,
  },
};

export function applyTransition(
  currentState: AppointmentStatus,
  event: AppointmentEvent
): AppointmentStatus {
  const next = stateTransitions[currentState][event];

  if (!next) {
    throw new Error(
      `Invalid transition: cannot '${event}' when appointment is '${currentState}'.`
    );
  }

  return next;
}
