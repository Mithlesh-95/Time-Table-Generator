"use client"

import { Box, keyframes } from "@mui/material"

// Subtle particles
const float = keyframes`
  0% { transform: translateY(0px); opacity: .5 }
  50% { transform: translateY(-6px); opacity: .9 }
  100% { transform: translateY(0px); opacity: .5 }
`

// Elegant spinner
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

export default function LoadingOverlay({ show, message = "Loading" }: { show: boolean; message?: string }) {
  if (!show) return null
  return (
    <Box
      sx={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'grid', placeItems: 'center',
        background: 'linear-gradient(180deg, rgba(10,10,15,0.55), rgba(10,10,15,0.75))',
        backdropFilter: 'blur(6px) saturate(1.1)',
      }}
    >
      {/* Glass card */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: 3,
          px: 4, py: 4,
          background: 'rgba(18,18,28,0.45)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Gradient ring */}
        <Box sx={{ position: 'relative', width: 84, height: 84, mx: 'auto' }}>
          <Box
            sx={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'conic-gradient(from 0deg, #8b5cf6, #06b6d4, #22c55e, #8b5cf6)',
              filter: 'drop-shadow(0 10px 24px rgba(139,92,246,0.25))',
              WebkitMask: 'radial-gradient(circle at center, transparent 57%, black 58%)',
              mask: 'radial-gradient(circle at center, transparent 57%, black 58%)',
            }}
          />
          {/* Rotating arc */}
          <Box
            sx={{
              position: 'absolute', inset: 6, borderRadius: '50%',
              borderTop: '3px solid rgba(139,92,246,0.95)',
              borderRight: '3px solid transparent',
              borderBottom: '3px solid transparent',
              borderLeft: '3px solid transparent',
              animation: `${rotate} 1.1s linear infinite`,
            }}
          />
        </Box>

        {/* Message */}
        <Box component="div" sx={{ textAlign: 'center', mt: 2, color: 'rgba(250,250,255,0.9)', fontWeight: 600, letterSpacing: .4 }}>
          {message}
        </Box>

        {/* Particles */}
        <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[...Array(6)].map((_, i) => (
            <Box key={i} sx={{
              position: 'absolute',
              width: 6, height: 6, borderRadius: '50%',
              background: i % 2 ? 'rgba(99,102,241,.6)' : 'rgba(6,182,212,.6)',
              left: `${20 + i*12}%`, top: `${30 + (i%3)*12}%`,
              animation: `${float} ${2 + (i%3)*.6}s ease-in-out ${i*.15}s infinite`,
              filter: 'blur(.2px)'
            }} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
