import "server-only";
import type { QueryFilter, HydratedDocument } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { Job, type JobDocument } from "@/lib/db/models/Job";
import type { EmploymentType } from "@/lib/db/enums";
import { assertValidObjectId } from "@/lib/db/objectId";
import { NotFoundError, toAppError } from "@/lib/errors";
import { parseInput } from "@/lib/validation/shared";
import {
  createJobInputSchema,
  updateJobInputSchema,
  type CreateJobInput,
  type UpdateJobInput,
} from "@/lib/validation/job";

export async function createJob(input: CreateJobInput) {
  const data = parseInput(createJobInputSchema, input);
  await connectToDatabase();

  try {
    return await Job.create({
      ...data,
      publishedAt: data.status === "PUBLISHED" ? new Date() : undefined,
    });
  } catch (error) {
    throw toAppError(error, data.slug);
  }
}

export async function updateJob(id: string, input: UpdateJobInput) {
  assertValidObjectId(id);
  const data = parseInput(updateJobInputSchema, input);
  await connectToDatabase();

  try {
    const existing = await Job.findById(id);

    if (!existing) {
      throw new NotFoundError(`Job not found: ${id}`);
    }

    if (data.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      existing.publishedAt = new Date();
    }

    Object.assign(existing, data);
    await existing.save();
    return existing;
  } catch (error) {
    throw toAppError(error, data.slug);
  }
}

export async function deleteJob(id: string): Promise<void> {
  assertValidObjectId(id);
  await connectToDatabase();

  const deleted = await Job.findByIdAndDelete(id);

  if (!deleted) {
    throw new NotFoundError(`Job not found: ${id}`);
  }
}

export async function getJobById(id: string) {
  assertValidObjectId(id);
  await connectToDatabase();
  return Job.findById(id);
}

/** Returns null if no job matches — callers decide how to render "not found". */
export async function getJobBySlug(slug: string) {
  await connectToDatabase();
  return Job.findOne({ slug: slug.trim().toLowerCase() });
}

interface GetPublishedJobsOptions {
  location?: string;
  employmentType?: EmploymentType;
  company?: string;
  limit?: number;
  page?: number;
}

export async function getPublishedJobs(options: GetPublishedJobsOptions = {}) {
  await connectToDatabase();

  const { location, employmentType, company, limit = 20, page = 1 } = options;
  const filter: QueryFilter<JobDocument> = { status: "PUBLISHED" };

  if (location) {
    filter.location = location;
  }
  if (employmentType) {
    filter.employmentType = employmentType;
  }
  if (company) {
    filter.company = company;
  }

  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);

  return Job.find(filter)
    .sort({ publishedAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);
}

/**
 * Published jobs sharing the same company, location, or employment type as
 * `job`, most recent first. Intentionally simple — no scoring/ranking beyond
 * the query order.
 */
export async function getRelatedJobs(
  job: HydratedDocument<JobDocument>,
  limit = 4
) {
  await connectToDatabase();

  return Job.find({
    _id: { $ne: job._id },
    status: "PUBLISHED",
    $or: [
      { company: job.company },
      { location: job.location },
      { employmentType: job.employmentType },
    ],
  })
    .sort({ publishedAt: -1 })
    .limit(limit);
}
