import { Metadata } from 'next'
import Link from 'next/link'
import { generateSEOMetadata } from '@/lib/seo'

// Video: YouTube URL (e.g. https://www.youtube.com/watch?v=...) or file in public/ (e.g. /how-to-play.mp4)
const VIDEO_URL =
  process.env.NEXT_PUBLIC_HOW_TO_PLAY_VIDEO_URL || 'https://www.youtube.com/watch?v=kGqZHLC8GUg'

function isYouTubeUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com' || u.hostname === 'youtu.be'
  } catch {
    return false
  }
}

function getYouTubeEmbedUrl(url: string): string {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`
    }
    const v = u.searchParams.get('v')
    return v ? `https://www.youtube.com/embed/${v}` : url
  } catch {
    return url
  }
}

// Your PDF: put in public/ (e.g. how-to-play.pdf) or set full URL in env
const PDF_URL =
  process.env.NEXT_PUBLIC_HOW_TO_PLAY_PDF_URL || '/how-to-play.pdf'

export const metadata: Metadata = generateSEOMetadata({
  title: 'How to Play',
  description:
    'Learn how to play Zambaara - Master the Elements, Win the Bracelets, Become the Zampion.',
  url: '/how-to-play',
  keywords: ['how to play', 'zambaara', 'rules', 'game guide'],
})

export default function HowToPlayPage() {
  return (
    <main className="min-h-screen relative pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back link */}
        <Link
          href="/#hero"
          className="inline-flex items-center gap-2 mb-8 transition-opacity duration-300 hover:opacity-80"
          style={{
            fontFamily: "'BlinkerRegular', sans-serif",
            color: '#d1a058',
            fontSize: '14px',
          }}
        >
          <span aria-hidden>←</span> Back to Home
        </Link>

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#d1a058',
            textShadow:
              '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(209, 160, 88, 0.2)',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}
        >
          How to Play
        </h1>
        <p
          className="text-center mb-12 max-w-2xl mx-auto"
          style={{
            fontFamily: "'BlinkerRegular', sans-serif",
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '18px',
          }}
        >
          Watch the video below to learn the rules, or download the PDF guide.
        </p>

        {/* Video player – YouTube embed or direct video file */}
        <div
          className="relative w-full rounded-xl overflow-hidden mb-10"
          style={{
            aspectRatio: '16/9',
            boxShadow: '0 8px 32px rgba(209, 160, 88, 0.2), 0 0 0 2px rgba(209, 160, 88, 0.2)',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          {isYouTubeUrl(VIDEO_URL) ? (
            <iframe
              src={getYouTubeEmbedUrl(VIDEO_URL)}
              title="How to Play Zambaara"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <video
              src={VIDEO_URL}
              controls
              playsInline
              className="absolute inset-0 w-full h-full object-contain bg-black"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* PDF download button */}
        <div className="flex justify-center">
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            {...(PDF_URL.startsWith('/') ? { download: 'how-to-play.pdf' } : {})}
            className="inline-flex items-center gap-3 px-10 py-4 font-semibold uppercase tracking-wide rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_20px_rgba(209,160,88,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background:
                'linear-gradient(180deg, #f4d03f 0%, #d1a058 100%)',
              border: 'none',
              color: '#000000',
              boxShadow:
                '0 4px 15px rgba(209, 160, 88, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              letterSpacing: '1px',
              textDecoration: 'none',
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download PDF – How to Play
          </a>
        </div>
      </div>
    </main>
  )
}
