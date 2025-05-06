"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TextPlugin } from "gsap/TextPlugin"
import { SplitText } from "gsap/SplitText"

export function HeroAnimation() {
  const heroRef = useRef(null)
  const headingRef = useRef(null)
  const textRef = useRef(null)
  const buttonsRef = useRef(null)
  const decorationRef = useRef(null)
  const bgShapeRef = useRef(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, TextPlugin, SplitText)

    // Create a more advanced timeline
    const tl = gsap.timeline()

    // Background shape animation
    tl.from(bgShapeRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
    })

    // Decoration elements animation
    tl.from(
      decorationRef.current?.children || [],
      {
        y: 100,
        opacity: 0,
        rotation: -5,
        scale: 0.8,
        stagger: 0.1,
        duration: 0.8,
        ease: "back.out(1.7)",
      },
      "-=0.8",
    )

    // Split text animation for heading
    if (headingRef.current) {
      const splitHeading = new SplitText(headingRef.current, { type: "words,chars" })
      tl.from(
        splitHeading.chars,
        {
          opacity: 0,
          y: 20,
          rotationX: -90,
          stagger: 0.02,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=0.4",
      )
    } else {
      tl.from(
        headingRef.current,
        {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.4",
      )
    }

    // Text animation
    tl.from(
      textRef.current,
      {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      },
      "-=0.6",
    )

    // Buttons animation
    tl.from(
      buttonsRef.current?.children || [],
      {
        y: 20,
        opacity: 0,
        scale: 0.9,
        stagger: 0.2,
        duration: 0.6,
        ease: "back.out(1.7)",
      },
      "-=0.4",
    )

    // Continuous subtle animation for decoration elements
    gsap.to(decorationRef.current?.children || [], {
      y: "10",
      rotation: "3",
      duration: 3,
      ease: "sine.inOut",
      stagger: 0.2,
      repeat: -1,
      yoyo: true,
    })

    return () => {
      // Cleanup
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return { heroRef, headingRef, textRef, buttonsRef, decorationRef, bgShapeRef }
}

export function FeaturesAnimation() {
  const featuresRef = useRef(null)
  const featureItems = useRef([])
  const featureTitleRef = useRef(null)
  const featureDescRef = useRef(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Title and description animation
    gsap.from([featureTitleRef.current, featureDescRef.current], {
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top 80%",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out",
    })

    // Features cards animation
    gsap.from(featureItems.current, {
      scrollTrigger: {
        trigger: featureItems.current[0],
        start: "top 85%",
      },
      y: 80,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "back.out(1.4)",
    })

    // Hover animations for feature cards
    featureItems.current.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        gsap.to(item, {
          y: -10,
          scale: 1.03,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          duration: 0.3,
          ease: "power2.out",
        })

        // Animate the icon
        const icon = item.querySelector(".feature-icon")
        if (icon) {
          gsap.to(icon, {
            rotate: 360,
            scale: 1.2,
            duration: 0.5,
            ease: "back.out(1.7)",
          })
        }
      })

      item.addEventListener("mouseleave", () => {
        gsap.to(item, {
          y: 0,
          scale: 1,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          duration: 0.3,
          ease: "power2.out",
        })

        // Reset the icon
        const icon = item.querySelector(".feature-icon")
        if (icon) {
          gsap.to(icon, {
            rotate: 0,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
          })
        }
      })
    })

    return () => {
      // Cleanup
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())

      // Remove event listeners
      featureItems.current.forEach((item) => {
        item.removeEventListener("mouseenter", () => {})
        item.removeEventListener("mouseleave", () => {})
      })
    }
  }, [])

  const addToRefs = (el) => {
    if (el && !featureItems.current.includes(el)) {
      featureItems.current.push(el)
    }
  }

  return { featuresRef, addToRefs, featureTitleRef, featureDescRef }
}

export function TestimonialAnimation() {
  const testimonialRef = useRef(null)
  const testimonialItems = useRef([])
  const testimonialTitleRef = useRef(null)
  const testimonialDescRef = useRef(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Title and description animation
    gsap.from([testimonialTitleRef.current, testimonialDescRef.current], {
      scrollTrigger: {
        trigger: testimonialRef.current,
        start: "top 80%",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out",
    })

    // Testimonial cards animation
    gsap.from(testimonialItems.current, {
      scrollTrigger: {
        trigger: testimonialItems.current[0],
        start: "top 85%",
      },
      x: (i) => (i % 2 === 0 ? -50 : 50),
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "back.out(1.4)",
    })

    return () => {
      // Cleanup
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  const addToTestimonialRefs = (el) => {
    if (el && !testimonialItems.current.includes(el)) {
      testimonialItems.current.push(el)
    }
  }

  return { testimonialRef, addToTestimonialRefs, testimonialTitleRef, testimonialDescRef }
}
