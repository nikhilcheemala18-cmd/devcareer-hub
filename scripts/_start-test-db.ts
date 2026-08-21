import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../src/lib/db/connect";
import { User } from "../src/lib/db/models/User";
import * as jobs from "../src/lib/services/jobs";

async function main() {
  const mongod = await MongoMemoryServer.create({ instance: { port: 27117 } });
  process.env.MONGODB_URI = mongod.getUri("jaake_phase8_verify");
  console.log("MONGODB_URI=" + process.env.MONGODB_URI);

  await connectToDatabase();

  await User.create({
    name: "Admin",
    email: "admin@example.com",
    passwordHash: await bcrypt.hash("correct horse battery staple", 12),
    role: "ADMIN",
  });

  await jobs.createJob({
    title: "Existing Published Job",
    slug: "existing-published-job",
    company: "Acme Corp",
    location: "Remote",
    experience: "2-4 years",
    salary: "$120k - $150k",
    employmentType: "FULL_TIME",
    description: "## About the role\n\nWe are looking for a backend engineer.",
    requirements: ["3+ years with Node.js", "Experience with MongoDB"],
    applicationUrl: "https://example.com/apply/existing",
    source: "Company careers page",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: "PUBLISHED",
  });
  await jobs.createJob({
    title: "Existing Draft Job",
    slug: "existing-draft-job",
    company: "Beta Inc",
    location: "Bangalore, India",
    employmentType: "INTERNSHIP",
    description: "Draft job description.",
    applicationUrl: "https://example.com/apply/draft",
    status: "DRAFT",
  });
  await jobs.createJob({
    title: "Slug Collision Target",
    slug: "slug-collision-target",
    company: "Gamma LLC",
    location: "Remote",
    employmentType: "CONTRACT",
    description: "Used to test duplicate-slug rejection.",
    applicationUrl: "https://example.com/apply/collision",
    status: "PUBLISHED",
  });

  console.log("Seed complete. Test DB is running and will stay up until this process is stopped.");
}

main().catch((error) => {
  console.error("Failed to start test DB:", error);
  process.exit(1);
});
