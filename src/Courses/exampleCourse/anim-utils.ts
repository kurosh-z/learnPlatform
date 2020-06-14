import { easeCubicInOut } from 'd3-ease'
import { SpringConfig, config } from '@react-spring/core'

const FAST: SpringConfig = { friction: 20, mass: 2, tension: 40 }
const FASTER: SpringConfig = { friction: 14, tension: 75 }
const SLOW: SpringConfig = { friction: 30, mass: 2, tension: 40 }
const VSLOW: SpringConfig = { friction: 100, mass: 3, tension: 80 }

export const sConfigs = { FAST, SLOW, VSLOW, FASTER, ...config }

export function cubic_in_out(t: number): SpringConfig {
    return { easing: easeCubicInOut, duration: t * 1000 }
}
