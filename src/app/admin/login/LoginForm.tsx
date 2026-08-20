"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { inputClasses, buttonClasses, cn } from "@/lib/styles";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className={cn(inputClasses, "mt-1")}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={cn(inputClasses, "mt-1")}
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={cn(buttonClasses("primary"), "w-full", pending && "opacity-70")}
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
