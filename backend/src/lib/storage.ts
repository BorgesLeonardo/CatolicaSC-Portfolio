import 'dotenv/config'

export interface PresignParams {
  key: string
  contentType: string
  expiresInSeconds?: number
}

export function isS3Enabled(): boolean {
  return (
    process.env.ENABLE_S3_UPLOADS === 'true' &&
    !!process.env.S3_BUCKET &&
    (!!process.env.S3_ACCESS_KEY_ID && !!process.env.S3_SECRET_ACCESS_KEY || !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY)
  )
}

export function getPublicBaseUrl(): string | null {
  if (!isS3Enabled()) return null
  if (process.env.S3_PUBLIC_BASE_URL) return process.env.S3_PUBLIC_BASE_URL.replace(/\/$/, '')
  const region = process.env.S3_REGION || 'us-east-1'
  const bucket = process.env.S3_BUCKET as string
  return `https://${bucket}.s3.${region}.amazonaws.com`
}

export async function getPresignedPutUrl(params: PresignParams): Promise<string> {
  if (!isS3Enabled()) throw new Error('S3 uploads not enabled')

  const region = process.env.S3_REGION || 'us-east-1'
  const bucket = process.env.S3_BUCKET as string

  // Dynamic import to avoid compile-time dependency when disabled
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const AWS = await import('@aws-sdk/client-s3').catch(() => null as unknown as any)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const S3Presigner = await import('@aws-sdk/s3-request-presigner').catch(() => null as unknown as any)

  if (!AWS || !S3Presigner) {
    throw new Error('S3 SDK not installed')
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const client = new AWS.S3Client({
    region,
    credentials: {
      accessKeyId: (process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) as string,
      secretAccessKey: (process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY) as string
    },
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: !!process.env.S3_ENDPOINT // for some S3-compatible providers
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const command = new AWS.PutObjectCommand({
    Bucket: bucket,
    Key: params.key,
    ContentType: params.contentType,
    ACL: process.env.S3_ACL || 'public-read'
  })

  const expiresIn = params.expiresInSeconds ?? 60 * 5
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const url = await S3Presigner.getSignedUrl(client, command, { expiresIn })
  return url as unknown as string
}


