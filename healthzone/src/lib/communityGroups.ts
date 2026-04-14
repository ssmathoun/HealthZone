export type CommunityGroup = {
  id: number;
  slug: string;
  name: string;
  members: number;
  focus: string;
  description: string;
};

export type GroupForumPost = {
  id: string;
  groupSlug: string;
  user: string;
  userId?: number | string | null;
  title?: string;
  body: string;
  createdAt: string;
  mediaUrl?: string | null;
  mediaType?: "image" | "video" | null;
};

export const COMMUNITY_GROUPS: CommunityGroup[] = [
  {
    id: 1,
    slug: "fit-squad",
    name: "FitSquad",
    members: 24,
    focus: "Basketball",
    description: "Find pickup games, swap training tips, and stay accountable.",
  },
  {
    id: 2,
    slug: "runners-united",
    name: "Runners United",
    members: 18,
    focus: "Running",
    description: "Share pace goals, route ideas, and race prep with other runners.",
  },
  {
    id: 3,
    slug: "meal-preppers",
    name: "Meal Preppers",
    members: 32,
    focus: "Nutrition",
    description: "Trade easy meal prep ideas, macros, and grocery planning tips.",
  },
  {
    id: 4,
    slug: "yoga-warriors",
    name: "Yoga Warriors",
    members: 15,
    focus: "Yoga",
    description: "Connect with other yoga practitioners and share flows, routines, and wins.",
  },
];

const JOINED_GROUPS_KEY = "healthzone-joined-groups";
const GROUP_POSTS_KEY = "healthzone-group-posts";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getGroupBySlug(groupSlug?: string) {
  return COMMUNITY_GROUPS.find((group) => group.slug === groupSlug);
}

export function getJoinedGroupSlugs() {
  return readJson<string[]>(JOINED_GROUPS_KEY, []);
}

export function isGroupJoined(groupSlug: string) {
  return getJoinedGroupSlugs().includes(groupSlug);
}

export function joinCommunityGroup(groupSlug: string) {
  const joinedGroups = getJoinedGroupSlugs();
  if (joinedGroups.includes(groupSlug)) {
    return joinedGroups;
  }

  const nextGroups = [...joinedGroups, groupSlug];
  writeJson(JOINED_GROUPS_KEY, nextGroups);
  return nextGroups;
}

export function getJoinedGroups() {
  const joined = new Set(getJoinedGroupSlugs());
  return COMMUNITY_GROUPS.filter((group) => joined.has(group.slug));
}

export function getAvailableGroups() {
  const joined = new Set(getJoinedGroupSlugs());
  return COMMUNITY_GROUPS.filter((group) => !joined.has(group.slug));
}

function readGroupPosts() {
  const storedPosts = readJson<Record<string, GroupForumPost[]>>(GROUP_POSTS_KEY, {});
  let changed = false;

  const normalizedPosts = Object.entries(storedPosts).reduce<
    Record<string, GroupForumPost[]>
  >((acc, [groupSlug, posts]) => {
    acc[groupSlug] = (posts ?? []).map((post) => {
      if (post.mediaUrl?.startsWith("blob:")) {
        changed = true;
        return {
          ...post,
          mediaUrl: null,
          mediaType: null,
        };
      }

      return post;
    });

    return acc;
  }, {});

  if (changed) {
    writeJson(GROUP_POSTS_KEY, normalizedPosts);
  }

  return normalizedPosts;
}

function writeGroupPosts(postsByGroup: Record<string, GroupForumPost[]>) {
  writeJson(GROUP_POSTS_KEY, postsByGroup);
}

export function getGroupPosts(groupSlug: string) {
  const posts = readGroupPosts()[groupSlug] ?? [];
  return [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function createGroupPost(post: GroupForumPost) {
  const postsByGroup = readGroupPosts();
  const nextPosts = [post, ...(postsByGroup[post.groupSlug] ?? [])];
  writeGroupPosts({
    ...postsByGroup,
    [post.groupSlug]: nextPosts,
  });
  return nextPosts;
}

export function updateGroupPost(
  groupSlug: string,
  postId: string,
  updates: Partial<GroupForumPost>,
) {
  const postsByGroup = readGroupPosts();
  const nextPosts = (postsByGroup[groupSlug] ?? []).map((post) =>
    post.id === postId ? { ...post, ...updates } : post,
  );

  writeGroupPosts({
    ...postsByGroup,
    [groupSlug]: nextPosts,
  });

  return nextPosts;
}

export function deleteGroupPost(groupSlug: string, postId: string) {
  const postsByGroup = readGroupPosts();
  const nextPosts = (postsByGroup[groupSlug] ?? []).filter(
    (post) => post.id !== postId,
  );

  writeGroupPosts({
    ...postsByGroup,
    [groupSlug]: nextPosts,
  });

  return nextPosts;
}
