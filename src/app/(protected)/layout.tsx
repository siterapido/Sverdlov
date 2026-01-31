import { AppLayout } from "@/components/layout/AppLayout";
import { ToastProvider } from "@/components/ui/toast";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    let userRole = undefined;
    let userId = undefined;

    if (token) {
        const user = await verifyToken(token);
        if (user) {
            userRole = user.role;
            userId = user.userId;
        }
    }

    return (
        <ToastProvider>
            <AppLayout userRole={userRole} userId={userId}>{children}</AppLayout>
        </ToastProvider>
    );
}
