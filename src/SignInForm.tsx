"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-green-100 p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Menos Plástico, Mais Futuro
          </h2>
          <form
            className="flex flex-col gap-form-field"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitting(true);
              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", flow);
              void signIn("password", formData).catch((error) => {
                let toastTitle = "";
                if (error.message.includes("Invalid password")) {
                  toastTitle = "Invalid password. Please try again.";
                } else {
                  toastTitle =
                    flow === "signIn"
                      ? "Não foi possível entrar. Deseja criar uma conta?"
                      : "Não foi possível inscrever-se, Deseja entrar em uma conta?";
                }
                toast.error(toastTitle);
                setSubmitting(false);
              });
            }}
          >
            <input
              className="auth-input-field"
              type="email"
              name="email"
              placeholder="Email"
              required
            />
            <input
              className="auth-input-field"
              type="password"
              name="password"
              placeholder="Senha"
              required
            />
            <button className="auth-button" type="submit" disabled={submitting}>
              {flow === "signIn" ? "Entrar" : "Inscrever-se"}
            </button>
            <div className="text-center text-sm text-secondary">
              <span>
                {flow === "signIn"
                  ? "Não tem uma conta? "
                  : "Já tem uma conta? "}
              </span>
              <button
                type="button"
                className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              >
                {flow === "signIn" ? "Inscreva-se aqui!" : "Entre aqui!"}
              </button>
            </div>
          </form>
        </div>
      </div>

    </>

  );
}
