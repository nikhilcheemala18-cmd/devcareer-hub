export const POST_TYPES = [
  "BLOG",
  "INTERVIEW_PREP",
  "SYSTEM_DESIGN",
  "GUIDE",
  "CAREER",
] as const;
export type PostType = (typeof POST_TYPES)[number];

export const CONTENT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "INTERNSHIP",
  "CONTRACT",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const USER_ROLES = ["ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];
