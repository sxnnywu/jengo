const TASK_LIKES_KEY = 'taskLikesByVolunteer';
const TASK_SEEN_KEY = 'taskSeenByVolunteer';
const PROFILE_LIKES_KEY = 'profileLikesByNonprofit';
const PITCH_VIDEO_KEY = 'pitchVideoByVolunteerId';
const OUTREACH_MESSAGES_KEY = 'outreachMessages';
const PROFILE_PHOTO_KEY = 'profilePhotoByVolunteerId';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jengo.onrender.com/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getAllTaskLikes() {
  return readJson(TASK_LIKES_KEY, {});
}

export function getAllProfileLikes() {
  return readJson(PROFILE_LIKES_KEY, {});
}

export function getTaskLikes(volunteerId) {
  const all = readJson(TASK_LIKES_KEY, {});
  return Array.isArray(all[volunteerId]) ? all[volunteerId] : [];
}

export function likeTask(volunteerId, opportunityId) {
  const all = readJson(TASK_LIKES_KEY, {});
  const current = new Set(getTaskLikes(volunteerId));
  current.add(opportunityId);
  all[volunteerId] = [...current];
  writeJson(TASK_LIKES_KEY, all);
}

export function getSeenTasks(volunteerId) {
  const all = readJson(TASK_SEEN_KEY, {});
  return Array.isArray(all[volunteerId]) ? all[volunteerId] : [];
}

export function markTaskSeen(volunteerId, opportunityId) {
  const all = readJson(TASK_SEEN_KEY, {});
  const current = new Set(getSeenTasks(volunteerId));
  current.add(opportunityId);
  all[volunteerId] = [...current];
  writeJson(TASK_SEEN_KEY, all);
}

export function resetSeenTasks(volunteerId) {
  const all = readJson(TASK_SEEN_KEY, {});
  all[volunteerId] = [];
  writeJson(TASK_SEEN_KEY, all);
}

export function unlikeTask(volunteerId, opportunityId) {
  const all = readJson(TASK_LIKES_KEY, {});
  const current = getTaskLikes(volunteerId).filter((id) => id !== opportunityId);
  all[volunteerId] = current;
  writeJson(TASK_LIKES_KEY, all);
}

export function getProfileLikes(nonprofitId) {
  const all = readJson(PROFILE_LIKES_KEY, {});
  return Array.isArray(all[nonprofitId]) ? all[nonprofitId] : [];
}

export function likeVolunteerProfile(nonprofitId, volunteerId) {
  const all = readJson(PROFILE_LIKES_KEY, {});
  const current = new Set(getProfileLikes(nonprofitId));
  current.add(volunteerId);
  all[nonprofitId] = [...current];
  writeJson(PROFILE_LIKES_KEY, all);
}

export function setPitchVideoUrl(volunteerId, url) {
  const all = readJson(PITCH_VIDEO_KEY, {});
  all[volunteerId] = url;
  writeJson(PITCH_VIDEO_KEY, all);
}

export function getPitchVideoUrl(volunteerId) {
  const all = readJson(PITCH_VIDEO_KEY, {});
  const url = typeof all[volunteerId] === 'string' ? all[volunteerId] : '';
  return resolveMediaUrl(url);
}

export function getProfilePhotoUrl(volunteerId) {
  const all = readJson(PROFILE_PHOTO_KEY, {});
  const url = typeof all[volunteerId] === 'string' ? all[volunteerId] : '';
  return resolveMediaUrl(url);
}

export function setProfilePhotoUrl(volunteerId, url) {
  const all = readJson(PROFILE_PHOTO_KEY, {});
  all[volunteerId] = url;
  writeJson(PROFILE_PHOTO_KEY, all);
}

export function getOutreachMessages() {
  return readJson(OUTREACH_MESSAGES_KEY, {});
}

export function setOutreachMessage(nonprofitId, volunteerId, opportunityId, message) {
  const all = readJson(OUTREACH_MESSAGES_KEY, {});
  const key = `${nonprofitId}:${volunteerId}:${opportunityId}`;
  all[key] = message || '';
  writeJson(OUTREACH_MESSAGES_KEY, all);
}

export function getOutreachMessage(nonprofitId, volunteerId, opportunityId) {
  const all = readJson(OUTREACH_MESSAGES_KEY, {});
  const key = `${nonprofitId}:${volunteerId}:${opportunityId}`;
  return all[key] || '';
}

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('blob:')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return url;
}

export function computeMatchedNonprofits({ volunteerId, opportunities }) {
  const likedOppIds = new Set(getTaskLikes(volunteerId));
  const likedNonprofitIds = new Set(
    opportunities
      .filter((opp) => likedOppIds.has(opp.id))
      .map((opp) => opp.nonprofitId)
      .filter(Boolean)
  );

  const likesByNonprofit = readJson(PROFILE_LIKES_KEY, {});
  const nonprofitsWhoLikedMe = Object.entries(likesByNonprofit)
    .filter(([, volIds]) => Array.isArray(volIds) && volIds.includes(volunteerId))
    .map(([npId]) => npId);

  return nonprofitsWhoLikedMe.filter((npId) => likedNonprofitIds.has(npId));
}

