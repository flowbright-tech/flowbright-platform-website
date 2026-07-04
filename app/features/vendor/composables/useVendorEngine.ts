import { ref, computed } from 'vue'
import { useState } from '#imports'
import type { Vendor, VendorFormData, SupplyCategory } from '../types'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vnd-01',
    code: 'VND-TH-101',
    name: 'Siam Industrial Polymers PCL',
    taxId: '0107537000889',
    regId: 'REG-2024-8890',
    phone: '+66 2 987 6543',
    category: 'raw_materials',
    tenantId: 'tenant-bkk-01',
    createdAt: '2026-01-10'
  },
  {
    id: 'vnd-02',
    code: 'VND-TH-102',
    name: 'Advance Network Infrastructure Ltd.',
    taxId: '0105558012341',
    regId: 'REG-2025-1234',
    phone: '+66 2 456 7890',
    category: 'it_hardware',
    tenantId: 'tenant-bkk-01',
    createdAt: '2026-02-14'
  },
  {
    id: 'vnd-03',
    code: 'VND-TH-103',
    name: 'FastFreight Logistics (Thailand) Co.',
    taxId: '0105561099882',
    regId: 'REG-2025-9988',
    phone: '+66 2 331 9900',
    category: 'logistics',
    tenantId: 'tenant-bkk-01',
    createdAt: '2026-03-01'
  },
  {
    id: 'vnd-04',
    code: 'VND-SG-101',
    name: 'Asia Pacific Office Systems Pte Ltd',
    taxId: 'M90345678X',
    regId: '201987654E',
    phone: '+65 6543 2100',
    category: 'office_supplies',
    tenantId: 'tenant-sg-02',
    createdAt: '2026-02-20'
  }
]

export const useVendorEngine = () => {
  const { activeTenant } = useAuthEngine()

  const vendors = useState<Vendor[]>('srp_vendors_master', () => INITIAL_VENDORS)

  const searchQuery = ref('')
  const selectedCategory = ref<string>('all')
  const currentPage = ref(1)
  const pageSize = ref(5)

  const tenantVendors = computed(() => {
    const tenantId = activeTenant.value.id
    if (tenantId === '2f2b761e-4a80-449b-ae7e-e93b33313230') {
      return vendors.value.filter(v => v.tenantId === 'tenant-bkk-01' || v.tenantId === tenantId)
    }
    return vendors.value.filter(v => v.tenantId === tenantId)
  })

  const filteredVendors = computed(() => {
    return tenantVendors.value.filter(vendor => {
      const matchesSearch = searchQuery.value === '' ||
        vendor.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        vendor.taxId.includes(searchQuery.value) ||
        vendor.code.toLowerCase().includes(searchQuery.value.toLowerCase())

      const matchesCategory = selectedCategory.value === 'all' || vendor.category === selectedCategory.value

      return matchesSearch && matchesCategory
    })
  })

  const paginatedVendors = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredVendors.value.slice(start, start + pageSize.value)
  })

  const totalFilteredCount = computed(() => filteredVendors.value.length)

  const validateTaxId = (taxId: string): boolean => {
    // Basic tax ID format checker (minimum 8 chars)
    return !!taxId && taxId.length >= 8
  }

  const addVendor = (data: VendorFormData) => {
    const newId = `vnd-${Date.now()}`
    const newVendor: Vendor = {
      id: newId,
      code: `VND-${activeTenant.value.code.split('-')[1] || 'TH'}-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name,
      taxId: data.taxId,
      regId: data.regId,
      phone: data.phone,
      category: data.category,
      tenantId: activeTenant.value.id,
      createdAt: new Date().toISOString().split('T')[0]
    }
    vendors.value = [newVendor, ...vendors.value]
    return newVendor
  }

  const updateVendor = (id: string, data: Partial<VendorFormData>) => {
    const idx = vendors.value.findIndex(v => v.id === id)
    if (idx !== -1) {
      vendors.value[idx] = {
        ...vendors.value[idx],
        ...data
      }
    }
  }

  const deleteVendor = (id: string) => {
    vendors.value = vendors.value.filter(v => v.id !== id)
  }

  return {
    searchQuery,
    selectedCategory,
    currentPage,
    pageSize,
    tenantVendors,
    filteredVendors,
    paginatedVendors,
    totalFilteredCount,
    validateTaxId,
    addVendor,
    updateVendor,
    deleteVendor
  }
}
