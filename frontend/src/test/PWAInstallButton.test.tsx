import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PWAInstallButton } from '../components/PWAInstallButton'

// Mock the usePWAInstall hook
const mockInstall = vi.fn()
const mockUsePWAInstall = vi.fn()

vi.mock('../hooks/usePWAInstall', () => ({
  usePWAInstall: () => mockUsePWAInstall(),
}))

describe('PWAInstallButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when not installable and not iOS', () => {
    mockUsePWAInstall.mockReturnValue({
      isInstallable: false,
      isIOS: false,
      install: mockInstall,
    })

    const { container } = render(<PWAInstallButton />)
    expect(container.innerHTML).toBe('')
  })

  it('renders install button when installable', () => {
    mockUsePWAInstall.mockReturnValue({
      isInstallable: true,
      isIOS: false,
      install: mockInstall,
    })

    render(<PWAInstallButton />)
    expect(screen.getByTestId('pwa-install-button')).toBeInTheDocument()
    expect(screen.getByLabelText('Install App')).toBeInTheDocument()
  })

  it('calls install on click when not iOS', async () => {
    mockInstall.mockResolvedValue(true)
    mockUsePWAInstall.mockReturnValue({
      isInstallable: true,
      isIOS: false,
      install: mockInstall,
    })

    render(<PWAInstallButton />)
    fireEvent.click(screen.getByTestId('pwa-install-button'))
    expect(mockInstall).toHaveBeenCalled()
  })

  it('shows iOS instructions when on iOS', () => {
    mockUsePWAInstall.mockReturnValue({
      isInstallable: false,
      isIOS: true,
      install: mockInstall,
    })

    render(<PWAInstallButton />)
    fireEvent.click(screen.getByTestId('pwa-install-button'))
    expect(screen.getByTestId('ios-instructions')).toBeInTheDocument()
    expect(screen.getByText('Install on iOS')).toBeInTheDocument()
  })

  it('closes iOS instructions when Got it is clicked', () => {
    mockUsePWAInstall.mockReturnValue({
      isInstallable: false,
      isIOS: true,
      install: mockInstall,
    })

    render(<PWAInstallButton />)
    fireEvent.click(screen.getByTestId('pwa-install-button'))
    expect(screen.getByTestId('ios-instructions')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Got it'))
    expect(screen.queryByTestId('ios-instructions')).not.toBeInTheDocument()
  })
})
