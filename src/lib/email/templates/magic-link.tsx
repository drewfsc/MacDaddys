import {
  Button,
  Heading,
  Hr,
  Link,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface MagicLinkEmailProps {
  url: string;
  host: string;
}

export function MagicLinkEmail({ url, host }: MagicLinkEmailProps) {
  return (
    <BaseLayout previewText="Sign in to Mac Daddy's Diner">
      <Heading style={heading}>Sign In to Mac Daddy&apos;s</Heading>

      <Text style={paragraph}>
        Click the button below to sign in to your account at {host}. This magic link will expire in 15 minutes.
      </Text>

      <Button style={button} href={url}>
        SIGN IN TO MAC DADDY&apos;S
      </Button>

      <Hr style={hr} />

      <Text style={securityNote}>
        If you didn&apos;t request this email, you can safely ignore it. Someone may have typed your email address by mistake.
      </Text>

      <Text style={alternativeText}>
        Or copy and paste this URL into your browser:
      </Text>
      <Link href={url} style={urlLink}>
        {url}
      </Link>
    </BaseLayout>
  );
}

// Styles
const heading = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const paragraph = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'center' as const,
  margin: '0 0 32px',
};

const button = {
  backgroundColor: '#C41E3A',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'block',
  fontSize: '16px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  lineHeight: '100%',
  padding: '16px 32px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  margin: '0 auto 32px',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
};

const securityNote = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '22px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const alternativeText = {
  color: '#888888',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0 0 8px',
};

const urlLink = {
  color: '#C41E3A',
  fontSize: '12px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  display: 'block',
  textAlign: 'center' as const,
};

export default MagicLinkEmail;
