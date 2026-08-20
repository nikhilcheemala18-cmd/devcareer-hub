# Software Requirements Specification (SRS)

## 1. Project Information

- **Project Name:** Developer Jobs & Knowledge Publishing Platform
- **Version:** 1.0
- **Date:** August 2026
- **Status:** MVP Development

## 2. Project Overview

The project is a lightweight content publishing website focused on software development, careers, jobs, interview preparation, and technical knowledge.

The primary purpose of the website is to publish useful, discoverable content and attract visitors through external traffic sources such as Instagram and eventually organic search.

The website will monetize eligible traffic through Google AdSense.

The platform is therefore designed around three primary content pillars:

1. Job listings
2. Interview preparation
3. Technical/career content

The website must provide an easy-to-use administration system so the owner can continuously publish and manage content without changing source code.

## 3. Business Objective

The primary business objective is:

Build a legitimate, useful, content-focused website capable of attracting recurring traffic and eventually monetizing that traffic through Google AdSense.

The intended traffic model is:

```
Instagram / Social Media
        ↓
    Website
        ↓
   Useful Content
        ↓
  Related Content
        ↓
   More Page Views
        ↓
  Returning / Search Users
        ↓
    Ad Revenue
```

The website should prioritize content quality, usability, SEO, performance, and trustworthiness.

The technical implementation should remain lightweight and should not introduce unnecessary infrastructure.

## 4. Product Vision

The product should feel like a modern developer and career publication rather than a social network or a large job portal.

The website should allow visitors to easily discover:

- Current job opportunities
- Interview questions
- Interview preparation material
- System design explanations
- Programming tutorials
- Developer guides
- Career guidance
- Technology articles
- Case studies
- Trending technical topics

The administrator should be able to publish these resources quickly.

## 5. Target Users

### 5.1 Public Visitors

Primary users include:

- College students
- Fresh graduates
- Job seekers
- Software developers
- Developers preparing for interviews
- Technology learners
- People looking for software engineering jobs

Public visitors do not require an account in V1.

### 5.2 Administrator

The administrator is the website owner.

The administrator can:

- Log in
- Create posts
- Edit posts
- Delete posts
- Save drafts
- Publish posts
- Unpublish posts
- Create job listings
- Edit job listings
- Delete job listings
- Manage categories
- Manage tags
- Upload images
- Manage SEO information

There is only one administrator concept in V1.

## 6. V1 Content Categories

The website will support three major areas.

### 6.1 Jobs

Examples:

- Software Engineer Jobs
- Backend Developer Jobs
- Frontend Developer Jobs
- Full Stack Developer Jobs
- AI/ML Jobs
- Internships
- Fresher Jobs
- Remote Jobs
- Location-specific jobs

Job information may be collected from external sources, but published pages must provide useful value rather than simply duplicating external pages.

Where appropriate, the website should direct users to the original/official application source.

### 6.2 Interview Preparation

Examples:

- Java Interview Questions
- Python Interview Questions
- JavaScript Interview Questions
- SQL Interview Questions
- DBMS Interview Questions
- Operating Systems Questions
- Computer Networks Questions
- OOP Questions
- React Interview Questions
- Node.js Interview Questions
- Backend Interview Questions
- System Design Interview Questions
- HR Interview Questions

Interview content should be organized and readable.

### 6.3 Technical and Career Content

Examples:

- Programming tutorials
- Backend concepts
- Frontend concepts
- AWS explanations
- AI/ML explanations
- GenAI articles
- System design
- Architecture explanations
- Case studies
- Career guidance
- Resume guidance
- Placement guidance
- Developer roadmaps
- Trending technology topics

This section is intended to provide long-term evergreen content as well as timely articles.

## 7. Technology Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Next.js App Router

### Backend

Use Next.js server-side capabilities. Use:

- Server Components where appropriate
- Server Actions where appropriate
- Route Handlers/API routes where appropriate
- Server-side service modules

A separate Express backend is NOT required for V1.

### Database

MongoDB Atlas

### Database ODM

Mongoose

### Authentication

Admin-only authentication. No public user registration is required.

Authentication must:

- Hash passwords securely
- Use secure sessions
- Protect admin routes
- Store secrets in environment variables
- Never expose secrets to the browser

### Deployment

Vercel. The application should be designed for straightforward deployment to Vercel.

### File/Image Storage

Use a storage abstraction. Cloudinary or an S3-compatible service may be used for production media storage.

Do not store large images directly inside MongoDB.

## 8. Architecture

The application should use a lightweight modular monolith architecture.

```
Visitor
   ↓
Next.js
   ↓
┌───────────────┐
│ Public Site   │
│ Admin CMS     │
│ Server Logic  │
└───────┬───────┘
        ↓
     Mongoose
        ↓
    MongoDB Atlas
```

Media:

```
Next.js
   ↓
Media Storage
```

The application must NOT use microservices in V1.

## 9. Database Collections

The initial MongoDB database should contain the following collections.

### 9.1 Users

Fields:

- `_id`
- `name`
- `email`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

The initial role can be: `ADMIN`

### 9.2 Posts

Posts represent general published content.

Fields:

- `_id`
- `title`
- `slug`
- `type`
- `excerpt`
- `content`
- `category`
- `tags`
- `featuredImage`
- `seo`
- `status`
- `author`
- `createdAt`
- `updatedAt`
- `publishedAt`

Post types:

- `BLOG`
- `INTERVIEW_PREP`
- `SYSTEM_DESIGN`
- `GUIDE`
- `CAREER`

### 9.3 Jobs

Jobs should have their own collection because job-specific information differs from normal articles.

Fields:

- `_id`
- `title`
- `slug`
- `company`
- `location`
- `experience`
- `salary`
- `employmentType`
- `description`
- `requirements`
- `applicationUrl`
- `source`
- `deadline`
- `featuredImage`
- `seo`
- `status`
- `createdAt`
- `updatedAt`
- `publishedAt`

### 9.4 Categories

Fields:

- `_id`
- `name`
- `slug`
- `description`
- `createdAt`
- `updatedAt`

### 9.5 Tags

Fields:

- `_id`
- `name`
- `slug`
- `createdAt`
- `updatedAt`

### 9.6 Media

Fields:

- `_id`
- `filename`
- `url`
- `type`
- `size`
- `altText`
- `createdAt`

## 10. Content Status

Posts and jobs should support:

- `DRAFT`
- `PUBLISHED`
- `ARCHIVED`

Only published content should be visible to public visitors.

Draft and archived content must not appear in public listings or sitemap output.

## 11. URL Structure

URLs must be human-readable and SEO-friendly.

Examples:

```
/jobs
/jobs/software-engineer-company-name

/blog
/blog/how-jwt-authentication-works

/interview-prep
/interview-prep/sql-interview-questions

/system-design
/system-design/design-url-shortener
```

Avoid database-ID URLs.

Bad:

```
/post/739293
```

Good:

```
/blog/database-indexing-explained
```

Slugs must be unique.

## 12. Public Website Pages

The initial public website must contain:

```
/
/jobs
/jobs/[slug]

/blog
/blog/[slug]

/interview-prep
/interview-prep/[slug]

/system-design
/system-design/[slug]

/search

/about
/contact
/privacy-policy
/terms
```

Additional pages may be introduced later.

## 13. Homepage

The homepage should clearly communicate the site's purpose.

Example positioning: **Jobs, Interview Preparation & Developer Resources**

The homepage should contain:

1. Navigation
2. Search
3. Featured content
4. Latest jobs
5. Latest articles
6. Interview preparation
7. System design
8. Popular content
9. Categories
10. Footer

The homepage must be mobile-first.

## 14. Navigation

Primary navigation should contain approximately:

- Home
- Jobs
- Interview Prep
- System Design
- Blog
- Search

The navigation should remain simple. Do not create a large mega-menu in V1.

## 15. Job Listing Page

Route: `/jobs`

Each job card should display:

- Job title
- Company
- Location
- Experience
- Employment type
- Posted date

The page should support:

- Search
- Basic filtering
- Pagination or load-more behavior

Initial filters:

- Location
- Experience
- Employment type
- Company

## 16. Job Detail Page

Route: `/jobs/[slug]`

The page should contain:

- Job title
- Company
- Location
- Experience
- Employment type
- Salary where available
- Description
- Requirements
- Application button
- Source where appropriate
- Deadline
- Posted date
- Related jobs

The Apply button should redirect to the relevant external application URL. No internal job application system is required.

## 17. External Job Sources

The website may collect job information from external sources. However, the platform must NOT be designed around blindly copying external websites.

Where job information is sourced externally:

- Identify the source when appropriate.
- Provide accurate information.
- Link users to the official/original application destination.
- Add useful context where possible.
- Avoid publishing misleading or outdated information.
- Respect applicable source terms, copyright, and access restrictions.

The goal is to provide a useful job discovery experience, not a scraping mirror.

## 18. Article Page

Article pages should prioritize readability.

Recommended structure:

```
Title
Excerpt
Author
Published date
Featured image

Article content

Related content
```

The article should support:

- Headings
- Paragraphs
- Lists
- Links
- Images
- Code blocks
- Quotes
- Tables where appropriate

Content must be rendered safely.

## 19. Content Editor

The administrator should have a practical content editor.

Minimum functionality:

- Title
- Slug
- Content type
- Category
- Tags
- Excerpt
- Body
- Featured image
- SEO title
- SEO description
- Status
- Publish date

The editor must support preview.

## 20. Admin Dashboard

Route: `/admin`

Dashboard should show:

- Published posts
- Draft posts
- Published jobs
- Recent content
- Quick create actions

Keep the dashboard lightweight. No advanced analytics system is required in V1.

## 21. Admin Content Management

Routes:

```
/admin/posts
/admin/posts/new
/admin/posts/[id]/edit
```

Administrator must be able to:

- Create
- Edit
- Delete
- Draft
- Publish
- Unpublish
- Search
- Filter by type
- Filter by status

## 22. Admin Job Management

Routes:

```
/admin/jobs
/admin/jobs/new
/admin/jobs/[id]/edit
```

Administrator must be able to:

- Create jobs
- Edit jobs
- Delete jobs
- Save drafts
- Publish
- Unpublish
- Search
- Filter

## 23. Search

Global search should search:

- Jobs
- Blog posts
- Interview preparation
- System design
- Guides
- Career content

Search results should display:

- Title
- Type
- Excerpt
- Category
- Published date

MongoDB-based search is sufficient for V1. Do not introduce Elasticsearch or another dedicated search engine unless future scale actually requires it.

## 24. Related Content

Individual content pages should display related content.

Related content may be selected using:

- Category
- Tags
- Content type

Example:

```
Related Articles

SQL Interview Questions
DBMS Interview Questions
Database Indexing Explained
```

The purpose is to encourage useful further reading.

## 25. SEO Requirements

SEO is a core requirement.

Every public content page should support:

- Unique title
- Meta description
- Canonical URL
- OpenGraph metadata
- Social metadata
- SEO-friendly slug

The application must provide:

```
/sitemap.xml
```

and:

```
/robots.txt
```

Published pages should appear in the sitemap. Draft and archived pages must not appear.

## 26. Structured Data

Use structured data where appropriate.

- Articles: `Article`
- Jobs: `JobPosting`
- Website: `WebSite`

Structured data must accurately represent the visible page content. Do not create fake information for SEO.

## 27. Performance

The website must prioritize:

- Fast page loads
- Mobile performance
- Optimized images
- Server rendering where useful
- Minimal unnecessary client-side JavaScript
- Efficient database queries

Avoid unnecessary frontend libraries.

## 28. Mobile Experience

Mobile is a high-priority requirement because social-media traffic will frequently originate from mobile devices.

The website must work correctly on:

- Mobile
- Tablet
- Desktop

Article content must remain comfortable to read on small screens.

## 29. AdSense Readiness

The website should be built with future Google AdSense usage in mind.

The website must prioritize:

- Original and useful content
- Clear navigation
- Good user experience
- Readable pages
- Mobile responsiveness
- Fast loading
- Meaningful content
- Proper legal/trust pages
- No misleading content
- No deceptive navigation
- No artificial ad-click behavior

Advertising should never be allowed to destroy the reading experience.

The project does NOT guarantee AdSense approval. Approval depends on Google's current policies and review process.

## 30. Trust and Legal Pages

The website must contain:

- About
- Contact
- Privacy Policy
- Terms & Conditions

These pages must be accessible from the footer.

Privacy-related disclosures must be updated appropriately when analytics, advertising, cookies, or other tracking systems are introduced.

## 31. Security

The application must:

- Protect admin routes
- Hash passwords
- Validate input
- Validate environment variables
- Protect database credentials
- Protect authentication secrets
- Prevent unauthorized mutations
- Sanitize article content
- Validate uploaded files
- Prevent unsafe file uploads
- Avoid exposing server secrets

Secrets must never be committed to Git.

## 32. Code Quality

The codebase should:

- Use TypeScript
- Use reusable components
- Separate database logic from UI
- Keep modules understandable
- Avoid unnecessary abstraction
- Avoid duplicate logic
- Use clear naming
- Use validation
- Use consistent error handling

The application should remain easy for a single developer to maintain.

## 33. Development Philosophy

The project must remain lightweight.

Do NOT introduce:

- PostgreSQL
- Prisma
- Express
- Redis
- Elasticsearch
- Kubernetes
- Microservices
- Complex queues
- Complex analytics infrastructure

unless there is a demonstrated future requirement.

MongoDB + Mongoose is the intended database architecture for V1. Next.js is the intended application architecture. Vercel is the intended deployment platform.

## 34. V1 Success Criteria

V1 is successful when:

1. The website is deployed.
2. The administrator can log in.
3. The administrator can create a blog/article.
4. The administrator can save it as a draft.
5. The administrator can publish it.
6. The article receives a clean public URL.
7. The article has SEO metadata.
8. The article appears in relevant listings.
9. Related content works.
10. The administrator can create jobs.
11. Jobs have individual public pages.
12. Job Apply buttons work.
13. Search works.
14. Sitemap works.
15. robots.txt works.
16. Mobile layout works.
17. Legal/trust pages exist.
18. Production build succeeds.
19. The application can be deployed to Vercel.
20. The website is ready for the owner to begin publishing substantial useful content.

## 35. Future Features

These are NOT V1 requirements.

Possible future features:

- User accounts
- Bookmarks
- Comments
- Newsletter
- Job alerts
- Resume builder
- Mock interviews
- Coding practice
- AI-assisted content workflows
- Automated job ingestion
- Advanced search
- Personalized recommendations
- Premium content
- Sponsored jobs
- Advanced analytics

Only implement these after the V1 is stable.

## 36. Final Engineering Principle

The project should optimize for:

```
Useful Content
      +
Easy Publishing
      +
SEO
      +
Excellent UX
      +
Performance
      +
Maintainability
      +
AdSense Readiness
```

The project should NOT optimize for unnecessary technical complexity.

The final product should feel like a legitimate, useful developer/career publication that can grow continuously over time.

---

## Global Development Instructions (apply to every phase)

- Read `SRS.md` before making any changes. The SRS is the source of truth for this project.
- We are building a lightweight production MVP for a developer jobs and knowledge publishing platform.
- The primary business goal is to build a useful content website that can attract traffic and eventually qualify for Google AdSense monetization.
- Do not over-engineer the application.
- Required stack: Next.js, TypeScript, Tailwind CSS, MongoDB Atlas, Mongoose, Vercel.
- Do not introduce PostgreSQL, Prisma, Express, Redis, Elasticsearch, microservices, Docker, Kubernetes, or other infrastructure unless explicitly requested.
- Implement ONLY the current phase. Do not implement future features. Do not silently expand the scope.
- Before modifying existing files, inspect the current implementation. Preserve working functionality.
- Prefer simple, maintainable production code.
- Validate all inputs. Never expose secrets to the client.
- After implementation, run the appropriate TypeScript checks, ESLint, tests, and production build.
- Do not claim that functionality works unless it has been verified.
- At the end of every phase, report: (1) what was implemented, (2) files created, (3) files modified, (4) dependencies added, (5) environment variables required, (6) commands executed, (7) test results, (8) build results, (9) known issues, (10) suggested next phase.
- Stop after completing the requested phase.
