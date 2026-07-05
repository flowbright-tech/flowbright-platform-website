import { ref } from 'vue'

const stateMap = new Map<string, any>()

export function useState<T>(key: string, init?: () => T) {
  if (!stateMap.has(key)) {
    stateMap.set(key, ref(init ? init() : null))
  }
  return stateMap.get(key)
}

export function useCookie<T>(key: string, options?: any) {
  return useState<T>(key, options?.default)
}

export function useLocalePath() {
  return (path: string) => path
}

export function useSwitchLocalePath() {
  return (locale: string) => `/${locale}`
}

export function useColorMode() {
  const mode = ref('light')
  return {
    value: mode,
    preference: mode
  }
}

export function useRuntimeConfig() {
  return {
    public: {
      apiDomain: 'https://flowbright-platform-api.onrender.com'
    }
  }
}
