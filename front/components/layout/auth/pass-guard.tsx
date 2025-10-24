"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  barColor: string;
}

interface PassGuardProps {
  password: string;
  showStrength?: boolean;
  showRequirements?: boolean;
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
}

export function PassGuard({
  password,
  showStrength = true,
  showRequirements = true,
  minLength = 8,
  requireUppercase = true,
  requireLowercase = true,
  requireNumber = true,
  requireSpecialChar = true,
}: PassGuardProps) {
  const requirements = useMemo<PasswordRequirement[]>(() => {
    const reqs: PasswordRequirement[] = [];

    reqs.push({
      label: `At least ${minLength} characters`,
      met: password.length >= minLength,
    });

    if (requireUppercase) {
      reqs.push({
        label: "One uppercase letter",
        met: /[A-Z]/.test(password),
      });
    }

    if (requireLowercase) {
      reqs.push({
        label: "One lowercase letter",
        met: /[a-z]/.test(password),
      });
    }

    if (requireNumber) {
      reqs.push({
        label: "One number",
        met: /\d/.test(password),
      });
    }

    if (requireSpecialChar) {
      reqs.push({
        label: "One special character",
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      });
    }

    return reqs;
  }, [password, minLength, requireUppercase, requireLowercase, requireNumber, requireSpecialChar]);

  const strength = useMemo<PasswordStrength>(() => {
    if (!password) {
      return { score: 0, label: "", color: "", barColor: "" };
    }

    const metCount = requirements.filter((req) => req.met).length;
    const totalCount = requirements.length;
    const percentage = (metCount / totalCount) * 100;

    if (percentage === 100) {
      return {
        score: 100,
        label: "Strong",
        color: "text-green-600 dark:text-green-500",
        barColor: "bg-green-600 dark:bg-green-500"
      };
    } else if (percentage >= 60) {
      return {
        score: percentage,
        label: "Medium",
        color: "text-yellow-600 dark:text-yellow-500",
        barColor: "bg-yellow-600 dark:bg-yellow-500"
      };
    } else {
      return {
        score: percentage,
        label: "Weak",
        color: "text-red-600 dark:text-red-500",
        barColor: "bg-red-600 dark:bg-red-500"
      };
    }
  }, [password, requirements]);

  if (!password) return null;

  return (
    <div className="space-y-3">
      {showStrength && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Password strength</span>
            <span className={cn("font-medium", strength.color)}>
              {strength.label}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full transition-all duration-300", strength.barColor)}
              style={{ width: `${strength.score}%` }}
            />
          </div>
        </div>
      )}

      {showRequirements && (
        <div className="space-y-2">
          {requirements.map((req, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm"
            >
              {req.met ? (
                <Check className="h-4 w-4 text-green-600 dark:text-green-500 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <span
                className={cn(
                  "transition-colors",
                  req.met
                    ? "text-green-600 dark:text-green-500"
                    : "text-muted-foreground"
                )}
              >
                {req.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to check if password meets all requirements
export function isPasswordValid(
  password: string,
  options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecialChar?: boolean;
  }
): boolean {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecialChar = true,
  } = options || {};

  if (password.length < minLength) return false;
  if (requireUppercase && !/[A-Z]/.test(password)) return false;
  if (requireLowercase && !/[a-z]/.test(password)) return false;
  if (requireNumber && !/\d/.test(password)) return false;
  if (requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;

  return true;
}
