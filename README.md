# Blackspot Website

A Vercel-ready Next.js website for Blackspot, including:

- Multi-page marketing website
- Blog listing and article layouts
- Proof-of-work portfolio with image, video, gallery and case-study formats
- CMS administration at `/admin`
- Audit-platform calls to action with source tracking

## Deploy to Vercel

1. Upload this folder to a GitHub repository, or import the folder directly into Vercel.
2. Choose **Next.js** when Vercel detects the framework.
3. Keep the default build command: `npm run build`.
4. Set the environment variables below, then deploy.

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB` | Database name (`blackspot` by default) |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 API token with object read/write |
| `R2_BUCKET_NAME` | Bucket for uploaded media |
| `R2_PUBLIC_URL` | Public bucket URL (`https://pub-….r2.dev` or a custom domain) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First CMS user, created by the seed script |
| `AUTH_SECRET` | Random string, at least 32 characters, used to sign admin sessions |

Enable **public access** on the R2 bucket, or attach a custom domain, so published images and video can be loaded on the site.

## Seed the CMS

With `.env.local` set:

```bash
npm run seed
```

This creates the admin user if it does not exist, adds unique indexes, and inserts the current public blog and proof-of-work records. Existing slugs are left unchanged.

Sign in at `/admin/login`.

## Content and media

Published posts live in MongoDB. The admin editor can save drafts or publish; publish refreshes `/work` and `/blog`.

Images are compressed in the browser before upload (WebP, quality 0.85, longest edge 2560px), then sent to R2 with a short-lived presigned URL so files never pass through Vercel’s request-size limit. Videos are not transcoded; they upload as-is, up to 200MB.
