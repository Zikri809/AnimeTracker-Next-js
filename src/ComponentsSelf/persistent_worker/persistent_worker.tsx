"use client";

import { fetchAuthSession } from "@/lib/auth-session";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

let syncWorker: Worker | null = null;
let workerStarted = false;

export function __resetPersistentWorkerForTests() {
    syncWorker = null;
    workerStarted = false;
}

export default function PersistentWorker({ children }: { children: ReactNode }) {
    const hasrunned = useRef(false);

    useEffect(() => {
        if (workerStarted || hasrunned.current || typeof Worker === "undefined") {
            return;
        }

        let cancelled = false;

        fetchAuthSession().then((session) => {
            if (cancelled || workerStarted || hasrunned.current || !session.authenticated) return;

            syncWorker = new Worker('/worker/worker.js');
            workerStarted = true;
            hasrunned.current = true;
            syncWorker.postMessage('start');

            syncWorker.onmessage = (e) => {
                if (!Array.isArray(e.data.collectionarr) || e.data.collectionarr.length < 5) {
                    console.warn("Worker sync returned an unexpected payload shape");
                    return;
                }

                const watchingmap = e.data.collectionarr[0];
                const completedmap = e.data.collectionarr[1];
                const onholdmap = e.data.collectionarr[2];
                const droppedmap = e.data.collectionarr[3];
                const plantowatchmap = e.data.collectionarr[4];

                localStorage.setItem('Watching', JSON.stringify(Array.from(watchingmap)));
                localStorage.setItem('Completed', JSON.stringify(Array.from(completedmap)));
                localStorage.setItem('OnHold', JSON.stringify(Array.from(onholdmap)));
                localStorage.setItem('Dropped', JSON.stringify(Array.from(droppedmap)));
                localStorage.setItem('PlanToWatch', JSON.stringify(Array.from(plantowatchmap)));
            };
        });

        return () => {
            cancelled = true;
            // no terminate to help it persists across pages
        };
    }, []);

    return (
        <>
            {children}
        </>
    );
}
