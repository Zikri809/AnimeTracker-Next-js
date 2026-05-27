"use client";

import { useRouter as useCompatRouter } from "next/compat/router";
import { useRouter as useAppRouter, usePathname, useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export type CurrentRoute = {
  isReady: boolean;
  pathname: string;
  pathWithSearch: string;
  params: Record<string, string | undefined>;
  push: (href: string) => void;
  replace: (href: string) => void;
  refresh: () => void;
  hardReload: () => void;
};

export function useCurrentRoute(): CurrentRoute {
  const compatRouter = useCompatRouter();
  const appPathname = usePathname();
  const appParams = useParams();
  const appSearchParams = useSearchParams();
  const appRouter = useAppRouter();
  const compatAsPath = compatRouter?.asPath ?? "";
  const compatQuery = compatRouter?.query;
  const appSearch = appSearchParams?.toString() ?? "";

  const isReady = compatRouter ? compatRouter.isReady : true;

  const pathname = useMemo(() => {
    if (compatRouter) {
      return compatAsPath.split('?')[0];
    }
    return appPathname || '';
  }, [compatRouter, compatAsPath, appPathname]);

  const pathWithSearch = useMemo(() => {
    if (compatRouter) {
      return compatAsPath;
    }
    return appSearch ? `${appPathname || ''}?${appSearch}` : (appPathname || '');
  }, [compatRouter, compatAsPath, appPathname, appSearch]);

  const params: Record<string, string | undefined> = {};
  if (compatQuery) {
    Object.entries(compatQuery).forEach(([key, val]) => {
      if (typeof val === 'string') {
        params[key] = val;
      } else if (Array.isArray(val)) {
        params[key] = val[0];
      }
    });
  }
  if (appParams) {
    Object.entries(appParams).forEach(([key, val]) => {
      if (typeof val === 'string') {
        params[key] = val;
      } else if (Array.isArray(val)) {
        params[key] = val[0];
      }
    });
  }

  const push = (href: string) => {
    if (compatRouter) {
      compatRouter.push(href);
    } else if (appRouter) {
      appRouter.push(href);
    } else {
      window.location.href = href;
    }
  };

  const replace = (href: string) => {
    if (compatRouter) {
      compatRouter.replace(href);
    } else if (appRouter) {
      appRouter.replace(href);
    } else {
      window.location.replace(href);
    }
  };

  const refresh = () => {
    if (appRouter) {
      appRouter.refresh();
    } else if (compatRouter) {
      compatRouter.reload();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const hardReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return {
    isReady,
    pathname,
    pathWithSearch,
    params,
    push,
    replace,
    refresh,
    hardReload,
  };
}
