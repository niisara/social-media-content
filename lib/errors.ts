export class EntryNotFoundError extends Error {
  constructor(brandSlug: string, entryId: string) {
    super(`Manifest entry "${entryId}" not found in brand "${brandSlug}"`);
    this.name = "EntryNotFoundError";
  }
}

export class EntryConflictError extends Error {
  constructor(brandSlug: string, entryId: string) {
    super(`Manifest entry "${entryId}" already exists in brand "${brandSlug}"`);
    this.name = "EntryConflictError";
  }
}

export class MissingScheduleFieldsError extends Error {
  constructor() {
    super("Both a scheduled date and a timezone are required.");
    this.name = "MissingScheduleFieldsError";
  }
}

export class InvalidTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Cannot move an item from "${from}" to "${to}".`);
    this.name = "InvalidTransitionError";
  }
}

export class OriginalNotPostedError extends Error {
  constructor(contentId: string) {
    super(`Content "${contentId}" must be posted before it can be reposted.`);
    this.name = "OriginalNotPostedError";
  }
}

export class ContentNotFoundError extends Error {
  constructor(contentId: string) {
    super(`Content "${contentId}" could not be found.`);
    this.name = "ContentNotFoundError";
  }
}
