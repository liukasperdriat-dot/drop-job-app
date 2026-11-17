import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { currentCvCount } from '@/lib/quota'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ logged_in: false, is_premium: false })

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    return NextResponse.json({
      logged_in: true,
      is_premium: data?.is_premium ?? false,
      cv_count_this_month: currentCvCount(data),
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[me]', err instanceof Error ? err.message : err)
    return NextResponse.json({ logged_in: false, is_premium: false }, { status: 500 })
  }
}
