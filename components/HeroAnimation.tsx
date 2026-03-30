'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

export default function HeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const layer1Ref = useRef<HTMLDivElement>(null)
  const layer2Ref = useRef<HTMLDivElement>(null)
  const layer3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // ============ THREE.JS SETUP ============
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    // Create particle system
    const particlesGeometry = new THREE.BufferGeometry()
    const count = 3000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20
      colors[i] = Math.random()
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    })

    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // Create floating wireframe objects
    const objects: THREE.Mesh[] = []

    const geometries = [
      new THREE.IcosahedronGeometry(0.8, 1),
      new THREE.OctahedronGeometry(0.6),
      new THREE.TetrahedronGeometry(0.5),
      new THREE.IcosahedronGeometry(0.4, 0),
    ]

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff46,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    })

    const positions3D = [
      [-4, 2, -2],
      [4, -1, -3],
      [-3, -2, -1],
      [5, 3, -4],
    ]

    geometries.forEach((geo, i) => {
      const mesh = new THREE.Mesh(geo, wireMaterial.clone())
      mesh.position.set(...positions3D[i] as [number, number, number])
      scene.add(mesh)
      objects.push(mesh)
    })

    // Mouse parallax
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // Scroll parallax for Three.js
    let scrollY = 0
    const onScroll = () => { scrollY = window.scrollY }
    window.addEventListener('scroll', onScroll)

    // Animation loop
    let animId: number
    const clock = new THREE.Timer()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsed()

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.05
      targetY += (mouseY - targetY) * 0.05

      // Rotate particles
      particles.rotation.y = elapsed * 0.05
      particles.rotation.x = elapsed * 0.03

      // Camera mouse parallax
      camera.position.x = targetX * 0.5
      camera.position.y = targetY * 0.3
      camera.position.z = 5 - scrollY * 0.003

      // Rotate objects
      objects.forEach((obj, i) => {
        obj.rotation.x = elapsed * (0.2 + i * 0.1)
        obj.rotation.y = elapsed * (0.3 + i * 0.1)
        obj.position.y = positions3D[i][1] + Math.sin(elapsed + i) * 0.3
      })

      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // ============ GSAP ANIMATIONS ============
    const ctx = gsap.context(() => {

      // Initial states
      gsap.set([badgeRef.current, titleRef.current, subtitleRef.current, buttonsRef.current], {
        opacity: 0, y: 60,
      })
      gsap.set(terminalRef.current, {
        opacity: 0, y: 80, scale: 0.9, rotateX: 15,
      })

      // Hero entrance
      const tl = gsap.timeline({ delay: 0.3 })
      tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power4.out' })
        .to(titleRef.current, { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }, '-=0.4')
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power4.out' }, '-=0.5')
        .to(buttonsRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power4.out' }, '-=0.4')
        .to(terminalRef.current, { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1, ease: 'power4.out' }, '-=0.4')

      // Terminal lines stagger
      const lines = document.querySelectorAll('.terminal-line')
      gsap.set(lines, { opacity: 0, x: -20 })
      lines.forEach((line, i) => {
        gsap.to(line, {
          opacity: 1, x: 0, duration: 0.4,
          delay: 1.5 + i * 0.15,
          ease: 'power2.out',
        })
      })

      // EXTREME parallax layers on scroll
      gsap.to(layer1Ref.current, {
        yPercent: -150,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      gsap.to(layer2Ref.current, {
        yPercent: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })

      gsap.to(layer3Ref.current, {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 2,
        },
      })

      // Title extreme parallax
      gsap.to(titleRef.current, {
        yPercent: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'center top',
          scrub: true,
        },
      })

      // Terminal parallax
      gsap.to(terminalRef.current, {
        yPercent: -20,
        rotateX: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      // Feature cards
      const featureCards = document.querySelectorAll('.feature-card')
      featureCards.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 100, rotateY: 20 },
          {
            opacity: 1, y: 0, rotateY: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 85%' },
            delay: i * 0.15,
          }
        )
      })

    }, containerRef)

    return () => {
      ctx.revert()
      cancelAnimationFrame(animId)
      renderer.dispose()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden" style={{ perspective: '1000px' }}>

      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Parallax Layer 1 — deepest */}
      <div ref={layer1Ref} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full border border-green-500/10"
            style={{
              width: `${150 + i * 80}px`,
              height: `${150 + i * 80}px`,
              top: `${10 + i * 12}%`,
              left: `${5 + i * 15}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Parallax Layer 2 — mid */}
      <div ref={layer2Ref} className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full opacity-40"
            style={{
              top: `${20 + i * 20}%`,
              right: `${10 + i * 10}%`,
              boxShadow: '0 0 10px rgba(0,255,70,0.8)',
            }}
          />
        ))}
      </div>

      {/* Parallax Layer 3 — closest */}
      <div ref={layer3Ref} className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        <div className="absolute top-20 right-20 w-32 h-32 border border-green-500/20 rounded-xl rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-40 left-10 w-20 h-20 border border-green-500/10 rounded-xl rotate-12 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
      </div>

      {/* Main content */}
      <div className="relative text-center py-32 px-8 max-w-5xl mx-auto" style={{ zIndex: 10 }}>

        {/* Badge */}
        <div ref={badgeRef} className="inline-flex items-center gap-2 border border-green-500/30 rounded-full px-4 py-1.5 mb-8 bg-green-500/5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-xs text-green-400">system monitoring active</span>
        </div>

        {/* Title */}
        <h1 ref={titleRef} className="text-7xl font-bold leading-tight mb-6">
          <span className="text-white">Know instantly when</span>
          <br />
          <span className="text-green-400 font-mono" style={{
            textShadow: '0 0 40px rgba(0,255,70,0.4), 0 0 80px rgba(0,255,70,0.2)'
          }}>
            your cron job fails
          </span>
        </h1>

        {/* Subtitle */}
        <p ref={subtitleRef} className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 font-mono">
          {'>'} CronWatch monitors your scheduled tasks 24/7.
          <br />
          {'>'} Get alerted before your users notice anything.
        </p>

        {/* Buttons */}
        <div ref={buttonsRef} className="flex gap-4 justify-center mb-6">
          <a href="/signup">
            <button className="font-mono bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-3 rounded-lg text-base transition-all hover:scale-110 active:scale-95 hover:shadow-[0_0_30px_rgba(0,255,70,0.5)]">
              Start Free
            </button>
          </a>
          <a href="/login">
            <button className="font-mono border border-green-500/30 text-green-400 hover:bg-green-500/10 px-8 py-3 rounded-lg text-base transition-all hover:scale-110 active:scale-95 hover:border-green-400">
              $ sign_in
            </button>
          </a>
        </div>

        <p className="font-mono text-xs text-gray-600 mb-16">
          // free for up to 3 monitors. no credit card required.
        </p>

        {/* Terminal */}
        <div ref={terminalRef} className="border border-green-500/20 rounded-xl bg-black/80 backdrop-blur text-left overflow-hidden"
          style={{ boxShadow: '0 0 80px rgba(0,255,70,0.07), 0 40px 80px rgba(0,0,0,0.5)', transformStyle: 'preserve-3d' }}>
          <div className="border-b border-green-500/20 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-3 font-mono text-xs text-gray-500">cronwatch ~ monitor</span>
          </div>
          <div className="p-6 font-mono text-sm space-y-2">
            <p className="terminal-line"><span className="text-green-400">$</span> <span className="text-gray-300">curl https://cronwatch.app/api/ping/your-id</span></p>
            <p className="terminal-line text-gray-500">{'# Add this to the end of your cron job'}</p>
            <p className="terminal-line mt-4"><span className="text-green-400">✓</span> <span className="text-gray-300">Monitor <span className="text-green-400">daily-backup</span> pinged successfully</span></p>
            <p className="terminal-line"><span className="text-green-400">✓</span> <span className="text-gray-300">Status: <span className="text-green-400">healthy</span> — last seen 2 minutes ago</span></p>
            <p className="terminal-line text-red-400">✗ Alert sent: <span className="text-gray-300">invoice-generator missed its ping</span></p>
            <p className="terminal-line text-gray-500">{'# Email sent to admin@yourcompany.com'}</p>
            <div className="terminal-line flex items-center gap-1 mt-2">
              <span className="text-green-400">$</span>
              <span className="w-2 h-4 bg-green-400 animate-pulse inline-block ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}