import React from 'react'

export function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-[170px] animate-pulse">
      <div className="rounded-xl bg-[#121a24] w-full h-[255px] ring-1 ring-white/5" />
      <div className="mt-2 h-3 bg-[#121a24] rounded w-3/4" />
      <div className="mt-1 h-2 bg-[#121a24] rounded w-1/2" />
    </div>
  )
}

export function SkeletonCarousel({ count = 8 }) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-[#121a24] rounded w-40 animate-pulse" />
        <div className="h-4 bg-[#121a24] rounded w-16 animate-pulse" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </section>
  )
}

export function SkeletonHero() {
  return (
    <div className="hero animate-pulse bg-[#121a24]">
      <div className="hero-inner">
        <div className="flex gap-2 mb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-1 w-4 rounded-full bg-[#1e2a36]" />
          ))}
        </div>
        <div className="h-10 bg-[#1e2a36] rounded w-96 max-w-full mb-3" />
        <div className="h-4 bg-[#1e2a36] rounded w-24 mb-3" />
        <div className="space-y-2 mb-5">
          <div className="h-3 bg-[#1e2a36] rounded w-full max-w-xl" />
          <div className="h-3 bg-[#1e2a36] rounded w-3/4 max-w-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-[#1e2a36] rounded-lg w-32" />
          <div className="h-10 bg-[#1e2a36] rounded-lg w-36" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="flex flex-wrap gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-[170px] animate-pulse">
          <div className="rounded-xl bg-[#121a24] w-full h-[255px]" />
          <div className="mt-2 h-3 bg-[#121a24] rounded w-3/4" />
        </div>
      ))}
    </div>
  )
}
