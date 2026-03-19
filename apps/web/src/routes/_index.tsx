import { Button } from "@github-token/ui/components/button";
import { Input } from "@github-token/ui/components/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link2, Mail, MapPin, Search, TrendingUp } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { queryClient, trpc } from "@/utils/trpc";

import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GitHub 用户信息管理" },
    { name: "description", content: "GitHub token user dashboard" },
  ];
}

export default function Home() {
  const usersQuery = useQuery(trpc.githubUsers.list.queryOptions());
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState<"latest" | "popular">("latest");

  const saveProfileMutation = useMutation(
    trpc.githubUsers.saveFromToken.mutationOptions({
      onSuccess: async () => {
        setToken("");
        await queryClient.invalidateQueries(trpc.githubUsers.list.queryFilter());
        toast.success("GitHub 用户信息已保存");
      },
    }),
  );

  const deleteProfileMutation = useMutation(
    trpc.githubUsers.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.githubUsers.list.queryFilter());
        toast.success("用户记录已删除");
      },
    }),
  );

  function formatCompactNumber(value: number) {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1).replace(".0", "")}k`;
    }

    return String(value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token.trim()) {
      return;
    }

    saveProfileMutation.mutate({ token: token.trim() });
  }

  async function handleRefresh() {
    await usersQuery.refetch();
    toast.success("列表已刷新");
  }

  function handleDelete(id: number) {
    deleteProfileMutation.mutate({ id });
  }

  const users = usersQuery.data ?? [];
  const displayedUsers =
    activeTab === "latest" ? users : [...users].sort((a, b) => b.followers - a.followers);

  return (
    <main className="min-h-full bg-[#f4f2f1] text-[#1f2738]">
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-14 px-5 py-9 md:px-8 md:py-10">
        <section className="rounded-[22px] border border-[#f1ddd1] bg-white px-5 py-5 shadow-[0_16px_35px_rgba(223,169,133,0.16)] md:px-6 md:py-6">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <h2 className="text-[1.05rem] font-semibold text-[#4c5871]">
                GitHub Personal Access Token
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex items-center gap-3 rounded-[16px] border border-[#f0cdbd] bg-[#f7f9fc] px-4 py-4">
                <Search className="size-5 text-[#94a3b8]" />
                <Input
                  aria-label="GitHub Token"
                  className="h-auto border-0 bg-transparent px-0 py-0 text-base text-[#6b778f] shadow-none ring-0 placeholder:text-[#8994a8] focus-visible:border-0 focus-visible:ring-0"
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  type="password"
                  value={token}
                />
              </div>

              <Button
                className="h-14 w-full rounded-[14px] bg-[#ff5c08] text-xl font-semibold text-white shadow-[0_12px_22px_rgba(255,92,8,0.28)] hover:bg-[#f05400]"
                disabled={!token.trim() || saveProfileMutation.isPending}
                type="submit"
              >
                {saveProfileMutation.isPending ? "输入中..." : "输入"}
              </Button>
            </form>
          </div>
        </section>

        <section className="space-y-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-[2.1rem] font-semibold tracking-tight text-[#1e2435]">
              github用户
            </h2>

            <div className="flex items-center gap-3">
              <Button
                className="h-10 rounded-[12px] bg-[#1f2738] px-4 text-sm font-semibold text-white hover:bg-[#141b29]"
                disabled={usersQuery.isFetching}
                onClick={handleRefresh}
                type="button"
              >
                {usersQuery.isFetching ? "刷新中..." : "刷新"}
              </Button>
            </div>
          </div>

          {usersQuery.isLoading ? (
            <div className="rounded-[22px] border border-[#e8e2db] bg-white px-6 py-14 text-center text-base text-[#7b8598] shadow-[0_8px_18px_rgba(31,39,56,0.08)]">
              Loading saved profiles...
            </div>
          ) : null}

          {usersQuery.isError ? (
            <div className="rounded-[22px] border border-[#f4c7b5] bg-[#fff7f3] px-6 py-5 text-sm text-[#c04c1b] shadow-[0_8px_18px_rgba(31,39,56,0.08)]">
              读取已保存用户失败，请检查后端服务、数据库连接和接口配置。
            </div>
          ) : null}

          <div className="space-y-6">
            {displayedUsers.length > 0 ? (
              displayedUsers.map((user) => (
                <article
                  key={user.id}
                  className="rounded-[22px] border border-[#e8e2db] bg-white px-5 py-5 shadow-[0_8px_18px_rgba(31,39,56,0.08)] md:px-6 md:py-6"
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-5">
                        <img
                          alt={user.login}
                          className="h-[92px] w-[92px] rounded-[18px] object-cover shadow-sm"
                          src={user.avatarUrl || "https://avatars.githubusercontent.com/u/9919?s=200&v=4"}
                        />

                        <div className="space-y-2 pt-1">
                          <div>
                            <h3 className="text-[2rem] font-semibold leading-none text-[#1f2738]">
                              {user.name || user.login}
                            </h3>
                            <p className="mt-2 text-lg font-medium text-[#ff6a1b]">@{user.login}</p>
                          </div>
                          <p className="max-w-[580px] text-[1.03rem] leading-7 text-[#68758f]">
                            {user.bio || "This GitHub user has not added a public bio yet."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Button
                          className="h-11 rounded-[14px] border border-[#ffd4c0] bg-white px-4 text-sm font-semibold text-[#ff6a1b] hover:bg-[#fff5ef]"
                          onClick={() => window.open(`https://github.com/${user.login}`, "_blank")}
                          type="button"
                        >
                          View on GitHub
                        </Button>
                        <Button
                          className="h-11 rounded-[14px] bg-[#fff1eb] px-4 text-sm font-semibold text-[#ef5a2a] hover:bg-[#ffe5d9]"
                          disabled={deleteProfileMutation.isPending}
                          onClick={() => handleDelete(user.id)}
                          type="button"
                        >
                          删除
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 border-y border-[#edf0f5] py-5 md:grid-cols-3">
                      <div>
                        <p className="text-[2.1rem] font-semibold text-[#1f2738]">{user.repos}</p>
                        <p className="mt-1 text-xs font-medium tracking-[0.16em] text-[#8d97aa] uppercase">
                          Repositories
                        </p>
                      </div>
                      <div>
                        <p className="text-[2.1rem] font-semibold text-[#1f2738]">
                          {formatCompactNumber(user.followers)}
                        </p>
                        <p className="mt-1 text-xs font-medium tracking-[0.16em] text-[#8d97aa] uppercase">
                          Followers
                        </p>
                      </div>
                      <div>
                        <p className="text-[2.1rem] font-semibold text-[#1f2738]">
                          {formatCompactNumber(user.following)}
                        </p>
                        <p className="mt-1 text-xs font-medium tracking-[0.16em] text-[#8d97aa] uppercase">
                          Following
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 text-[1.02rem] text-[#6c7890] md:flex-row md:flex-wrap md:items-center md:gap-7">
                      <div className="inline-flex items-center gap-2">
                        <MapPin className="size-4.5 text-[#6c7890]" />
                        <span>{user.location || "Location not public"}</span>
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <Mail className="size-4.5 text-[#6c7890]" />
                        <span>{user.email || "Email not public"}</span>
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <Link2 className="size-4.5 text-[#6c7890]" />
                        <span>{user.website || "No website"}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-[#e8e2db] bg-white px-6 py-14 text-center text-base text-[#7b8598] shadow-[0_8px_18px_rgba(31,39,56,0.08)]">
                No profiles yet. Paste a token above to retrieve and save a GitHub profile.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
