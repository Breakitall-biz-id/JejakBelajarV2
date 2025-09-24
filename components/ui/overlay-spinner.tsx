import * as React from "react"

export function OverlaySpinner({ show = false, text }: { show?: boolean; text?: string }) {
  if (!show) return null
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(255,255,255,0.6)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column"
    }}>
      <div className="animate-spin rounded-full border-4 border-gray-300 border-t-primary h-14 w-14 mb-4" />
      {text && <div className="text-base text-muted-foreground font-medium mt-2">{text}</div>}
    </div>
  )
}
