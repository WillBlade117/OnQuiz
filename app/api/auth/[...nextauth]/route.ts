import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { db } from "../../../../lib/db";
import { RowDataPacket } from "mysql2";

// On stocke la configuration dans une variable exportée
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
            "SELECT id FROM users WHERE provider_account_id = ?",
            [account.providerAccountId]
          );

          if (existingUsers.length === 0) {
            await db.execute(
              "INSERT INTO users (name, email, image, provider, provider_account_id) VALUES (?, ?, ?, ?, ?)",
              [user.name, user.email, user.image, "discord", account.providerAccountId]
            );
          }
          return true;
        } catch (error) {
          console.error("Erreur enregistrement user:", error);
          return false;
        }
      }
      return true;
    },
  },
};

// On initialise NextAuth avec ces options
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };