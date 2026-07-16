/**
 * Career roadmap progress — AsyncStorage persistence.
 * Tracks which topics a user has completed per roadmap.
 * Key: career_progress_<userId>
 */

import { createUserStore } from "../utils/storage";
import { CareerRoadmap, allTopicIds } from "../data/careerRoadmaps";

export type TopicStatus = "todo" | "in_progress" | "done";

export type RoadmapProgress = {
  roadmapId: string;
  /** topicId → status */
  topics: Record<string, TopicStatus>;
  startedAt: string;
  updatedAt: string;
};

export type AllProgress = Record<string, RoadmapProgress>;

const store = createUserStore<AllProgress>("career_progress", {});

export async function loadAllProgress(userId: string): Promise<AllProgress> {
  return (await store.load(userId)) ?? {};
}

export async function saveAllProgress(userId: string, data: AllProgress): Promise<void> {
  return store.save(userId, data);
}

export function initRoadmapProgress(roadmap: CareerRoadmap): RoadmapProgress {
  const topics: Record<string, TopicStatus> = {};
  for (const id of allTopicIds(roadmap)) topics[id] = "todo";
  return { roadmapId: roadmap.id, topics, startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

export async function setTopicStatus(
  userId: string,
  roadmapId: string,
  topicId: string,
  status: TopicStatus
): Promise<AllProgress> {
  const all = await loadAllProgress(userId);
  const rp  = all[roadmapId] ?? { roadmapId, topics: {}, startedAt: new Date().toISOString(), updatedAt: "" };
  rp.topics[topicId] = status;
  rp.updatedAt = new Date().toISOString();
  all[roadmapId] = rp;
  await saveAllProgress(userId, all);
  return all;
}

export async function deleteRoadmapProgress(userId: string, roadmapId: string): Promise<AllProgress> {
  const all = await loadAllProgress(userId);
  delete all[roadmapId];
  await saveAllProgress(userId, all);
  return all;
}

export function calcRoadmapStats(roadmap: CareerRoadmap, progress: RoadmapProgress | undefined) {
  const ids    = allTopicIds(roadmap);
  const total  = ids.length;
  const done   = ids.filter((id) => progress?.topics[id] === "done").length;
  const active = ids.filter((id) => progress?.topics[id] === "in_progress").length;
  const pct    = total > 0 ? done / total : 0;
  return { total, done, active, pct };
}
