"use client";

import { toast } from "sonner";

/** Shared Aayna notifications. Appearance and position are configured globally. */
export const notify = {
  success: toast.success,
  error: toast.error,
  info: toast.info,
  warning: toast.warning,
  loading: toast.loading,
  dismiss: toast.dismiss,
  promise: toast.promise,
};
