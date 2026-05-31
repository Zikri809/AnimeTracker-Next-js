"use client";

import { fetchAuthSessionWithRefresh } from "@/lib/auth-session";
import { invalidateSyncSession, startWatchlistSync } from "@/app/mylist/_lib/mylist-worker-sync";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

let workerStarted = false;

export function __resetPersistentWorkerForTests() {
    workerStarted = false;
    invalidateSyncSession();
}

export default function PersistentWorker({ children }: { children: ReactNode }) {
    const hasrunned = useRef(false);

    useEffect(() => {
        if (workerStarted || hasrunned.current || typeof Worker === "undefined") {
            return;
        }

        if (typeof window !== "undefined" && window.location.pathname.startsWith("/mylist")) {
            return;
        }

        let cancelled = false;
        let sync: ReturnType<typeof startWatchlistSync> | null = null;

        fetchAuthSessionWithRefresh().then((session) => {
            if (cancelled || workerStarted || hasrunned.current || !session.authenticated) return;

            workerStarted = true;
            hasrunned.current = true;
            sync = startWatchlistSync(
                () => {
                    workerStarted = false;
                },
                () => {
                    workerStarted = false;
                }
            );
        });

        return () => {
            cancelled = true;
            if (sync && typeof window !== "undefined" && window.location.pathname.startsWith("/mylist")) {
                sync.terminate();
                workerStarted = false;
            }
        };
    }, []);

    return (
        <>
            {children}
        </>
    );
}
