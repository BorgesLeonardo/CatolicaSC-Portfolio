import { S3Client } from '@aws-sdk/client-s3'

// Centralized S3 client. Requires the following env vars:
// - AWS_REGION
// - AWS_ACCESS_KEY_ID
// - AWS_SECRET_ACCESS_KEY
// Optional:
// - S3_BUCKET (bucket where media will be stored)
// - ASSETS_BASE_URL (CloudFront or custom domain for public URLs)

export const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1'
})

export function getBucketName(): string {
  const name = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET
  if (!name) {
    throw new Error('S3_BUCKET (or AWS_S3_BUCKET) env var is required')
  }
  return name
}

export function getPublicBaseUrl(): string {
  const custom = (process.env.ASSETS_BASE_URL || '').replace(/\/$/, '')
  if (custom) return custom

  const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET
  const region = process.env.AWS_REGION || 'us-east-1'
  if (!bucket) return ''
  // Default S3 website-style public URL (object must be public if used directly)
  return `https://${bucket}.s3.${region}.amazonaws.com`
}

export function buildPublicUrl(key: string): string {
  const base = getPublicBaseUrl()
  return base ? `${base}/${key}` : `s3://${getBucketName()}/${key}`
}

export function tryExtractKeyFromUrl(url: string | null | undefined): string | null {
  if (!url) return null

  const base = getPublicBaseUrl()
  if (base && url.startsWith(base)) {
    return url.substring(base.length + 1)
  }

  // Accept s3://bucket/key format as well
  const s3Match = url.match(/^s3:\/\/[^/]+\/(.+)$/)
  if (s3Match) return s3Match[1] ?? null

  return null
}


