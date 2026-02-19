"use client";

import { useState } from "react";
import { Field, ErrorMessage } from "formik";
import { Eye, EyeOff } from "lucide-react";

/**
 * InputField Component
 * Text input with Formik integration and error display
 */
export const InputField = ({
    name,
    label,
    type = "text",
    placeholder = "",
    required = false,
    disabled = false,
    helperText = null,
    className = "",
    action = null, // Optional action button/element
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label and Action Header */}
            <div className="flex items-center justify-between">
                {label && (
                    <label
                        htmlFor={name}
                        className="block text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {label}
                        {required && (
                            <span className="ml-1" style={{ color: "var(--color-error)" }}>
                                *
                            </span>
                        )}
                    </label>
                )}
                {action && action}
            </div>

            {/* Input Wrapper */}
            <div className="relative">
                <Field name={name}>
                    {({ field, meta }) => (
                        <div className="relative group">
                            <input
                                {...field}
                                {...props}
                                id={name}
                                type={inputType}
                                placeholder={placeholder}
                                disabled={disabled}
                                className={`
                                    w-full px-4 py-2.5 rounded-lg text-sm
                                    transition-all duration-200
                                    focus:outline-none focus:ring-2
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    ${meta.touched && meta.error ? "ring-2" : ""}
                                    ${isPassword ? "pr-11" : ""}
                                `}
                                style={{
                                    backgroundColor: "var(--color-background-elevated)",
                                    color: "var(--color-text-primary)",
                                    borderWidth: "1px",
                                    borderColor:
                                        meta.touched && meta.error
                                            ? "var(--color-error)"
                                            : "var(--color-border)",
                                    ...(meta.touched && meta.error
                                        ? {
                                              "--tw-ring-color": "var(--color-error)",
                                              "--tw-ring-opacity": "0.3",
                                          }
                                        : {
                                              "--tw-ring-color": "var(--color-primary)",
                                              "--tw-ring-opacity": "0.3",
                                          }),
                                }}
                            />

                            {/* Password Toggle Icon */}
                            {isPassword && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-[var(--color-hover)] text-[var(--color-text-secondary)]"
                                    tabIndex="-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            )}
                        </div>
                    )}
                </Field>
            </div>

            {/* Helper Text */}
            {helperText && (
                <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    {helperText}
                </p>
            )}

            {/* Error Message */}
            <ErrorMessage name={name}>
                {(msg) => (
                    <p
                        className="text-xs font-medium flex items-center gap-1"
                        style={{ color: "var(--color-error)" }}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        {msg}
                    </p>
                )}
            </ErrorMessage>
        </div>
    );
};

