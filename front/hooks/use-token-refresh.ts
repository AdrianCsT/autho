"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";

const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes (access token expires in 15)

export function useTokenRefresh() {
  const { isAuthenticated, refreshSession } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Set up automatic token refresh
    intervalRef.current = setInterval(() => {
      refreshSession();
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, refreshSession]);
}
