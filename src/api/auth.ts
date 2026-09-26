import { apiClient } from './client';
import type { User, OTPPurpose } from '../types';

export interface OTPResponse {
  message:   string;
  expiresIn: number;
  devOtp?:   string;   // only present in development
}

// ── Sign Up ───────────────────────────────────────────────────────────────────

export async function requestSignupOTP(payload: {
  name:           string;
  email:          string;
  mobile:         string;
  deliveryMethod: 'email';
}): Promise<OTPResponse> {
  const { data } = await apiClient.post('/auth/request-otp', {
    ...payload,
    purpose: 'signup',
  });
  return data as OTPResponse;
}

// ── Sign In ───────────────────────────────────────────────────────────────────

export async function requestSigninOTP(payload: {
  identifier:     string;   // email or mobile
  deliveryMethod: 'email';
}): Promise<OTPResponse> {
  const { data } = await apiClient.post('/auth/request-otp', {
    ...payload,
    purpose: 'signin',
  });
  return data as OTPResponse;
}

// ── Verify OTP ────────────────────────────────────────────────────────────────

export async function verifyOTP(payload: {
  identifier: string;
  code:       string;
  purpose:    OTPPurpose;
}) {
  const { data } = await apiClient.post('/auth/verify-otp', payload);
  return data as { user: User; message: string };
}

// ── Session ───────────────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const { data } = await apiClient.get('/auth/me');
  return data as { user: User };
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

// ── Available methods — always email only ─────────────────────────────────────

export async function getAvailableMethods() {
  try {
    const { data } = await apiClient.get('/auth/available-methods');
    return data as { emailEnabled: boolean; smsEnabled: boolean };
  } catch {
    return { emailEnabled: true, smsEnabled: false };
  }
}
