import { ref, watch, type Ref } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay = 1000) {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout>

  watch(value, (newVal) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newVal
    }, delay)
  })

  return debouncedValue
}
