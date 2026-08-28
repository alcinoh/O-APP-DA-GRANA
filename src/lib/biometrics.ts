/**
 * WebAuthn Biometric & Device Security Helper
 */

// Helper to convert string to ArrayBuffer
function stringToBuffer(str: string): ArrayBuffer {
  const enc = new TextEncoder().encode(str);
  const buf = new Uint8Array(enc.length);
  buf.set(enc);
  return buf.buffer;
}

// Helper to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function isBiometricsAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!window.PublicKeyCredential) return false;

  try {
    const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch {
    return false;
  }
}

export async function registerBiometricCredential(userId: string, userName: string): Promise<string> {
  if (!window.PublicKeyCredential) {
    throw new Error('WebAuthn não é suportado neste navegador.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'Assessoria Financeira',
      id: window.location.hostname || 'localhost',
    },
    user: {
      id: stringToBuffer(userId),
      name: userName || 'Usuario',
      displayName: userName || 'Usuário Assessoria',
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' }, // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'preferred',
      requireResidentKey: false,
    },
    timeout: 60000,
    attestation: 'none',
  };

  const credential = (await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions,
  })) as PublicKeyCredential;

  if (!credential) {
    throw new Error('Não foi possível gerar a credencial biométrica.');
  }

  return bufferToBase64(credential.rawId);
}

export async function verifyBiometricCredential(credentialIdBase64?: string): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    throw new Error('WebAuthn não é suportado.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const allowCredentials: PublicKeyCredentialDescriptor[] = [];
  if (credentialIdBase64) {
    try {
      allowCredentials.push({
        id: base64ToBuffer(credentialIdBase64),
        type: 'public-key',
        transports: ['internal'],
      });
    } catch (e) {
      console.warn('Erro ao processar credentialId armazenado:', e);
    }
  }

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    timeout: 60000,
    userVerification: 'preferred',
    rpId: window.location.hostname || 'localhost',
    allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
  };

  const assertion = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
  });

  return !!assertion;
}
