import { supabase } from "../api/supabase";

const GITHUB_API = "https://api.github.com";

export type GitHubConfig = {
  token: string;
  username: string;
};

async function fetchRecentEvents(config: GitHubConfig) {
  const res = await fetch(
    `${GITHUB_API}/users/${config.username}/events?per_page=30`,
    {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

function scoreEvent(event: any): { value: number; description: string; url: string } | null {
  switch (event.type) {
    case "PushEvent": {
      const commits = event.payload?.commits?.length ?? 0;
      if (commits === 0) return null;
      return {
        value: Math.min(10, commits * 2),
        description: `Pushed ${commits} commit${commits > 1 ? "s" : ""} to ${event.repo?.name}`,
        url: `https://github.com/${event.repo?.name}`,
      };
    }
    case "PullRequestEvent": {
      const action = event.payload?.action;
      if (!["opened", "merged"].includes(action)) return null;
      return {
        value: action === "merged" ? 10 : 7,
        description: `${action === "merged" ? "Merged" : "Opened"} PR: ${event.payload?.pull_request?.title}`,
        url: event.payload?.pull_request?.html_url ?? "",
      };
    }
    case "IssuesEvent": {
      if (event.payload?.action !== "closed") return null;
      return {
        value: 5,
        description: `Closed issue: ${event.payload?.issue?.title}`,
        url: event.payload?.issue?.html_url ?? "",
      };
    }
    case "CreateEvent": {
      if (event.payload?.ref_type !== "repository") return null;
      return {
        value: 8,
        description: `Created repository: ${event.repo?.name}`,
        url: `https://github.com/${event.repo?.name}`,
      };
    }
    default:
      return null;
  }
}

export async function syncGitHubToImpact(
  userId: string,
  config: GitHubConfig
): Promise<number> {
  const events = await fetchRecentEvents(config);

  // Get already-synced event IDs
  const { data: existing } = await supabase
    .from("logs")
    .select("evidence_url")
    .eq("user_id", userId)
    .eq("pillar_type", "impact")
    .not("evidence_url", "is", null)
    .like("evidence_url", "gh:%");

  const syncedIds = new Set((existing ?? []).map((l: any) => l.evidence_url));

  let synced = 0;

  for (const event of events) {
    const eventId = `gh:${event.id}`;
    if (syncedIds.has(eventId)) continue;

    const scored = scoreEvent(event);
    if (!scored) continue;

    const { error } = await supabase.from("logs").insert({
      user_id: userId,
      pillar_type: "impact",
      value: scored.value,
      evidence_url: scored.url || eventId,
      metadata: {
        source: "github",
        description: scored.description,
        event_type: event.type,
        event_id: event.id,
        auto_synced: true,
        created_at: event.created_at,
      },
    });

    if (!error) synced++;
  }

  return synced;
}
