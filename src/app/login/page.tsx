import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Sverdlov",
    description: "Acesse sua conta na plataforma Sverdlov",
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-white selection:bg-primary/20">
            <div className="w-full flex flex-col items-center max-w-sm mb-12 space-y-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-none bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <span className="text-xl font-black">UP</span>
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
                        Sverdlov
                    </h1>
                    <p className="text-muted font-bold uppercase text-[11px] tracking-widest">
                        Gestão unificada para militantes
                    </p>
                </div>
            </div>

            <LoginForm />

            <div className="mt-12 text-center text-sm">
                <p className="text-muted font-medium">Ainda não tem acesso?</p>
                <a
                    href="/filie-se"
                    className="mt-2 inline-block font-black text-primary uppercase text-xs tracking-wider hover:underline underline-offset-4"
                >
                    Preencher formulário de filiação
                </a>
            </div>
        </div>
    );
}
