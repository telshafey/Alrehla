// Vercel Edge Function - Send Email API with Rate Limiting
export const config = {
  runtime: 'edge',
};

// Simple in-memory rate limiter for Edge Functions
// In production, use Redis or a similar distributed store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const RATE_LIMIT_MAX = 5; // 5 requests per hour per IP

function getClientIP(request: Request): string {
  // X-Forwarded-For is set by Vercel's edge network
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // New window or expired window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, resetTime: record.resetTime };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// This is a mock email sending function.
// In a real production app, you would integrate a service like Resend, SendGrid, or Nodemailer.
export default async function handler(request: Request) {
  // --- Rate Limiting ---
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP);

  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
        },
      }
    );
  }

  // --- Method Check ---
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { to, subject, html } = await request.json();

    // --- Input Validation ---
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!isValidEmail(to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (subject.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Subject too long (max 200 characters)' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // --- MOCK EMAIL SENDING ---
    console.log('===================================');
    console.log('📧 MOCK EMAIL SENT 📧');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('----------------- BODY -----------------');
    console.log(html.substring(0, 500) + (html.length > 500 ? '...' : ''));
    console.log('===================================');

    return new Response(
      JSON.stringify({ message: 'Email sent successfully (simulated)' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
        },
      }
    );
  } catch (err) {
    console.error('Email API Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: 'Failed to send email.', details: errorMessage }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
