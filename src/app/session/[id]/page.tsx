"use client";

import { useParams, useRouter } from "next/navigation";
import { useSessions } from "@/hooks/useSessions";
import { SessionDetail } from "@/components/organisms/SessionDetail"; // Adjust path
import SessionDetailSkeleton from "@/components/organisms/SessionDetailSkeleton";

export default function SessionPage() {
    const params = useParams();
    const router = useRouter();
    const { activeSessions, historySessions, foundCar, status } = useSessions();

    const sessionId = params.id as string;
    const allSessions = [...activeSessions, ...historySessions];
    const session = allSessions.find((s) => s.id === sessionId);

    if (status === "loading") {
        return <SessionDetailSkeleton />;
    }

    if (!session) {
        return (
            <div className="text-center space-y-4">
                <p className="text-neutral-400">Session not found.</p>
                <button onClick={() => router.push("/")} className="text-orange-500 font-semibold">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <SessionDetail
                session={session}
                onBack={() => router.push("/")}
                onFoundCar={(id) => {
                    foundCar(id);
                    router.push("/");
                }}
            />
        </div>
    );
}
