import { useState } from 'react'
import { HiOutlineDownload } from 'react-icons/hi'
import { usePWAInstall } from '../hooks/usePWAInstall'

export function PWAInstallButton() {
  const { isInstallable, isIOS, install } = usePWAInstall()
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  if (!isInstallable && !isIOS) return null

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true)
    } else {
      await install()
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        aria-label="Install App"
        data-testid="pwa-install-button"
      >
        <HiOutlineDownload className="h-4 w-4" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {showIOSInstructions && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          data-testid="ios-instructions"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Install on iOS
            </h3>
            <ol className="mb-4 list-decimal space-y-2 pl-4 text-sm text-gray-600">
              <li>
                Tap the <strong>Share</strong> button in Safari (the square with an arrow)
              </li>
              <li>
                Scroll down and tap <strong>Add to Home Screen</strong>
              </li>
              <li>
                Tap <strong>Add</strong> in the top-right corner
              </li>
            </ol>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
