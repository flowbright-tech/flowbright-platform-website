import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '#imports'
import { useAuthEngine } from '../features/auth/composables/useAuthEngine'

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
  const { isLab, isAdmin } = useAuthEngine()

  const navItems = computed<NavItem[]>(() => {
    const items: NavItem[] = [
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
      }
    ]

    // Requirement 3: Vendor management is not required for lab company type, required for other types
    if (!isLab.value) {
      items.push({
        key: 'vendors',
        labelKey: 'nav.vendors',
        icon: 'i-heroicons-building-storefront',
        to: localePath('/vendors')
      })
    }

    // Requirement 4: Only admin can view/manage products/tests master
    if (isAdmin.value) {
      items.push({
        key: 'product_master',
        labelKey: isLab.value ? 'nav.test_master' : 'nav.product_master',
        icon: isLab.value ? 'i-heroicons-beaker' : 'i-heroicons-shopping-bag',
        children: [
          {
            key: 'categories',
            labelKey: isLab.value ? 'nav.test_categories' : 'nav.categories',
            icon: 'i-heroicons-tag',
            to: localePath('/categories')
          },
          {
            key: 'products',
            labelKey: isLab.value ? 'nav.tests' : 'nav.products',
            icon: isLab.value ? 'i-heroicons-beaker' : 'i-heroicons-shopping-bag',
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
      })
    }

    items.push({
      key: 'orders',
      labelKey: 'nav.orders',
      icon: 'i-heroicons-clipboard-document-check',
      to: localePath('/orders')
    })

    return items
  })

  return {
    navItems,
    isLab,
    isAdmin
  }
}
