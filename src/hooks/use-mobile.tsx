
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    }
    
    checkTablet()
    window.addEventListener('resize', checkTablet)
    return () => window.removeEventListener('resize', checkTablet)
  }, [])

  return !!isTablet
}

export function useIsTouch() {
  const [isTouch, setIsTouch] = React.useState<boolean>(false)
  
  React.useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])
  
  return isTouch
}

// New hook to detect Android tablet specifically
export function useIsAndroidTablet() {
  const [isAndroidTablet, setIsAndroidTablet] = React.useState<boolean>(false)
  const isTablet = useIsTablet()
  
  React.useEffect(() => {
    const checkAndroidTablet = () => {
      const isAndroid = /Android/i.test(navigator.userAgent)
      setIsAndroidTablet(isTablet && isAndroid)
    }
    
    checkAndroidTablet()
  }, [isTablet])
  
  return isAndroidTablet
}

// New hook that combines tablet detection with content display logic
export function useTabletLayout() {
  const isTablet = useIsTablet()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  
  const toggleSidebar = React.useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])
  
  return {
    isTablet,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar
  }
}
