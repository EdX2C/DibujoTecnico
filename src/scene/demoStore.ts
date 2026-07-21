export type DemoMode = 'solid' | 'reveal' | 'abatir' | 'concurrente'

export interface DemoState {
  mode: DemoMode
  cutPosition: number
  revealAmount: number
  abatirAmount: number
  concurrenteAmount: number
  autoOrbit: boolean
}

export const initialDemoState: DemoState = {
  mode: 'solid',
  cutPosition: 0,
  revealAmount: 0,
  abatirAmount: 0,
  concurrenteAmount: 0,
  autoOrbit: true,
}
