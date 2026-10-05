export type VerifyPinSuccess = {
  success: true;
  redirectUrl: string;
};

export type VerifyPinFailure = {
  success: false;
  error: string;
  remainingAttempts?: number;
};

export type VerifyPinResult = VerifyPinSuccess | VerifyPinFailure;
