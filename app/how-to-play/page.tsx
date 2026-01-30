'use client'

import { useState } from 'react'
import Link from 'next/link'
import { generateBreadcrumbSchema } from '@/lib/seo'

// Video: YouTube URL (e.g. https://www.youtube.com/watch?v=...) or file in public/ (e.g. /how-to-play.mp4)
const VIDEO_URL =
  process.env.NEXT_PUBLIC_HOW_TO_PLAY_VIDEO_URL || 'https://youtu.be/nxtyDh9SD-Q'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zambaara.com'

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

// PDF rulebook path
const PDF_URL = '/Pdf rulebook.pdf'

// Breadcrumb data
const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'How to Play', url: '/how-to-play' },
]

export default function HowToPlayPage() {
  const [activeTab, setActiveTab] = useState<'video' | 'rulebook'>('video')
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)

  return (
    <>
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* HowTo Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Play Zambaara',
            description: 'Learn how to play Zambaara - the ultimate elemental card game. Master the elements and become the Zampion.',
            image: `${SITE_URL}/og-image.jpg`,
            totalTime: 'PT30M',
            estimatedCost: {
              '@type': 'MonetaryAmount',
              currency: 'INR',
              value: '799',
            },
            supply: [
              { '@type': 'HowToSupply', name: 'Zambaara Card Deck' },
              { '@type': 'HowToSupply', name: 'Bracelets' },
            ],
            tool: [
              { '@type': 'HowToTool', name: '2-8 Players' },
            ],
            step: [
              {
                '@type': 'HowToStep',
                name: 'Setup',
                text: 'Distribute cards equally among all players and place bracelets in the center.',
              },
              {
                '@type': 'HowToStep',
                name: 'Learn the Elements',
                text: 'Understand the elemental cycle: Lava beats Wind, Wind beats Rain, Rain beats Lava, Mountain blocks all.',
              },
              {
                '@type': 'HowToStep',
                name: 'Play Cards',
                text: 'Take turns playing cards strategically to win rounds and collect bracelets.',
              },
              {
                '@type': 'HowToStep',
                name: 'Use Special Cards',
                text: 'Deploy Meteor, Lightning, Freeze, or Reverse cards at key moments to turn the tide.',
              },
              {
                '@type': 'HowToStep',
                name: 'Win',
                text: 'Collect all bracelets to become the Zampion!',
              },
            ],
          }),
        }}
      />

      <main className="min-h-screen relative pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-5xl">
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
          className="text-center mb-8 max-w-2xl mx-auto"
          style={{
            fontFamily: "'BlinkerRegular', sans-serif",
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '18px',
          }}
        >
          Watch the video or read the rulebook to master the elements.
        </p>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('video')}
            className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wide transition-all"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              backgroundColor: activeTab === 'video' ? '#d1a058' : 'transparent',
              border: '2px solid #d1a058',
              color: activeTab === 'video' ? '#000' : '#d1a058',
              boxShadow: activeTab === 'video' ? '0 4px 15px rgba(209, 160, 88, 0.3)' : 'none',
            }}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Video Guide
            </span>
          </button>
          <button
            onClick={() => setActiveTab('rulebook')}
            className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wide transition-all"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              backgroundColor: activeTab === 'rulebook' ? '#d1a058' : 'transparent',
              border: '2px solid #d1a058',
              color: activeTab === 'rulebook' ? '#000' : '#d1a058',
              boxShadow: activeTab === 'rulebook' ? '0 4px 15px rgba(209, 160, 88, 0.3)' : 'none',
            }}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Rulebook
            </span>
          </button>
        </div>

        {/* Video Section */}
        {activeTab === 'video' && (
          <div className="animate-fadeIn">
            <div
              className="relative w-full rounded-xl overflow-hidden mb-10"
              style={{
                aspectRatio: '16/9',
                boxShadow: '0 8px 32px rgba(209, 160, 88, 0.2), 0 0 0 2px rgba(209, 160, 88, 0.3)',
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
          </div>
        )}

        {/* Rulebook PDF Section */}
        {activeTab === 'rulebook' && (
          <div className="animate-fadeIn">
            {/* PDF Viewer Container */}
            <div
              className="relative w-full rounded-xl overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(209, 160, 88, 0.2), 0 0 0 2px rgba(209, 160, 88, 0.3)',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
              }}
            >
              {/* PDF Header */}
              <div 
                className="flex items-center justify-between px-6 py-4"
                style={{
                  background: 'linear-gradient(180deg, rgba(209, 160, 88, 0.15) 0%, rgba(0, 0, 0, 0.8) 100%)',
                  borderBottom: '1px solid rgba(209, 160, 88, 0.3)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(209, 160, 88, 0.3) 0%, rgba(209, 160, 88, 0.1) 100%)',
                      border: '1px solid rgba(209, 160, 88, 0.4)',
                    }}
                  >
                    <svg className="w-5 h-5" style={{ color: '#d1a058' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 
                      className="text-lg font-semibold"
                      style={{
                        fontFamily: "'BlinkerSemiBold', sans-serif",
                        color: '#d1a058',
                      }}
                    >
                      Zambaara Rulebook
                    </h3>
                    <p 
                      className="text-sm"
                      style={{
                        fontFamily: "'BlinkerRegular', sans-serif",
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}
                    >
                      Official Game Rules & Guide
                    </p>
                  </div>
                </div>
                
                {/* Download Button */}
                <a
                  href={PDF_URL}
                  download="Zambaara-Rulebook.pdf"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  style={{
                    fontFamily: "'BlinkerSemiBold', sans-serif",
                    background: 'linear-gradient(180deg, #f4d03f 0%, #d1a058 100%)',
                    color: '#000',
                    boxShadow: '0 4px 15px rgba(209, 160, 88, 0.2)',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
              </div>

              {/* PDF Embed */}
              <div 
                style={{ height: '80vh', minHeight: '600px', overflow: 'auto' }}
                className="pdf-container"
              >
                <object
                  data={`${PDF_URL}#view=FitH&scrollbar=1&toolbar=1&navpanes=0`}
                  type="application/pdf"
                  className="w-full h-full"
                  style={{
                    border: 'none',
                    backgroundColor: '#1a1a1a',
                    minHeight: '100%',
                  }}
                >
                  {/* Fallback for browsers that don't support object/embed */}
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <svg 
                      className="w-16 h-16 mb-4" 
                      style={{ color: '#d1a058' }} 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <p 
                      className="text-lg mb-4"
                      style={{
                        fontFamily: "'BlinkerRegular', sans-serif",
                        color: 'rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      Unable to display PDF in browser
                    </p>
                    <a
                      href={PDF_URL}
                      download="Zambaara-Rulebook.pdf"
                      className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
                      style={{
                        fontFamily: "'BlinkerSemiBold', sans-serif",
                        background: 'linear-gradient(180deg, #f4d03f 0%, #d1a058 100%)',
                        color: '#000',
                        boxShadow: '0 4px 15px rgba(209, 160, 88, 0.2)',
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF Instead
                    </a>
                  </div>
                </object>
              </div>

              {/* PDF Footer */}
              <div 
                className="px-6 py-4 flex items-center justify-between"
                style={{
                  background: 'linear-gradient(0deg, rgba(209, 160, 88, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
                  borderTop: '1px solid rgba(209, 160, 88, 0.3)',
                }}
              >
                <p 
                  className="text-sm"
                  style={{
                    fontFamily: "'BlinkerRegular', sans-serif",
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  Scroll to read • Pinch to zoom on mobile
                </p>
                <a
                  href={PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
                  style={{
                    fontFamily: "'BlinkerRegular', sans-serif",
                    color: '#d1a058',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in new tab
                </a>
              </div>
            </div>

            {/* Quick Tips Section */}
            <div 
              className="mt-8 p-6 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(209, 160, 88, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%)',
                border: '1px solid rgba(209, 160, 88, 0.2)',
              }}
            >
              <h3 
                className="text-xl font-semibold mb-4 flex items-center gap-2"
                style={{
                  fontFamily: "'TheWalkyrDemo', serif",
                  color: '#d1a058',
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Quick Tips
              </h3>
              <ul 
                className="space-y-2"
                style={{
                  fontFamily: "'BlinkerRegular', sans-serif",
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <li className="flex items-start gap-2">
                  <span style={{ color: '#d1a058' }}>•</span>
                  Master the elemental cycle to predict your opponent&apos;s moves
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#d1a058' }}>•</span>
                  Special cards like Meteor and Freeze can turn the tide of battle
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#d1a058' }}>•</span>
                  Collect bracelets to become the ultimate Zampion
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Fade-in animation style */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .pdf-container object {
          display: block;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </main>
    </>
  )
}
