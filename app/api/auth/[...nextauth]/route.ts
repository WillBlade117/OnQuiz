import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { db } from "../../../../lib/db";
import { logAction } from "../../../../lib/logger";
import { RowDataPacket } from "mysql2";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "discord") {
        try {
          const [existingUsers] = await db.execute<RowDataPacket[]>(
            "SELECT id, is_banned FROM users WHERE provider_account_id = ?",
            [account.providerAccountId]
          );

          if (existingUsers.length > 0) {
            if (existingUsers[0].is_banned === 1) {
              return "/banni"; 
            }
          } else {
            const [result] = await db.execute(
              "INSERT INTO users (name, email, image, provider, provider_account_id) VALUES (?, ?, ?, ?, ?)",
              [user.name, user.email, user.image, "discord", account.providerAccountId]
            );
            const newUserId = (result as any).insertId;
            await logAction(newUserId, "USER_REGISTER", null, "Inscription via Discord");
          }
          return true;
        } catch (error) {
          console.error("Erreur enregistrement user:", error);
          return false;
        }
      }
      return true;
    },
    
    async jwt({ token, user }) {
      if (token.email) {
        try {
          const [dbUsers] = await db.execute<RowDataPacket[]>(
            "SELECT role FROM users WHERE email = ?",
            [token.email]
          );
          if (dbUsers.length > 0) {
            token.role = dbUsers[0].role;
          }
        } catch (error) {
          console.error("Erreur récupération rôle:", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    }
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };