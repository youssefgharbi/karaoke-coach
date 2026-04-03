const STORAGE_KEY = "karaoke-coach-local-media";

export type LocalMediaEntry = {
  objectUrl: string;
  fileName: string;
  mimeType: string;
};

type LocalMediaRecord = {
  [songId: string]: LocalMediaEntry;
};

function readStorage(): LocalMediaRecord {
  if (typeof window === "undefined") {
    return {};
  }

  const rawValue = window.sessionStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue) as LocalMediaRecord;
  } catch {
    return {};
  }
}

function writeStorage(value: LocalMediaRecord) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function setLocalMedia(songId: number, entry: LocalMediaEntry) {
  const current = readStorage();
  current[String(songId)] = entry;
  writeStorage(current);
}

export function getLocalMedia(songId: number) {
  const current = readStorage();
  const entry = current[String(songId)];

  if (!entry) {
    return null;
  }

  if (typeof entry === "string") {
    return {
      objectUrl: entry,
      fileName: "Legacy local media",
      mimeType: "",
    };
  }

  return entry;
}

export function isVideoMedia(entry?: LocalMediaEntry | null) {
  if (!entry || !entry.mimeType) {
    return false;
  }

  return entry.mimeType.startsWith("video/");
}
