'use client'

import React from 'react'
import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer'

// ── CLASSIQUE ──────────────────────────────────────────────────────────────
// Fond blanc, Times, ligne noire sous le nom, traits fins sous chaque section

const cl = StyleSheet.create({
  page: {
    paddingTop: 57,
    paddingBottom: 57,
    paddingLeft: 57,
    paddingRight: 57,
    backgroundColor: '#ffffff',
  },
  name: {
    fontFamily: 'Times-Bold',
    fontSize: 22,
    color: '#000000',
    marginBottom: 7,
  },
  nameLine: {
    borderBottomWidth: 0.8,
    borderBottomColor: '#000000',
    marginBottom: 5,
  },
  jobTitle: {
    fontFamily: 'Times-Italic',
    fontSize: 11,
    color: '#505050',
    marginBottom: 4,
  },
  contact: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: '#646464',
    marginBottom: 12,
  },
  sectionLabel: {
    fontFamily: 'Times-Bold',
    fontSize: 10,
    color: '#000000',
    marginTop: 7,
    marginBottom: 3,
  },
  sectionLine: {
    borderBottomWidth: 0.25,
    borderBottomColor: '#000000',
    marginBottom: 6,
  },
  body: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: '#323232',
    lineHeight: 1.5,
    marginBottom: 4,
  },
  expTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 11,
    color: '#000000',
    marginBottom: 2,
  },
  expSub: {
    fontFamily: 'Times-Italic',
    fontSize: 9.5,
    color: '#505050',
    marginBottom: 3,
  },
  watermark: {
    position: 'absolute',
    bottom: 28,
    right: 57,
    fontSize: 6.5,
    color: '#c8c8cd',
    fontFamily: 'Times-Roman',
  },
})

export function ClassiquePDF({ cv, profile }: { cv: any; profile: any }) {
  const contact = [profile?.email, profile?.phone, profile?.location]
    .filter(Boolean).join('   ·   ')

  return (
    <Document>
      <Page size="A4" style={cl.page}>
        <Text style={cl.name}>{cv.name || ''}</Text>
        <View style={cl.nameLine} />
        {cv.title ? <Text style={cl.jobTitle}>{cv.title}</Text> : null}
        {contact ? <Text style={cl.contact}>{contact}</Text> : null}

        {cv.summary ? (
          <View>
            <Text style={cl.sectionLabel}>RÉSUMÉ</Text>
            <View style={cl.sectionLine} />
            <Text style={cl.body}>{cv.summary}</Text>
          </View>
        ) : null}

        {cv.experience?.length > 0 ? (
          <View>
            <Text style={cl.sectionLabel}>EXPÉRIENCE</Text>
            <View style={cl.sectionLine} />
            {cv.experience.map((exp: any, i: number) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={cl.expTitle}>{exp.title}</Text>
                <Text style={cl.expSub}>{exp.company}{exp.period ? `  ·  ${exp.period}` : ''}</Text>
                {exp.description ? <Text style={cl.body}>{exp.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {cv.skills?.length > 0 ? (
          <View>
            <Text style={cl.sectionLabel}>COMPÉTENCES</Text>
            <View style={cl.sectionLine} />
            <Text style={cl.body}>{cv.skills.join(' · ')}</Text>
          </View>
        ) : null}

        {cv.education?.length > 0 ? (
          <View>
            <Text style={cl.sectionLabel}>FORMATION</Text>
            <View style={cl.sectionLine} />
            {cv.education.map((edu: any, i: number) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={cl.expTitle}>{edu.degree}</Text>
                <Text style={cl.expSub}>{edu.school}{edu.period ? `  ·  ${edu.period}` : ''}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {cv.languages?.length > 0 ? (
          <View>
            <Text style={cl.sectionLabel}>LANGUES</Text>
            <View style={cl.sectionLine} />
            <Text style={cl.body}>{cv.languages.map((l: any) => `${l.name} (${l.level})`).join(' · ')}</Text>
          </View>
        ) : null}

        {cv.watermark ? <Text style={cl.watermark}>drop-job.fr</Text> : null}
      </Page>
    </Document>
  )
}

// ── MODERNE ────────────────────────────────────────────────────────────────
// Header rectangle bleu #2563EB, nom blanc bold, barres verticales bleues

const md = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 43,
    paddingBottom: 34,
    paddingLeft: 57,
    paddingRight: 57,
  },
  headerName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: '#ffffff',
    marginBottom: 5,
  },
  headerTitle: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#b4d2ff',
    marginBottom: 5,
  },
  headerContact: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#a0c3ff',
  },
  content: {
    paddingTop: 28,
    paddingBottom: 57,
    paddingLeft: 57,
    paddingRight: 57,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 7,
  },
  sectionBar: {
    width: 3,
    height: 12,
    backgroundColor: '#2563EB',
    marginRight: 5,
  },
  sectionLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#2563EB',
  },
  body: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#464648',
    lineHeight: 1.5,
    marginBottom: 4,
  },
  expTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#1d1d1f',
    marginBottom: 2,
  },
  expSub: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#2563EB',
    marginBottom: 3,
  },
  watermark: {
    position: 'absolute',
    bottom: 28,
    right: 57,
    fontSize: 6.5,
    color: '#c8c8cd',
    fontFamily: 'Helvetica',
  },
})

function ModerneSection({ title }: { title: string }) {
  return (
    <View style={md.sectionRow}>
      <View style={md.sectionBar} />
      <Text style={md.sectionLabel}>{title.toUpperCase()}</Text>
    </View>
  )
}

export function ModernePDF({ cv, profile }: { cv: any; profile: any }) {
  const contact = [profile?.email, profile?.phone, profile?.location, profile?.linkedin]
    .filter(Boolean).join('   ·   ')

  return (
    <Document>
      <Page size="A4" style={md.page}>
        <View style={md.header}>
          <Text style={md.headerName}>{cv.name || ''}</Text>
          {cv.title ? <Text style={md.headerTitle}>{cv.title}</Text> : null}
          {contact ? <Text style={md.headerContact}>{contact}</Text> : null}
        </View>

        <View style={md.content}>
          {cv.summary ? (
            <View>
              <ModerneSection title="Résumé" />
              <Text style={md.body}>{cv.summary}</Text>
            </View>
          ) : null}

          {cv.experience?.length > 0 ? (
            <View>
              <ModerneSection title="Expérience" />
              {cv.experience.map((exp: any, i: number) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text style={md.expTitle}>{exp.title}</Text>
                  <Text style={md.expSub}>{exp.company}{exp.period ? `   ·   ${exp.period}` : ''}</Text>
                  {exp.description ? <Text style={md.body}>{exp.description}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {cv.skills?.length > 0 ? (
            <View>
              <ModerneSection title="Compétences" />
              <Text style={[md.body, { marginBottom: 8 }]}>{cv.skills.join('   ·   ')}</Text>
            </View>
          ) : null}

          {cv.education?.length > 0 ? (
            <View>
              <ModerneSection title="Formation" />
              {cv.education.map((edu: any, i: number) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Text style={md.expTitle}>{edu.degree}</Text>
                  <Text style={md.expSub}>{edu.school}{edu.period ? `   ·   ${edu.period}` : ''}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {cv.languages?.length > 0 ? (
            <View>
              <ModerneSection title="Langues" />
              <Text style={md.body}>{cv.languages.map((l: any) => `${l.name} (${l.level})`).join('   ·   ')}</Text>
            </View>
          ) : null}
        </View>

        {cv.watermark ? <Text style={md.watermark}>drop-job.fr</Text> : null}
      </Page>
    </Document>
  )
}

// ── MINIMALISTE ────────────────────────────────────────────────────────────
// Nom centré gris foncé 24pt, marges 28mm, titres #888888 espacés, aucune bordure

const mn = StyleSheet.create({
  page: {
    paddingTop: 79,
    paddingBottom: 79,
    paddingLeft: 79,
    paddingRight: 79,
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#ffffff',
  },
  name: {
    fontFamily: 'Helvetica',
    fontSize: 24,
    color: '#141416',
    textAlign: 'center',
    marginBottom: 5,
  },
  jobTitle: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#969698',
    textAlign: 'center',
    marginBottom: 4,
  },
  contact: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#aaaaad',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#888888',
    letterSpacing: 2,
    marginTop: 10,
    marginBottom: 5,
  },
  body: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#323234',
    lineHeight: 1.5,
    marginBottom: 4,
  },
  expTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    color: '#141416',
    marginBottom: 2,
  },
  expSub: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#828285',
    marginBottom: 3,
  },
  watermark: {
    position: 'absolute',
    bottom: 28,
    right: 79,
    fontSize: 6.5,
    color: '#c8c8cd',
    fontFamily: 'Helvetica',
  },
})

export function MinimalistePDF({ cv, profile }: { cv: any; profile: any }) {
  const contact = [profile?.email, profile?.phone, profile?.location]
    .filter(Boolean).join('   ·   ')

  return (
    <Document>
      <Page size="A4" style={mn.page}>
        <Text style={mn.name}>{cv.name || ''}</Text>
        {cv.title ? <Text style={mn.jobTitle}>{cv.title}</Text> : null}
        {contact ? <Text style={mn.contact}>{contact}</Text> : null}

        {cv.summary ? (
          <View>
            <Text style={mn.sectionLabel}>RÉSUMÉ</Text>
            <Text style={mn.body}>{cv.summary}</Text>
          </View>
        ) : null}

        {cv.experience?.length > 0 ? (
          <View>
            <Text style={mn.sectionLabel}>EXPÉRIENCE</Text>
            {cv.experience.map((exp: any, i: number) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={mn.expTitle}>{exp.title}</Text>
                <Text style={mn.expSub}>{exp.company}{exp.period ? `   ·   ${exp.period}` : ''}</Text>
                {exp.description ? <Text style={mn.body}>{exp.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {cv.skills?.length > 0 ? (
          <View>
            <Text style={mn.sectionLabel}>COMPÉTENCES</Text>
            <Text style={[mn.body, { marginBottom: 8 }]}>{cv.skills.join('   ·   ')}</Text>
          </View>
        ) : null}

        {cv.education?.length > 0 ? (
          <View>
            <Text style={mn.sectionLabel}>FORMATION</Text>
            {cv.education.map((edu: any, i: number) => (
              <View key={i} style={{ marginBottom: 5 }}>
                <Text style={mn.expTitle}>{edu.degree}</Text>
                <Text style={mn.expSub}>{edu.school}{edu.period ? `   ·   ${edu.period}` : ''}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {cv.languages?.length > 0 ? (
          <View>
            <Text style={mn.sectionLabel}>LANGUES</Text>
            <Text style={mn.body}>{cv.languages.map((l: any) => `${l.name} (${l.level})`).join('   ·   ')}</Text>
          </View>
        ) : null}

        {cv.watermark ? <Text style={mn.watermark}>drop-job.fr</Text> : null}
      </Page>
    </Document>
  )
}

// ── Téléchargement ─────────────────────────────────────────────────────────

export async function downloadCV(
  template: string,
  cv: any,
  profile: any,
  company: string,
) {
  let element: React.ReactElement
  if (template === 'classique') {
    element = <ClassiquePDF cv={cv} profile={profile} />
  } else if (template === 'moderne') {
    element = <ModernePDF cv={cv} profile={profile} />
  } else {
    element = <MinimalistePDF cv={cv} profile={profile} />
  }

  const blob = await pdf(element).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `CV_${(cv.name || 'cv').replace(/\s+/g, '_')}_${company || 'drop-job'}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
