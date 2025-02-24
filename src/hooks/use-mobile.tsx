import * as React from "react"
import { BREAKPOINTS, DELAYS } from "@/lib/constants"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  const handleResize = React.useCallback(() => {
    setIsMobile(window.innerWidth < BREAKPOINTS.MOBILE)
  }, [])

  const debouncedHandleResize = React.useCallback(() => {
    let timeoutId: NodeJS.Timeout
    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, DELAYS.DEBOUNCE)
    }
  }, [handleResize])

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.MOBILE - 1}px)`)
    const resizeHandler = debouncedHandleResize()

    mql.addEventListener("change", resizeHandler)
    handleResize() // Initial check

    return () => {
      mql.removeEventListener("change", resizeHandler)
    }
  }, [debouncedHandleResize, handleResize])

  return !!isMobile
}
