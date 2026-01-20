"use client";

import clsx from "clsx";
import { ArrowUpRight, Crown, LogOut, User as UserIcon, Zap } from "lucide-react";
import { AuthUser } from "../../lib/useAuthUser";

type UserBadgeProps = {
  user: AuthUser | null;
  loading?: boolean;
  onSignIn?: () => void;
  onSignOut?: () => void;
  variant?: "default" | "compact";
  className?: string;
};

export default function UserBadge({
  user,
  loading,
  onSignIn,
  onSignOut,
  variant = "default",
  className,
}: UserBadgeProps) {
  const padding = variant === "compact" ? "px-3 py-2" : "px-4 py-2.5";
  const gap = variant === "compact" ? "gap-2.5" : "gap-3";
  const avatarSize = variant === "compact" ? "h-9 w-9" : "h-10 w-10";
  const nameSize = variant === "compact" ? "text-sm" : "text-base";
  const actionSize = variant === "compact" ? "text-xs" : "text-sm";

  if (loading) {
    return (
      <div
        className={clsx(
          "inline-flex items-center rounded-full border border-white/10 bg-zinc-900/70 shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
          padding,
          gap,
          className
        )}
      >
        <div className={clsx(avatarSize, "rounded-full bg-zinc-800 animate-pulse")} />
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-zinc-800 animate-pulse" />
          <div className="h-3 w-14 rounded bg-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={onSignIn}
        className={clsx(
          "inline-flex items-center rounded-full border border-white/10 bg-zinc-900/80 text-white transition-all duration-300 hover:border-amber-400/80 hover:bg-zinc-800 hover:scale-105 active:scale-95",
          padding,
          gap,
          className
        )}
      >
        <div
          className={clsx(
            avatarSize,
            "flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/30 text-amber-200"
          )}
        >
          <UserIcon className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx("font-semibold tracking-tight", nameSize)}>Try now</span>
          <ArrowUpRight className="h-4 w-4 text-amber-300" />
        </div>
      </button>
    );
  }

  return (
    <div
      className={clsx(
        "inline-flex items-center rounded-full border border-white/10 bg-zinc-900/90 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-amber-400/70 hover:bg-zinc-900",
        padding,
        gap,
        className
      )}
    >
      <div
        className={clsx(
          avatarSize,
          "relative overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-amber-400/20 via-amber-500/15 to-amber-200/10 shadow-inner"
        )}
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-amber-200">
            <UserIcon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div>
          <div className={clsx("font-semibold leading-tight tracking-tight", nameSize)}>{user.name}</div>
          {user.email && <div className="text-xs text-zinc-500">{user.email}</div>}
          {user.plan && (
            <div className="flex items-center gap-1 text-xs">
              {user.plan === 'pro' || user.plan === 'premium' ? (
                <Crown className="w-3 h-3 text-amber-400" />
              ) : (
                <Zap className="w-3 h-3 text-zinc-400" />
              )}
              <span className="text-zinc-400 capitalize">{user.plan}</span>
              {user.credits !== undefined && (
                <span className="text-amber-400">• {user.credits} credits</span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onSignOut}
          className={clsx(
            "group inline-flex items-center gap-1 rounded-full px-2 py-1 text-zinc-400 transition hover:text-white",
            actionSize
          )}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
