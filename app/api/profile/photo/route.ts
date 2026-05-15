import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('photo') as File | null
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: 'Fichier trop lourd (max 2 Mo)' }, { status: 400 })
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    return NextResponse.json({ error: 'Format invalide (JPG ou PNG uniquement)' }, { status: 400 })
  }

  const admin = adminClient()
  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const path = `${user.id}/photo.${ext}`

  const { error: uploadError } = await admin.storage
    .from('cv-photos')
    .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from('cv-photos').getPublicUrl(path)
  const photoUrl = `${publicUrl}?t=${Date.now()}`

  await supabase.from('user_profiles').upsert(
    { user_id: user.id, photo_url: photoUrl, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )

  return NextResponse.json({ photo_url: photoUrl })
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = adminClient()
  await admin.storage.from('cv-photos').remove([
    `${user.id}/photo.jpg`,
    `${user.id}/photo.png`,
  ])

  await supabase.from('user_profiles')
    .update({ photo_url: null, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
