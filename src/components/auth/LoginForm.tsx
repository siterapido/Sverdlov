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
        <Card className="w-full max-w-[400px] shadow-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardHeader className="space-y-1 text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Bem-vindo de volta
                </CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                    Digite suas credenciais para acessar sua conta
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input
                                id="email"
                                name="email"
                                placeholder="nome@exemplo.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isLoading}
                                className="pl-9 bg-zinc-50 border-zinc-200 focus:bg-white transition-all dark:bg-zinc-950 dark:border-zinc-800"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Senha</Label>
                            <a
                                href="#"
                                className="text-xs font-medium text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline dark:text-blue-400"
                                onClick={(e) => e.preventDefault()}
                            >
                                Esqueceu a senha?
                            </a>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                disabled={isLoading}
                                className="pl-9 bg-zinc-50 border-zinc-200 focus:bg-white transition-all dark:bg-zinc-950 dark:border-zinc-800"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-600 dark:bg-red-900/10 dark:border-red-900/20 dark:text-red-400 animate-in fade-in-50">
                            {error}
                        </div>
                    )}

                    <Button
                        className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 font-medium tracking-wide transition-all"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                Entrar
                                <ArrowRight className="h-4 w-4 opacity-50" />
                            </span>
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-8 text-center text-sm text-zinc-500">
                <div className="text-xs dark:text-zinc-500">
                    Protegido por reCAPTCHA e sujeito à Política de Privacidade e Termos de Serviço do Google.
                </div>
            </CardFooter>
        </Card>
    );
}
