"use client";

import { useActionState } from "react";
import { entrar, type EntrarResult } from "@/app/actions/session";
import { Button } from "@/app/components/ui/button";
import { Field } from "@/app/components/ui/field";
import { Input } from "@/app/components/ui/input";

const LOGIN_MESSAGES = {
  invalidCredentials:
    "E-mail ou senha incorretos. Verifique e tente de novo.",
  validationError: "Informe um e-mail válido e a senha.",
  unavailable: "Não foi possível entrar agora. Tente de novo em instantes.",
  tooManyAttempts: (time: string) =>
    `Muitas tentativas. Tente de novo em ${time}.`,
};

const ERROR_ID = "login-error";

function pluralize(value: number, singular: string, plural: string): string {
  return value === 1 ? `1 ${singular}` : `${value} ${plural}`;
}

function formatRetryAfter(seconds: number): string {
  if (seconds < 60) {
    return pluralize(seconds, "segundo", "segundos");
  }

  return pluralize(Math.ceil(seconds / 60), "minuto", "minutos");
}

function messageFor(result: EntrarResult): string {
  switch (result.status) {
    case "invalid_credentials":
      return LOGIN_MESSAGES.invalidCredentials;
    case "validation_error":
      return LOGIN_MESSAGES.validationError;
    case "too_many_attempts":
      return LOGIN_MESSAGES.tooManyAttempts(
        formatRetryAfter(result.retryAfterSeconds),
      );
    case "unavailable":
      return LOGIN_MESSAGES.unavailable;
  }
}

type LoginFormProps = {
  para: string | null;
};

export function LoginForm({ para }: LoginFormProps) {
  const [result, formAction, pending] = useActionState(entrar, null);
  const message = result ? messageFor(result) : null;
  const isFieldError =
    result?.status === "invalid_credentials" ||
    result?.status === "validation_error";

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      {para ? <input type="hidden" name="para" value={para} /> : null}
      <div className="flex flex-col gap-4">
        <Field label="E-mail" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="pessoa@empresa.com"
            aria-invalid={isFieldError || undefined}
            aria-describedby={isFieldError ? ERROR_ID : undefined}
          />
        </Field>
        <Field label="Senha" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            aria-invalid={isFieldError || undefined}
            aria-describedby={isFieldError ? ERROR_ID : undefined}
          />
        </Field>
      </div>
      {message ? (
        <p id={ERROR_ID} role="alert" className="text-small text-danger-fg">
          {message}
        </p>
      ) : null}
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Entrar
      </Button>
    </form>
  );
}
