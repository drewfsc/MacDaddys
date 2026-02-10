import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize SES client - will be null during build if credentials not set
export const sesClient = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  ? new SESClient({
      region: process.env.AWS_SES_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

export const EMAIL_FROM = process.env.EMAIL_FROM || "Mac Daddy's Diner <hello@macdaddysdiner.com>";

// Email sending utility
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!sesClient) {
    console.error('AWS SES credentials are not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const command = new SendEmailCommand({
      Source: EMAIL_FROM,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const response = await sesClient.send(command);
    return { success: true, data: { messageId: response.MessageId } };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
