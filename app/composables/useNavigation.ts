import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '#imports'

export interface NavItem {
  key: string
  labelKey: string
  icon: string
  to?: string
  children?: NavItem[]
}

export const useNavigation = () => {
  const { t } = useI18n()
  const localePath = useLocalePath()

  const navItems = computed<NavItem[]>(() => [
    {
      key: 'dashboard',
      labelKey: 'nav.dashboard',
      icon: 'i-heroicons-squares-2x2',
      to: localePath('/')
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
    },
    {
      key: 'product_master',
      labelKey: 'nav.product_master',
      icon: 'i-heroicons-shopping-bag',
      children: [
        {
          key: 'categories',
          labelKey: 'nav.categories',
          icon: 'i-heroicons-tag',
          to: localePath('/categories')
        },
        {
          key: 'products',
          labelKey: 'nav.products',
          icon: 'i-heroicons-shopping-bag',
          to: localePath('/products')
        },
        {
          key: 'boms',
          labelKey: 'nav.boms',
          icon: 'i-heroicons-cog-8-tooth',
          to: localePath('/boms')
        },
        {
          key: 'packages',
          labelKey: 'nav.packages',
          icon: 'i-heroicons-gift',
          to: localePath('/packages')
        }
      ]
    },
    {
      key: 'orders',
      labelKey: 'nav.orders',
      icon: 'i-heroicons-clipboard-document-check',
      to: localePath('/orders')
    }
  ])

  return {
    navItems
  }
}
