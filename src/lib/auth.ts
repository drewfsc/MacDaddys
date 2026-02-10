import NextAuth from "next-auth";
import type { EmailConfig } from "next-auth/providers";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import { sesClient, EMAIL_FROM } from "./ses";
import { MagicLinkEmail } from "./email/templates/magic-link";
import { render } from "@react-email/components";
import { v4 as uuidv4 } from "uuid";
import { SendEmailCommand } from "@aws-sdk/client-ses";

const uri = process.env.MONGODB_URI!;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

// Extend global type
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Default notification preferences for new users
const defaultNotificationPreferences = {
  dailySpecials: true,
  eventsAnnouncements: true,
  feedbackReplies: true,
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB,
  }),
  providers: [
    {
      id: "email",
      type: "email",
      name: "Email",
      from: EMAIL_FROM,
      maxAge: 15 * 60, // 15 minutes
      async sendVerificationRequest({ identifier: email, url }) {
        const { host } = new URL(url);

        try {
          if (!sesClient) {
            throw new Error("AWS SES credentials are not configured");
          }

          // Render the React email template to HTML
          const html = await render(MagicLinkEmail({ url, host }));

          const command = new SendEmailCommand({
            Source: EMAIL_FROM,
            Destination: {
              ToAddresses: [email],
            },
            Message: {
              Subject: {
                Data: "Sign in to Mac Daddy's Diner",
                Charset: "UTF-8",
              },
              Body: {
                Html: {
                  Data: html,
                  Charset: "UTF-8",
                },
              },
            },
          });

          await sesClient.send(command);
        } catch (error) {
          console.error("Error sending magic link email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    } satisfies EmailConfig,
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      // Refresh user data on session update
      if (trigger === "update" && token.email) {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const dbUser = await db.collection("users").findOne({ email: token.email });
        if (dbUser) {
          token.name = dbUser.name;
          token.notificationPreferences = dbUser.notificationPreferences;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Add default notification preferences and unsubscribe token for new users
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB);

      await db.collection("users").updateOne(
        { email: user.email },
        {
          $set: {
            notificationPreferences: defaultNotificationPreferences,
            unsubscribeToken: uuidv4(),
            updatedAt: new Date(),
          },
        }
      );

      // Also add to subscribers collection for mailing list
      await db.collection("subscribers").updateOne(
        { email: user.email },
        {
          $set: {
            email: user.email,
            name: user.name || user.email?.split("@")[0],
            subscribedAt: new Date(),
            source: "magic-link-signup",
            preferences: defaultNotificationPreferences,
            unsubscribeToken: uuidv4(),
          },
        },
        { upsert: true }
      );
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  trustHost: true,
});
