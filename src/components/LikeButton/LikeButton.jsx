import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useWorks } from '../../hooks/useWorks'
import './LikeButton.css'

function LikeButton({ workId, initialCount = 0, size = 'default' }) {
  const { user } = useAuth()
  const { toggleLike, checkLiked } = useWorks()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (user && workId) {
      checkLiked(workId).then(setLiked)
    }
  }, [user, workId, checkLiked])

  useEffect(() => {
    setCount(initialCount)
  }, [initialCount])

  async function handleLike() {
    if (!user) return

    const result = await toggleLike(workId)
    if (result.error) return

    setLiked(result.liked)
    if (result.count != null) {
      setCount(result.count)
    }

    if (result.liked) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 600)
    }
  }

  return (
    <motion.button
      className={`like-button like-button--${size} ${liked ? 'like-button--liked' : ''}`}
      onClick={handleLike}
      whileTap={{ scale: 0.9 }}
    >
      <motion.span
        className="like-button-icon"
        animate={animating ? {
          scale: [1, 1.4, 1],
          transition: { duration: 0.4 }
        } : {}}
      >
        <Heart size={size === 'large' ? 24 : 18} fill={liked ? 'currentColor' : 'none'} />
      </motion.span>

      <span className="like-button-count">{count}</span>

      <AnimatePresence>
        {animating && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="like-button-particle"
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: Math.cos(i * 60 * Math.PI / 180) * 30,
                  y: Math.sin(i * 60 * Math.PI / 180) * 30,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default LikeButton
