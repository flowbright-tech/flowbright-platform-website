import { ref, computed } from 'vue'
import { useState } from '#imports'
import type { Customer, CustomerFormData, CustomerSegment, CustomerStatus } from '../types'
import { useAuthEngine } from '../../auth/composables/useAuthEngine'

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-01',
    code: 'CUST-TH-001',
    name: 'Siam Retail Corporation Co., Ltd.',
    email: 'contact@siamretail.co.th',
    phone: '+66 2 718 9000',
    segment: 'enterprise',
    status: 'active',
    tenantId: 'tenant-bkk-01',
    createdAt: '2026-01-15'
  },
  {
    id: 'cust-02',
    code: 'CUST-TH-002',
    name: 'Bangkok Innovative Tech Solutions',
    email: 'billing@bkktech.com',
    phone: '+66 2 345 6789',
    segment: 'sme',
    status: 'active',
    tenantId: 'tenant-bkk-01',
    createdAt: '2026-02-01'
  },
  {
    id: 'cust-03',
    code: 'CUST-TH-003',
    name: 'Northern Supply Chain Ventures',
    email: 'info@nscventures.com',
    phone: '+66 53 112 445',
    segment: 'sme',
    status: 'lead',
    tenantId: 'tenant-bkk-01',
    createdAt: '2026-03-10'
  },
  {
    id: 'cust-04',
    code: 'CUST-SG-001',
    name: 'Merlion Global Logistics Pte Ltd',
    email: 'ops@merlionlogistics.sg',
    phone: '+65 6789 0123',
    segment: 'enterprise',
    status: 'active',
    tenantId: 'tenant-sg-02',
    createdAt: '2026-02-18'
  },
  {
    id: 'cust-05',
    code: 'CUST-TH-004',
    name: 'Chiang Mai Artisan Coffee Exporters',
    email: 'admin@cmcoffee.or.th',
    phone: '+66 53 998 776',
    segment: 'retail',
    status: 'suspended',
    tenantId: 'tenant-cnx-03',
    createdAt: '2026-04-05'
  }
]

export const useCustomerEngine = () => {
  const { activeTenant } = useAuthEngine()
  
  const customers = useState<Customer[]>('srp_customers_master', () => INITIAL_CUSTOMERS)

  const searchQuery = ref('')
  const selectedSegment = ref<string>('all')
  const selectedStatus = ref<string>('all')
  const currentPage = ref(1)
  const pageSize = ref(5)

  // Tenant-isolated dataset filter
  const tenantCustomers = computed(() => {
    return customers.value.filter(c => c.tenantId === activeTenant.value.id)
  })

  // Search & Filters applied
  const filteredCustomers = computed(() => {
    return tenantCustomers.value.filter(customer => {
      const matchesSearch = searchQuery.value === '' ||
        customer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        customer.code.toLowerCase().includes(searchQuery.value.toLowerCase())

      const matchesSegment = selectedSegment.value === 'all' || customer.segment === selectedSegment.value
      const matchesStatus = selectedStatus.value === 'all' || customer.status === selectedStatus.value

      return matchesSearch && matchesSegment && matchesStatus
    })
  })

  const paginatedCustomers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredCustomers.value.slice(start, start + pageSize.value)
  })

  const totalFilteredCount = computed(() => filteredCustomers.value.length)

  const addCustomer = (data: CustomerFormData) => {
    const newId = `cust-${Date.now()}`
    const newCustomer: Customer = {
      id: newId,
      code: `CUST-${activeTenant.value.code.split('-')[1] || 'TH'}-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      segment: data.segment,
      status: data.status,
      tenantId: activeTenant.value.id,
      createdAt: new Date().toISOString().split('T')[0]
    }
    customers.value = [newCustomer, ...customers.value]
    return newCustomer
  }

  const updateCustomer = (id: string, data: Partial<CustomerFormData>) => {
    const idx = customers.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      customers.value[idx] = {
        ...customers.value[idx],
        ...data
      }
    }
  }

  const deleteCustomer = (id: string) => {
    customers.value = customers.value.filter(c => c.id !== id)
  }

  return {
    searchQuery,
    selectedSegment,
    selectedStatus,
    currentPage,
    pageSize,
    tenantCustomers,
    filteredCustomers,
    paginatedCustomers,
    totalFilteredCount,
    addCustomer,
    updateCustomer,
    deleteCustomer
  }
}
