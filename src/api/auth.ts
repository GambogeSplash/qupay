import { apiClient } from './client';
import type {
  InitiateRegistrationRequest,
  CompleteRegistrationRequest,
  LoginRequest,
  AuthTokenResponse,
  OtpInitiatedResponse,
  RefreshTokenRequest,
  ResendOtpRequest,
  LogoutRequest,
  InitiatePasswordResetRequest,
  CompletePasswordResetRequest,
  UserProfileResponse,
  SetPinRequest,
  VerifyPinRequest,
  VerifyPinResponse,
  ChangePinRequest,
  CompletePinResetRequest,
} from '../types/auth';

// ─── Mock mode ───────────────────────────────────────────────
// The Heroku backend is not reliably available for prototype use.
// When MOCK_API is true, every auth function returns a fake response
// after a short delay so the full app works offline.
// TODO: set to false when backend is live.
const MOCK_API = true;
const delay = (ms = 600) => new Promise<void>((r) => setTimeout(r, ms));

// Stateful mock — tracks whether PIN has been set this session
let mockPinSet = false;

const MOCK_TOKENS: AuthTokenResponse = {
  accessToken: 'mock-access-token-xyz',
  refreshToken: 'mock-refresh-token-xyz',
  user: {
    id: 'usr_mock_001',
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@qupay.app',
    phoneNumber: '+65 9123 4567',
    emailVerified: true,
    phoneVerified: true,
    pinSet: false,
  },
} as AuthTokenResponse;

const MOCK_OTP: OtpInitiatedResponse = {
  cooldownSeconds: 60,
} as OtpInitiatedResponse;

export async function initiateRegistration(
  request: InitiateRegistrationRequest
): Promise<OtpInitiatedResponse> {
  if (MOCK_API) { await delay(); return MOCK_OTP; }
  const response = await apiClient.post<OtpInitiatedResponse>('/v1/auth/register/initiate', request);
  return response.data;
}

export async function completeRegistration(
  request: CompleteRegistrationRequest
): Promise<AuthTokenResponse> {
  if (MOCK_API) { await delay(); return MOCK_TOKENS; }
  const response = await apiClient.post<AuthTokenResponse>('/v1/auth/register/complete', request);
  return response.data;
}

export async function login(request: LoginRequest): Promise<AuthTokenResponse> {
  if (MOCK_API) { await delay(); mockPinSet = true; return MOCK_TOKENS; }
  const response = await apiClient.post<AuthTokenResponse>('/v1/auth/login', request);
  return response.data;
}

export async function refreshToken(
  request: RefreshTokenRequest
): Promise<AuthTokenResponse> {
  if (MOCK_API) { await delay(); return MOCK_TOKENS; }
  const response = await apiClient.post<AuthTokenResponse>('/v1/auth/token/refresh', request);
  return response.data;
}

export async function resendOtp(
  request: ResendOtpRequest
): Promise<OtpInitiatedResponse> {
  if (MOCK_API) { await delay(); return MOCK_OTP; }
  const response = await apiClient.post<OtpInitiatedResponse>('/v1/auth/otp/resend', request);
  return response.data;
}

export async function serverLogout(request: LogoutRequest): Promise<void> {
  if (MOCK_API) { await delay(300); return; }
  await apiClient.post('/v1/auth/logout', request);
}

export async function initiatePasswordReset(
  request: InitiatePasswordResetRequest
): Promise<OtpInitiatedResponse> {
  if (MOCK_API) { await delay(); return MOCK_OTP; }
  const response = await apiClient.post<OtpInitiatedResponse>('/v1/auth/password/reset/initiate', request);
  return response.data;
}

export async function completePasswordReset(
  request: CompletePasswordResetRequest
): Promise<void> {
  if (MOCK_API) { await delay(); return; }
  await apiClient.post('/v1/auth/password/reset/complete', request);
}

export async function getProfile(): Promise<UserProfileResponse> {
  if (MOCK_API) { await delay(300); return { ...MOCK_TOKENS.user, pinSet: mockPinSet } as unknown as UserProfileResponse; }
  const response = await apiClient.get<UserProfileResponse>('/v1/users/me');
  return response.data;
}

export async function setPin(request: SetPinRequest): Promise<void> {
  if (MOCK_API) { await delay(); mockPinSet = true; return; }
  await apiClient.post('/v1/users/me/pin', request);
}

export async function verifyPin(request: VerifyPinRequest): Promise<VerifyPinResponse> {
  if (MOCK_API) { await delay(); return { valid: true } as VerifyPinResponse; }
  const response = await apiClient.post<VerifyPinResponse>('/v1/users/me/pin/verify', request);
  return response.data;
}

export async function changePin(request: ChangePinRequest): Promise<void> {
  if (MOCK_API) { await delay(); return; }
  await apiClient.put('/v1/users/me/pin', request);
}

export async function initiatePinReset(): Promise<OtpInitiatedResponse> {
  if (MOCK_API) { await delay(); return MOCK_OTP; }
  const response = await apiClient.post<OtpInitiatedResponse>('/v1/users/me/pin/reset/initiate');
  return response.data;
}

export async function completePinReset(request: CompletePinResetRequest): Promise<void> {
  if (MOCK_API) { await delay(); return; }
  await apiClient.post('/v1/users/me/pin/reset/complete', request);
}
