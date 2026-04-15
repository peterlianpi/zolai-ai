import { buildSecurityEmailHtml } from '@/lib/email';

export function suspiciousLoginEmail(location: string, riskScore: number, confirmUrl: string, _denyUrl: string): string {
  return buildSecurityEmailHtml(
    'Suspicious Login Detected',
    `
      <p>We detected a login to your account from <strong>${location}</strong>.</p>
      <p><strong>Risk Score:</strong> ${riskScore}/100</p>
      <p>If this was you, you can confirm this login. If not, we recommend changing your password immediately.</p>
      <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 3px;">
        <strong>⚠️ Important:</strong> Never share your password or 2FA codes with anyone.
      </div>
    `,
    confirmUrl,
    'Confirm This Login'
  );
}

export function accountLockedEmail(unlockTime: Date): string {
  return buildSecurityEmailHtml(
    'Account Locked',
    `
      <p>Your account has been locked due to too many failed login attempts.</p>
      <p><strong>Automatic Unlock:</strong> ${unlockTime.toLocaleString()}</p>
      <p>If you didn't attempt to log in, your account may be compromised. Please:</p>
      <ol>
        <li>Change your password when the account unlocks</li>
        <li>Enable two-factor authentication</li>
        <li>Review your active sessions</li>
      </ol>
    `
  );
}

export function deviceRevokedEmail(deviceName?: string): string {
  return buildSecurityEmailHtml(
    'Session Revoked',
    `
      <p>A session on your account has been revoked.</p>
      ${deviceName ? `<p><strong>Device:</strong> ${deviceName}</p>` : ''}
      <p>If you did not revoke this session, your account may be compromised. Please:</p>
      <ol>
        <li>Change your password immediately</li>
        <li>Review all active sessions</li>
        <li>Enable two-factor authentication if not already enabled</li>
      </ol>
    `
  );
}

export function passwordChangedEmail(): string {
  return buildSecurityEmailHtml(
    'Password Changed',
    `
      <p>Your password has been successfully changed.</p>
      <p>If you did not make this change, please contact support immediately.</p>
    `
  );
}

export function emailChangedEmail(newEmail: string): string {
  return buildSecurityEmailHtml(
    'Email Address Changed',
    `
      <p>Your email address has been changed to <strong>${newEmail}</strong>.</p>
      <p>If you did not make this change, please contact support immediately.</p>
      <div style="margin: 20px 0; padding: 15px; background: #f8d7da; border-left: 4px solid #dc3545; border-radius: 3px;">
        <strong>🚨 Alert:</strong> This is a critical account change. If unauthorized, contact support now.
      </div>
    `
  );
}

export function twoFactorEnabledEmail(): string {
  return buildSecurityEmailHtml(
    'Two-Factor Authentication Enabled',
    `
      <p>Two-factor authentication has been enabled on your account.</p>
      <p>You will now need to provide a code from your authenticator app when logging in.</p>
      <p><strong>Save your backup codes in a safe place.</strong> You can use them to access your account if you lose access to your authenticator app.</p>
    `
  );
}

export function twoFactorDisabledEmail(): string {
  return buildSecurityEmailHtml(
    'Two-Factor Authentication Disabled',
    `
      <p>Two-factor authentication has been disabled on your account.</p>
      <p>If you did not disable this, your account may be compromised. Please:</p>
      <ol>
        <li>Change your password immediately</li>
        <li>Re-enable two-factor authentication</li>
        <li>Review all active sessions</li>
      </ol>
    `
  );
}
