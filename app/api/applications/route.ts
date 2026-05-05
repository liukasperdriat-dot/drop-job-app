import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { job_id, job_title, company, location, contract, salary } = await request.json()

  if (!job_title || !company) {
    return NextResponse.json({ error: 'job_title et company sont requis' }, { status: 400 })
  }

  if (job_id) {
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', user.id)
      .eq('job_id', job_id)
      .maybeSingle()
    if (existing) return NextResponse.json({ duplicate: true, id: existing.id })
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({ user_id: user.id, job_id, job_title, company, location, contract, salary })
    .select('id')
    .single()

  if (error) {
    console.error('[applications] insert error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ applications: data })
}
