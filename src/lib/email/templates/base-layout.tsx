import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BaseLayoutProps {
  previewText: string;
  children: React.ReactNode;
  unsubscribeUrl?: string;
}

export function BaseLayout({ previewText, children, unsubscribeUrl }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://macdaddysdiner.com/images/logo.avif"
              width="80"
              height="80"
              alt="Mac Daddy's Diner"
              style={logo}
            />
            <Text style={headerText}>MAC DADDY&apos;S DINER</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Mac Daddy&apos;s Diner<br />
              Route 28, Your Town, USA
            </Text>
            <Text style={footerLinks}>
              <Link href="https://macdaddysdiner.com" style={footerLink}>
                Visit Website
              </Link>
              {' | '}
              <Link href="https://macdaddysdiner.com/account/preferences" style={footerLink}>
                Manage Preferences
              </Link>
              {unsubscribeUrl && (
                <>
                  {' | '}
                  <Link href={unsubscribeUrl} style={footerLink}>
                    Unsubscribe
                  </Link>
                </>
              )}
            </Text>
            <Text style={copyright}>
              &copy; {new Date().getFullYear()} Mac Daddy&apos;s Diner. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#FFF8E7',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const header = {
  textAlign: 'center' as const,
  padding: '32px 20px',
  backgroundColor: '#1a1a1a',
  borderRadius: '8px 8px 0 0',
};

const logo = {
  margin: '0 auto 12px',
  borderRadius: '8px',
};

const headerText = {
  color: '#C41E3A',
  fontSize: '24px',
  fontWeight: 'bold',
  letterSpacing: '3px',
  margin: '0',
};

const content = {
  padding: '32px 24px',
  backgroundColor: '#ffffff',
};

const footer = {
  textAlign: 'center' as const,
  padding: '24px',
  backgroundColor: '#1a1a1a',
  borderRadius: '0 0 8px 8px',
};

const footerText = {
  color: '#ffffff',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const footerLinks = {
  color: '#888888',
  fontSize: '12px',
  margin: '0 0 12px',
};

const footerLink = {
  color: '#C41E3A',
  textDecoration: 'none',
};

const copyright = {
  color: '#666666',
  fontSize: '11px',
  margin: '0',
};

export default BaseLayout;
