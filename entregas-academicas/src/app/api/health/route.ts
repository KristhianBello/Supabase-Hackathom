import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startedAt = performance.now()

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('health_check')

    if (error) {
      return NextResponse.json(
        { status: 'error', supabase: 'unavailable' },
        {
          status: 503,
          headers: { 'Cache-Control': 'no-store' },
        },
      )
    }

    return NextResponse.json(
      {
        status: 'ok',
        supabase: data,
        latency_ms: Math.round(performance.now() - startedAt),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return NextResponse.json(
      { status: 'error', supabase: 'misconfigured' },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }
}
