import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ColorPicker } from '../components/ColorPicker'

describe('ColorPicker', () => {
  it('renders all preset colors', () => {
    const onChange = vi.fn()
    render(<ColorPicker value="" onChange={onChange} />)

    const colorPicker = screen.getByTestId('color-picker')
    const buttons = colorPicker.querySelectorAll('button')
    expect(buttons.length).toBe(16)
  })

  it('renders label when provided', () => {
    const onChange = vi.fn()
    render(<ColorPicker value="" onChange={onChange} label="Pick a color" />)

    expect(screen.getByText('Pick a color')).toBeInTheDocument()
  })

  it('calls onChange when a color is clicked', () => {
    const onChange = vi.fn()
    render(<ColorPicker value="" onChange={onChange} />)

    fireEvent.click(screen.getByTestId('color-option-#ef4444'))
    expect(onChange).toHaveBeenCalledWith('#ef4444')
  })

  it('highlights the selected color', () => {
    const onChange = vi.fn()
    render(<ColorPicker value="#3b82f6" onChange={onChange} />)

    const selectedButton = screen.getByTestId('color-option-#3b82f6')
    expect(selectedButton.className).toContain('border-gray-900')
  })

  it('does not highlight unselected colors', () => {
    const onChange = vi.fn()
    render(<ColorPicker value="#3b82f6" onChange={onChange} />)

    const unselectedButton = screen.getByTestId('color-option-#ef4444')
    expect(unselectedButton.className).toContain('border-transparent')
  })
})
