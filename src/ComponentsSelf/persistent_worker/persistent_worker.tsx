"use client";

import { parseCookies } from "nookies";
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

        const cookies = parseCookies({});
        if (!cookies.expires_in) return;

        const expiry_date = new Date(cookies.expires_in);
        if (isNaN(expiry_date.getTime())) return;

        const internaldeadline = new Date(cookies.expires_in);
        internaldeadline.setDate(expiry_date.getDate() - 2);

        const current_date = new Date();

        if (current_date.getTime() >= expiry_date.getTime()) {
            return;
        }

        syncWorker = new Worker('/worker/worker.js');
        workerStarted = true;
        hasrunned.current = true;
        syncWorker.postMessage('start');

        syncWorker.onmessage = (e) => {
            console.log('data is passed from the worker', e.data.collectionarr);
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

        return () => {
            // no terminate to help it persists across pages
        };
    }, []);

    return (
        <>
            {children}
        </>
    );
}
