import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Statuts proposés dans le tableau de bord
const ALLOWED_STATUSES = ['En cours', 'Entretien', 'Accepté', 'Refusé']

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', (await params).id)
    .eq('user_id', user.id)

  if (error) {
    console.error('[applications] delete error:', error.code, error.message)
    return NextResponse.json({ error: 'Une erreur est survenue. Réessayez dans un instant.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { status } = await request.json().catch(() => ({}))
  if (!ALLOWED_STATUSES.includes(status)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })

  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', (await params).id)
    .eq('user_id', user.id)

  if (error) {
    console.error('[applications] update error:', error.code, error.message)
    return NextResponse.json({ error: 'Une erreur est survenue. Réessayez dans un instant.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
