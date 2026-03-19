import { db, githubUsers } from "@github-token/db";
import { env } from "@github-token/env/server";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure, router } from "../index";

const githubProfileSchema = z.object({
  id: z.number(),
  login: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  avatar_url: z.string().url(),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  blog: z.string().nullable().optional(),
  public_repos: z.number(),
  followers: z.number(),
  following: z.number(),
});

async function fetchAndSaveGithubUser(token: string) {
  const githubResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "github-token-app",
    },
  });

  if (!githubResponse.ok) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "GitHub token 无效或没有权限访问用户信息",
    });
  }

  const profile = githubProfileSchema.parse(await githubResponse.json());

  const [savedUser] = await db
    .insert(githubUsers)
    .values({
      githubId: profile.id,
      login: profile.login,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      location: profile.location,
      website: profile.blog || null,
      repos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
    })
    .onConflictDoUpdate({
      target: githubUsers.githubId,
      set: {
        login: profile.login,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        website: profile.blog || null,
        repos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
      },
    })
    .returning();

  return savedUser;
}

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),

  githubUsers: router({
    list: publicProcedure.query(async () => {
      return await db.select().from(githubUsers).orderBy(desc(githubUsers.createdAt));
    }),

    saveFromToken: publicProcedure
      .input(
        z.object({
          token: z.string().min(1, "GitHub token 不能为空"),
        }),
      )
      .mutation(async ({ input }) => {
        return await fetchAndSaveGithubUser(input.token);
      }),

    syncDefaultUser: publicProcedure.mutation(async () => {
      if (!env.GITHUB_TOKEN) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "服务端未配置默认 GITHUB_TOKEN",
        });
      }

      return await fetchAndSaveGithubUser(env.GITHUB_TOKEN);
    }),

    delete: publicProcedure
      .input(
        z.object({
          id: z.number(),
        }),
      )
      .mutation(async ({ input }) => {
        const [deletedUser] = await db
          .delete(githubUsers)
          .where(eq(githubUsers.id, input.id))
          .returning();

        if (!deletedUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "要删除的用户不存在",
          });
        }

        return { success: true };
      }),
  }),
});
export type AppRouter = typeof appRouter;
