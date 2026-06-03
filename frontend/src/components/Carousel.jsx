import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import PosterCard from './PosterCard'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
}

const child = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
}

export default function Carousel({ title, items, onPosterClick, onViewMore, loadingMore }){
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.7
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold">{title}</h2>
        {onViewMore && (
          <button
            onClick={onViewMore}
            disabled={loadingMore}
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {loadingMore ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            ) : (
              <>
                Ver todo
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </>
            )}
          </button>
        )}
      </div>
      <div className="relative group">
        <button onClick={()=>scroll('left')} className="absolute left-0 top-0 bottom-0 z-10 w-10 md:w-12 bg-gradient-to-r from-[#0a0e14] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-1">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <motion.div
          ref={scrollRef}
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex gap-3 overflow-x-auto scrollbar-hide py-10 scroll-smooth"
          style={{scrollbarWidth:'none', msOverflowStyle:'none'}}
        >
          {items.map(i => (
            <motion.div key={`${i.mediaType}-${i.id}`} variants={child}>
              <PosterCard item={i} onClick={onPosterClick} />
            </motion.div>
          ))}
        </motion.div>
        <button onClick={()=>scroll('right')} className="absolute right-0 top-0 bottom-0 z-10 w-10 md:w-12 bg-gradient-to-l from-[#0a0e14] to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-1">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </section>
  )
}
