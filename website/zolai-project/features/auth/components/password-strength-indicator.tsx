"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordStrengthIndicatorProps {
  password: string;
  oldPassword?: string;
  name?: string;
  email?: string;
  className?: string;
}

const commonPasswords = [
  "password",
  "123456",
  "123456789",
  "qwerty",
  "abc123",
  "password123",
  "admin",
  "letmein",
  "welcome",
  "monkey",
  "dragon",
];

export function PasswordStrengthIndicator({
  password,
  oldPassword,
  name,
  email,
  className,
}: PasswordStrengthIndicatorProps) {
  const isSameAsOld = oldPassword ? password === oldPassword : false;
  const containsName = name && password.toLowerCase().includes(name.toLowerCase());
  const containsEmail = email && password.toLowerCase().includes(email.split('@')[0].toLowerCase());

  const checks = React.useMemo(
    () => ({
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
      notSameAsOld: !isSameAsOld,
      notRelatedToPersonal: !containsName && !containsEmail,
    }),
    [password, isSameAsOld, containsName, containsEmail]
  );

  const isCommon =
    commonPasswords.includes(password.toLowerCase()) && password.length > 0;

  const score = Object.values(checks).filter(Boolean).length;
  const strength =
    isCommon || score < 4 ? "weak" : score < 6 ? "medium" : "strong";

  const strengthColors = {
    weak: "bg-red-500",
    medium: "bg-yellow-500",
    strong: "bg-green-500",
  };

  const strengthTexts = {
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
  };

  const showChecklist = password.length > 0 && strength !== "strong";

  if (password.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("space-y-2", className)}
      role="region"
      aria-label="Password strength indicator"
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              strengthColors[strength]
            )}
            style={{ width: `${(score / 6) * 100}%` }}
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={6}
            aria-label={`Password strength: ${strengthTexts[strength]}`}
          />
        </div>
        <span className="text-sm font-medium" aria-live="polite">
          {strengthTexts[strength]}
        </span>
      </div>

      {showChecklist && (
        <ul
          className="text-sm space-y-1"
          aria-label="Password requirements checklist"
        >
          <li
            className="flex items-center gap-2"
            aria-label={`At least 12 characters: ${
              checks.length ? "met" : "not met"
            }`}
          >
            {checks.length ? (
              <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
            ) : (
              <X className="w-4 h-4 text-red-500" aria-hidden="true" />
            )}
            At least 12 characters
          </li>
          <li
            className="flex items-center gap-2"
            aria-label={`Uppercase letter: ${
              checks.uppercase ? "met" : "not met"
            }`}
          >
            {checks.uppercase ? (
              <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
            ) : (
              <X className="w-4 h-4 text-red-500" aria-hidden="true" />
            )}
            One uppercase letter
          </li>
          <li
            className="flex items-center gap-2"
            aria-label={`Lowercase letter: ${
              checks.lowercase ? "met" : "not met"
            }`}
          >
            {checks.lowercase ? (
              <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
            ) : (
              <X className="w-4 h-4 text-red-500" aria-hidden="true" />
            )}
            One lowercase letter
          </li>
          <li
            className="flex items-center gap-2"
            aria-label={`Number: ${checks.number ? "met" : "not met"}`}
          >
            {checks.number ? (
              <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
            ) : (
              <X className="w-4 h-4 text-red-500" aria-hidden="true" />
            )}
            One number
          </li>
          <li
            className="flex items-center gap-2"
            aria-label={`Special character: ${
              checks.symbol ? "met" : "not met"
            }`}
          >
            {checks.symbol ? (
              <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
            ) : (
              <X className="w-4 h-4 text-red-500" aria-hidden="true" />
            )}
            One special character
          </li>
          {isCommon && (
            <li
              className="flex items-center gap-2 text-red-500"
              aria-label="Password is commonly used"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              Password is commonly used
            </li>
          )}
          {isSameAsOld && (
            <li
              className="flex items-center gap-2 text-red-500"
              aria-label="New password must be different from current password"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              New password must be different from current password
            </li>
          )}
          {(containsName || containsEmail) && (
            <li
              className="flex items-center gap-2 text-red-500"
              aria-label="Password should not contain personal information"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              Password should not contain personal information
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
