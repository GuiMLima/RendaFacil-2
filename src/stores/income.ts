import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type IncomeCategory = 'clt' | 'proLabore' | 'autonomo' | 'aposentadoria' | 'aluguéis'
export type DependentIncome = 'none' | 'estagio' | 'pensao' | 'outros'

export interface RegisteredDependent {
  id: number
  incomeType: DependentIncome
  amount: string
}

export interface RegisteredIncomeEntry {
  id: number
  category: IncomeCategory
  amount: string
}

export interface IncomeRegistration {
  id: number
  incomes: RegisteredIncomeEntry[]
  dependents: RegisteredDependent[]
}

export const incomeCategoryLabels: Record<IncomeCategory, string> = {
  clt: 'Salário / CLT',
  proLabore: 'Pró-labore',
  autonomo: 'Autônomo / Freelance',
  aposentadoria: 'Aposentadoria / Pensão',
  aluguéis: 'Aluguéis',
}

export const dependentIncomeLabels: Record<DependentIncome, string> = {
  none: 'Sem renda própria',
  estagio: 'Bolsa de Estágio',
  pensao: 'Pensão Alimentícia (Isento)',
  outros: 'Outros Rendimentos Tributáveis',
}

export const useIncomeStore = defineStore('income', () => {
  const registrations = ref<IncomeRegistration[]>([])
  const amountValue = (amount: string) => Number(amount || 0) / 100

  const addRegistration = (registration: IncomeRegistration) => {
    registrations.value.push({
      ...registration,
      incomes: registration.incomes.map((income) => ({ ...income })),
      dependents: registration.dependents.map((dependent) => ({ ...dependent })),
    })
  }

  const items = computed(() =>
    registrations.value.flatMap((registration) => [
      ...registration.incomes.map((income) => ({
        id: `income-${registration.id}-${income.id}`,
        label: incomeCategoryLabels[income.category],
        amount: income.amount,
        icon: 'user' as const,
      })),
      ...registration.dependents
        .filter((dependent) => dependent.incomeType !== 'none')
        .map((dependent) => ({
          id: `dependent-${registration.id}-${dependent.id}`,
          label: dependentIncomeLabels[dependent.incomeType],
          amount: dependent.amount,
          icon: 'user' as const,
        })),
    ]),
  )

  const taxableTotal = computed(() =>
    registrations.value.reduce((total, registration) => {
      const incomeTotal = registration.incomes.reduce(
        (subtotal, income) => subtotal + amountValue(income.amount),
        0,
      )
      const dependentTotal = registration.dependents.reduce((subtotal, dependent) => {
        if (dependent.incomeType === 'estagio' || dependent.incomeType === 'outros') {
          return subtotal + amountValue(dependent.amount)
        }
        return subtotal
      }, 0)
      return total + incomeTotal + dependentTotal
    }, 0),
  )

  const exemptTotal = computed(() =>
    registrations.value.reduce(
      (total, registration) =>
        total +
        registration.dependents.reduce(
          (subtotal, dependent) =>
            dependent.incomeType === 'pensao' ? subtotal + amountValue(dependent.amount) : subtotal,
          0,
        ),
      0,
    ),
  )

  const dependentCount = computed(() =>
    registrations.value.reduce((total, registration) => total + registration.dependents.length, 0),
  )

  return { registrations, items, taxableTotal, exemptTotal, dependentCount, addRegistration }
})