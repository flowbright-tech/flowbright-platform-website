import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '#imports'

export interface NavItem {
  key: string
  labelKey: string
  icon: string
  to: string
}

export const useNavigation = () => {
  const { t } = useI18n()
  const localePath = useLocalePath()

  const navItems = computed<NavItem[]>(() => [
    {
      key: 'dashboard',
      labelKey: 'nav.dashboard',
      icon: 'i-heroicons-squares-2x2',
      to: localePath('/dashboard')
    },
    {
      key: 'customers',
      labelKey: 'nav.customers',
      icon: 'i-heroicons-user-group',
      to: localePath('/customers')
    },
    {
      key: 'vendors',
      labelKey: 'nav.vendors',
      icon: 'i-heroicons-building-storefront',
      to: localePath('/vendors')
    }
  ])

  return {
    navItems
  }
}
