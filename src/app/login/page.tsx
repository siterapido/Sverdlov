import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Sverdlov",
    description: "Acesse sua conta na plataforma Sverdlov",
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-black selection:bg-zinc-200 dark:selection:bg-zinc-800">
            <div className="w-full flex flex-col items-center max-w-sm mb-8 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xl">
                    <span className="text-lg font-bold">UP</span>
                </div>
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">
                        Sverdlov
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Gestão unificada para militantes
                    </p>
                </div>
            </div>

            <LoginForm />

            <div className="mt-8 text-center text-sm text-zinc-400 dark:text-zinc-600">
                <p>Ainda não tem acesso?</p>
                <a
                    href="/filie-se"
                    className="font-medium text-zinc-900 hover:underline underline-offset-4 dark:text-zinc-300"
                >
                    Preencher formulário de filiação
                </a>
            </div>
        </div>
    );
}
