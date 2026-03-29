'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { ThemeItem } from '@/components/ThemeChooserBar'

interface BackgroundAnimationProps {
  theme: ThemeItem
}

export default function BackgroundAnimation({ theme }: BackgroundAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    // Particles colored by theme accent
    const particlesGeometry = new THREE.BufferGeometry()
    const count = 2000
    const positions = new Float32Array(count * 3)
    const colorsArr = new Float32Array(count * 3)
    const accentColor = new THREE.Color(theme.accent)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      const t = Math.random() * 0.8 + 0.2
      colorsArr[i * 3] = accentColor.r * t
      colorsArr[i * 3 + 1] = accentColor.g * t
      colorsArr[i * 3 + 2] = accentColor.b * t
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    })

    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // Wireframe floating objects
    const objects: THREE.Mesh[] = []
    const wireColor = new THREE.Color(theme.accent)

    const geos = [
      new THREE.IcosahedronGeometry(0.8, 1),
      new THREE.OctahedronGeometry(0.6),
      new THREE.TetrahedronGeometry(0.5),
      new THREE.IcosahedronGeometry(0.4, 0),
    ]

    const objPos: [number, number, number][] = [
      [-4, 2, -2], [4, -1, -3], [-3, -2, -1], [5, 3, -4],
    ]

    geos.forEach((geo, i) => {
      const mat = new THREE.MeshBasicMaterial({
        color: wireColor,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(...objPos[i])
      scene.add(mesh)
      objects.push(mesh)
    })

    // Mouse parallax
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // Animation
    let animId: number
    const clock = new THREE.Timer()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsed()

      targetX += (mouseX - targetX) * 0.05
      targetY += (mouseY - targetY) * 0.05

      particles.rotation.y = elapsed * 0.04
      particles.rotation.x = elapsed * 0.02

      camera.position.x = targetX * 0.4
      camera.position.y = targetY * 0.3

      objects.forEach((obj, i) => {
        obj.rotation.x = elapsed * (0.2 + i * 0.1)
        obj.rotation.y = elapsed * (0.3 + i * 0.1)
        obj.position.y = objPos[i][1] + Math.sin(elapsed + i) * 0.3
      })

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      renderer.dispose()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
    }
  }, [theme])

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${theme.accent}08 1px, transparent 1px), linear-gradient(90deg, ${theme.accent}08 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
      {/* Glow orb */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] blur-[130px] rounded-full"
        style={{ background: `${theme.accent}18` }}
      />
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}