"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Erro ao fazer login");
            }

            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Algo deu errado");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-[420px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] border-zinc-200 bg-white">
            <CardHeader className="space-y-2 text-center pb-8 pt-10 border-b border-zinc-50">
                <CardTitle className="text-2xl font-black uppercase tracking-tight text-foreground">
                    Bem-vindo de volta
                </CardTitle>
                <CardDescription className="text-muted font-bold uppercase text-[10px] tracking-widest">
                    Digite suas credenciais para acessar sua conta
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="font-black uppercase text-[10px] tracking-widest text-muted">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-300" />
                            <Input
                                id="email"
                                name="email"
                                placeholder="nome@exemplo.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isLoading}
                                className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white transition-all font-medium rounded-sm"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="font-black uppercase text-[10px] tracking-widest text-muted">Senha</Label>
                            <a
                                href="#"
                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4"
                                onClick={(e) => e.preventDefault()}
                            >
                                Esqueceu a senha?
                            </a>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-300" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                disabled={isLoading}
                                className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white transition-all font-medium rounded-sm"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-sm text-xs font-bold text-red-600 uppercase tracking-tight animate-in fade-in-50">
                            {error}
                        </div>
                    )}

                    <Button
                        className="w-full h-12 bg-primary hover:brightness-110 text-white font-black uppercase tracking-widest text-xs transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-0.5 active:shadow-none"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                Entrar no sistema
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-10 pt-4 text-center">
                <div className="text-[10px] font-medium text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                    Protegido por reCAPTCHA e sujeito à Política de Privacidade e Termos de Serviço do Google.
                </div>
            </CardFooter>
        </Card>
    );
}
