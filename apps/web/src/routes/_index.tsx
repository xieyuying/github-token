import { Button } from "@github-token/ui/components/button";
import { Input } from "@github-token/ui/components/input";
import { useQuery } from "@tanstack/react-query";
import { Link2, Mail, MapPin, Search, TrendingUp } from "lucide-react";
import { type FormEvent, useState } from "react";

import { trpc } from "@/utils/trpc";

import type { Route } from "./+types/_index";

type SavedUser = {
  id: string;
  username: string;
  handle: string;
  name: string;
  email: string;
  location: string;
  website: string;
  bio: string;
  avatar: string;
  repos: number;
  followers: number;
  following: number;
};

const initialUsers: SavedUser[] = [
  {
    id: "alex-rivera",
    username: "Alex Rivera",
    handle: "@arivera_dev",
    name: "Alex Rivera",
    email: "alex@rivera.dev",
    location: "San Francisco, CA",
    website: "arivera.dev",
    bio: "Full-stack engineer building the future of decentralized finance. Open source enthusiast and tech lead.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
    repos: 142,
    followers: 2400,
    following: 892,
  },
  {
    id: "sarah-chen",
    username: "Sarah Chen",
    handle: "@schen_codes",
    name: "Sarah Chen",
    email: "sarah@chen.io",
    location: "Toronto, Canada",
    website: "sarahchen.design",
    bio: "UI/UX Designer & Frontend Architect. Exploring the intersection of AI and design systems.",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=240&q=80",
    repos: 84,
    followers: 5800,
    following: 1200,
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GitHub 用户信息管理" },
    { name: "description", content: "GitHub token user dashboard" },
  ];
}

export default function Home() {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());
  const [token, setToken] = useState("");
  const [users, setUsers] = useState(initialUsers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"latest" | "popular">("latest");

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

    setIsSubmitting(true);

    window.setTimeout(() => {
      const normalizedToken = token.trim();
      const suffix = normalizedToken.slice(-4) || "demo";

      setUsers((currentUsers) => [
        {
          id: `profile-${Date.now()}`,
          username: `Dev User ${suffix.toUpperCase()}`,
          handle: `@dev_${suffix}`,
          name: `Dev User ${suffix.toUpperCase()}`,
          email: `dev.${suffix}@example.dev`,
          location: "Remote",
          website: `dev-${suffix}.site`,
          bio: "Prototype profile generated from the provided token for local UI preview.",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=240&q=80",
          repos: 32,
          followers: 860,
          following: 214,
        },
        ...currentUsers,
      ]);
      setToken("");
      setIsSubmitting(false);
    }, 450);
  }

  function handleRefresh() {
    setIsRefreshing(true);

    window.setTimeout(() => {
      setUsers((currentUsers) =>
        currentUsers.map((user, index) => ({
          ...user,
          repos: user.repos + (index === 0 ? 1 : 0),
          followers: user.followers + (index === 0 ? 18 : 0),
        })),
      );
      setIsRefreshing(false);
    }, 350);
  }

  function handleDelete(id: string) {
    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
  }

  const displayedUsers =
    activeTab === "latest"
      ? users
      : [...users].sort((a, b) => b.followers - a.followers);

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
                disabled={!token.trim() || isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Fetching..." : "Fetch Profile  ->"}
              </Button>
            </form>

            <p className="text-center text-sm text-[#8f9ab0]">
              Tokens are used locally and never stored on our servers.
            </p>
          </div>
        </section>

        <section className="space-y-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-[2.1rem] font-semibold tracking-tight text-[#1e2435]">
              Retrieved Profiles
            </h2>

            <div className="inline-flex rounded-[14px] bg-[#e8ebf2] p-1">
              <button
                className={`rounded-[10px] px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "latest"
                    ? "bg-white text-[#1e2435] shadow-[0_2px_6px_rgba(15,23,42,0.08)]"
                    : "text-[#6a768d]"
                }`}
                onClick={() => setActiveTab("latest")}
                type="button"
              >
                Latest
              </button>
              <button
                className={`inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "popular"
                    ? "bg-white text-[#1e2435] shadow-[0_2px_6px_rgba(15,23,42,0.08)]"
                    : "text-[#6a768d]"
                }`}
                onClick={() => setActiveTab("popular")}
                type="button"
              >
                Popular
                <TrendingUp className="size-3.5" />
              </button>
            </div>
          </div>

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
                          alt={user.username}
                          className="h-[92px] w-[92px] rounded-[18px] object-cover shadow-sm"
                          src={user.avatar}
                        />

                        <div className="space-y-2 pt-1">
                          <div>
                            <h3 className="text-[2rem] font-semibold leading-none text-[#1f2738]">
                              {user.username}
                            </h3>
                            <p className="mt-2 text-lg font-medium text-[#ff6a1b]">
                              {user.handle}
                            </p>
                          </div>
                          <p className="max-w-[580px] text-[1.03rem] leading-7 text-[#68758f]">
                            {user.bio}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Button
                          className="h-11 rounded-[14px] border border-[#ffd4c0] bg-white px-4 text-sm font-semibold text-[#ff6a1b] hover:bg-[#fff5ef]"
                          onClick={() => window.open(`https://github.com/${user.handle.slice(1)}`)}
                          type="button"
                        >
                          View on GitHub
                        </Button>
                        <Button
                          className="h-11 rounded-[14px] bg-[#fff1eb] px-4 text-sm font-semibold text-[#ef5a2a] hover:bg-[#ffe5d9]"
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
                        <span>{user.location}</span>
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <Mail className="size-4.5 text-[#6c7890]" />
                        <span>{user.email}</span>
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <Link2 className="size-4.5 text-[#6c7890]" />
                        <span>{user.website}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-[#e8e2db] bg-white px-6 py-14 text-center text-base text-[#7b8598] shadow-[0_8px_18px_rgba(31,39,56,0.08)]">
                No profiles yet. Paste a token above to preview a retrieved profile.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
