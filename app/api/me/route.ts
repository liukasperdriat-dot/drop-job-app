import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { currentCvCount } from '@/lib/quota'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ is_premium: false })

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    is_premium: data?.is_premium ?? false,
    cv_count_this_month: currentCvCount(data),
  })
}
