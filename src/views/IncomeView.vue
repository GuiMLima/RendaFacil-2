<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageCard from '@/components/PageCard.vue'
import { useIncomeStore } from '@/stores/income'

type IncomeCategory = 'clt' | 'proLabore' | 'autonomo' | 'aposentadoria' | 'aluguéis'
type DependentIncome = 'none' | 'estagio' | 'pensao' | 'outros'

interface IncomeEntry {
    id: number
    category: IncomeCategory
    amount: string
}

interface Dependent {
    id: number
    incomeType: DependentIncome
    amount: string
}

const incomeCategories: { value: IncomeCategory; label: string }[] = [
    { value: 'clt', label: 'Salário / CLT' },
    { value: 'proLabore', label: 'Pró-labore' },
    { value: 'autonomo', label: 'Autônomo / Freelance' },
    { value: 'aposentadoria', label: 'Aposentadoria / Pensão' },
    { value: 'aluguéis', label: 'Aluguéis' },
]

const dependentIncomeTypes: { value: DependentIncome; label: string }[] = [
    { value: 'none', label: 'Sem renda própria' },
    { value: 'estagio', label: 'Bolsa de Estágio' },
    { value: 'pensao', label: 'Pensão Alimentícia (Isento)' },
    { value: 'outros', label: 'Outros Rendimentos Tributáveis' },
]

let nextId = 1
const incomes = ref<IncomeEntry[]>([{ id: nextId++, category: 'clt', amount: '' }])
const hasDependents = ref(false)
const dependentCount = ref(0)
const dependents = ref<Dependent[]>([])
const router = useRouter()
const incomeStore = useIncomeStore()

const formatCurrency = (digits: string) => {
    const value = Number(digits || 0) / 100
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const readDigits = (value: string) => value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 12)

const updateAmount = (entry: { amount: string }, value: string) => {
    entry.amount = readDigits(value)
}

const displayAmount = (amount: string) => formatCurrency(amount)

const amountValue = (amount: string) => Number(amount || 0) / 100

const addIncome = () => {
    incomes.value.push({ id: nextId++, category: 'clt', amount: '' })
}

const removeIncome = (id: number) => {
    if (incomes.value.length > 1) {
        incomes.value = incomes.value.filter((income) => income.id !== id)
    }
}

watch(hasDependents, (enabled) => {
    if (!enabled) dependentCount.value = 0
})

watch(dependentCount, (count) => {
    const safeCount = Math.max(0, Math.min(20, Math.floor(Number(count) || 0)))
    if (safeCount !== count) dependentCount.value = safeCount

    while (dependents.value.length < safeCount) {
        dependents.value.push({ id: nextId++, incomeType: 'none', amount: '' })
    }
    if (dependents.value.length > safeCount) dependents.value.splice(safeCount)
})

const taxableTotal = computed(() => {
    const holderTotal = incomes.value.reduce((total, income) => total + amountValue(income.amount), 0)
    const dependentTotal = dependents.value.reduce((total, dependent) => {
        if (dependent.incomeType === 'estagio' || dependent.incomeType === 'outros') {
            return total + amountValue(dependent.amount)
        }
        return total
    }, 0)
    return holderTotal + dependentTotal
})

const exemptTotal = computed(() =>
    dependents.value.reduce(
        (total, dependent) =>
            dependent.incomeType === 'pensao' ? total + amountValue(dependent.amount) : total,
        0,
    ),
)

const saveIncomeAndReturn = () => {
    incomeStore.addRegistration({
        id: Date.now(),
        incomes: incomes.value.map((income) => ({ ...income })),
        dependents: hasDependents.value ? dependents.value : [],
    })
    router.push({ name: 'home' })
}
</script>

<template>
    <div class="income-page">
        <PageCard eyebrow="Declaração anual" title="Cadastro de rendimentos">
            <p class="intro">Informe os valores recebidos no ano para preparar sua declaração de IRPF.</p>

            <section class="form-section glass" aria-labelledby="income-title">
            <div class="section-heading">
                <div>
                    <p class="section-kicker">01</p>
                    <h2 id="income-title">Rendimentos do titular</h2>
                </div>
                <span class="section-status">Obrigatório</span>
            </div>

            <div class="entry-list">
                <article v-for="(income, index) in incomes" :key="income.id" class="entry-card">
                    <div class="entry-topline">
                        <span>Fonte de renda {{ index + 1 }}</span>
                        <button
                            v-if="incomes.length > 1"
                            class="remove-button"
                            type="button"
                            :aria-label="`Remover fonte de renda ${index + 1}`"
                            @click="removeIncome(income.id)"
                        >
                            Remover
                        </button>
                    </div>
                    <label class="field-label" :for="`income-type-${income.id}`">Categoria</label>
                    <select :id="`income-type-${income.id}`" v-model="income.category" class="field-control">
                        <option v-for="category in incomeCategories" :key="category.value" :value="category.value">
                            {{ category.label }}
                        </option>
                    </select>
                    <label class="field-label" :for="`income-amount-${income.id}`">Valor anual</label>
                    <input
                        :id="`income-amount-${income.id}`"
                        class="field-control currency-input"
                        type="text"
                        inputmode="numeric"
                        autocomplete="off"
                        :value="displayAmount(income.amount)"
                        aria-label="Valor anual em reais"
                        @input="updateAmount(income, ($event.target as HTMLInputElement).value)"
                    />
                </article>
            </div>

            <button class="add-button" type="button" @click="addIncome">
                <span aria-hidden="true">+</span>
                Adicionar outro rendimento
            </button>
            </section>

            <section class="form-section glass" aria-labelledby="dependents-title">
            <div class="section-heading">
                <div>
                    <p class="section-kicker">02</p>
                    <h2 id="dependents-title">Dependentes</h2>
                </div>
                <span class="section-status optional">Opcional</span>
            </div>

            <div class="toggle-row">
                <div>
                    <strong>Possui dependentes?</strong>
                    <p>Adicione as informações de renda de cada dependente.</p>
                </div>
                <label class="switch">
                    <input v-model="hasDependents" type="checkbox" />
                    <span aria-hidden="true" />
                    <span class="sr-only">Possui dependentes?</span>
                </label>
            </div>

            <div v-if="hasDependents" class="dependents-content">
                <label class="field-label" for="dependent-count">Quantos dependentes?</label>
                <input
                    id="dependent-count"
                    v-model.number="dependentCount"
                    class="field-control count-control"
                    type="number"
                    min="0"
                    max="20"
                    inputmode="numeric"
                />

                <div v-if="dependents.length" class="dependent-list">
                    <article v-for="(dependent, index) in dependents" :key="dependent.id" class="dependent-card">
                        <div class="dependent-number">{{ String(index + 1).padStart(2, '0') }}</div>
                        <div class="dependent-fields">
                            <label class="field-label" :for="`dependent-type-${dependent.id}`">
                                Dependente {{ index + 1 }} · Tipo de renda
                            </label>
                            <select
                                :id="`dependent-type-${dependent.id}`"
                                v-model="dependent.incomeType"
                                class="field-control"
                            >
                                <option
                                    v-for="incomeType in dependentIncomeTypes"
                                    :key="incomeType.value"
                                    :value="incomeType.value"
                                >
                                    {{ incomeType.label }}
                                </option>
                            </select>
                            <template v-if="dependent.incomeType !== 'none'">
                                <label class="field-label" :for="`dependent-amount-${dependent.id}`">Valor anual</label>
                                <input
                                    :id="`dependent-amount-${dependent.id}`"
                                    class="field-control currency-input"
                                    type="text"
                                    inputmode="numeric"
                                    autocomplete="off"
                                    :value="displayAmount(dependent.amount)"
                                    aria-label="Valor anual do dependente em reais"
                                    @input="updateAmount(dependent, ($event.target as HTMLInputElement).value)"
                                />
                                <p v-if="dependent.incomeType === 'pensao'" class="exempt-note">Este rendimento é isento.</p>
                            </template>
                        </div>
                    </article>
                </div>
                <p v-else class="empty-state">Informe a quantidade para adicionar os dependentes.</p>
            </div>
            </section>

            <footer class="summary-card" aria-labelledby="summary-title">
            <div class="summary-heading">
                <div>
                    <p class="section-kicker">Resumo</p>
                    <h2 id="summary-title">Visão geral</h2>
                </div>
                <span class="summary-badge">IRPF</span>
            </div>
            <dl class="summary-list">
                <div>
                    <dt>Total de Rendimentos Tributáveis</dt>
                    <dd>{{ formatCurrency(String(Math.round(taxableTotal * 100))) }}</dd>
                    <small>Titular + rendas tributáveis dos dependentes</small>
                </div>
                <div>
                    <dt>Rendimentos Isentos</dt>
                    <dd>{{ formatCurrency(String(Math.round(exemptTotal * 100))) }}</dd>
                    <small>Pensão alimentícia</small>
                </div>
                <div>
                    <dt>Dependentes para dedução</dt>
                    <dd>{{ hasDependents ? dependentCount : 0 }}</dd>
                    <small>Quantidade informada</small>
                </div>
            </dl>
            </footer>
            <button class="button add-registration-button" type="button" @click="saveIncomeAndReturn">
                Adicionar
            </button>
        </PageCard>
    </div>
</template>

<style scoped>
.income-page {
    display: grid;
    width: 100%;
}

.income-page :deep(.page-card) {
    max-width: 52rem;
    padding: 1.25rem;
    text-align: left;
}

.income-page :deep(.body) {
    justify-items: stretch;
}

.section-kicker {
    color: var(--color-accent);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.intro {
    max-width: 36rem;
    margin-top: 0.75rem;
    color: var(--color-text-muted);
}

.form-section,
.summary-card {
    padding: 1.25rem;
    border-radius: 1.25rem;
}

.section-heading,
.summary-heading,
.entry-topline,
.toggle-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}

h2 {
    margin-top: 0.15rem;
    font-size: 1.2rem;
    line-height: 1.2;
}

.section-status,
.summary-badge {
    flex-shrink: 0;
    padding: 0.3rem 0.6rem;
    border: 1px solid color-mix(in srgb, var(--color-accent), transparent 65%);
    border-radius: 999px;
    color: var(--color-accent);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
}

.section-status.optional {
    color: var(--color-text-muted);
    border-color: var(--glass-border);
}

.entry-list,
.dependent-list {
    display: grid;
    gap: 0.75rem;
    margin-top: 1.25rem;
}

.entry-card,
.dependent-card {
    padding: 1rem;
    border: 1px solid var(--glass-border);
    border-radius: 0.9rem;
    background: var(--glass-bg-raised-solid);
}

.entry-topline {
    align-items: center;
    margin-bottom: 1rem;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
}

.remove-button {
    padding: 0;
    border: 0;
    background: none;
    color: var(--color-accent);
    font: inherit;
    font-size: 0.75rem;
    cursor: pointer;
}

.field-label {
    display: block;
    margin: 0.85rem 0 0.35rem;
    color: var(--color-text-muted);
    font-size: 0.78rem;
    font-weight: 700;
}

.field-control {
    width: 100%;
    min-height: 2.9rem;
    padding: 0.65rem 0.8rem;
    border: 1px solid var(--glass-border);
    border-radius: 0.65rem;
    background: var(--glass-bg-raised);
    color: var(--color-text);
    font: inherit;
}

select.field-control,
select.field-control option {
    background-color: var(--glass-bg-raised-solid);
    color: var(--color-text);
}

.currency-input {
    color: var(--color-accent);
    font-size: 1.15rem;
    font-weight: 750;
    text-align: right;
}

.add-button {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 1rem;
    padding: 0.5rem 0;
    border: 0;
    background: none;
    color: var(--color-accent);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
}

.add-button span {
    font-size: 1.35rem;
    line-height: 1;
}

.toggle-row {
    align-items: center;
    margin-top: 1.25rem;
}

.toggle-row strong {
    font-size: 0.95rem;
}

.toggle-row p,
.empty-state,
.exempt-note,
.summary-list small {
    margin-top: 0.2rem;
    color: var(--color-text-muted);
    font-size: 0.8rem;
}

.switch {
    position: relative;
    display: block;
    width: 3.2rem;
    height: 1.8rem;
    flex-shrink: 0;
}

.switch input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
}

.switch span:not(.sr-only) {
    position: absolute;
    inset: 0;
    border-radius: 999px;
    background: var(--color-text-muted);
    cursor: pointer;
    transition: background 180ms ease;
}

.switch span:not(.sr-only)::after {
    position: absolute;
    top: 0.2rem;
    left: 0.2rem;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 50%;
    background: var(--color-on-accent);
    content: '';
    transition: transform 180ms ease;
}

.switch input:checked + span {
    background: var(--color-accent);
}

.switch input:checked + span::after {
    transform: translateX(1.4rem);
}

.dependents-content {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--glass-border);
}

.count-control {
    max-width: 8rem;
}

.dependent-card {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.9rem;
}

.dependent-number {
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.65rem;
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-size: 0.8rem;
    font-weight: 800;
}

.dependent-fields {
    min-width: 0;
}

.exempt-note {
    color: var(--color-accent);
    font-weight: 700;
}

.empty-state {
    padding: 1rem 0 0;
}

.summary-card {
    background: var(--color-accent);
    color: var(--color-on-accent);
}

.summary-card .section-kicker,
.summary-card small {
    color: color-mix(in srgb, var(--color-on-accent), transparent 22%);
}

.summary-badge {
    border-color: color-mix(in srgb, var(--color-on-accent), transparent 60%);
    color: inherit;
}

.summary-list {
    display: grid;
    gap: 1rem;
    margin: 1.25rem 0 0;
}

.summary-list div {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.1rem 1rem;
    padding-top: 0.9rem;
    border-top: 1px solid color-mix(in srgb, var(--color-on-accent), transparent 70%);
}

.summary-list dt {
    font-size: 0.84rem;
    font-weight: 700;
}

.summary-list dd {
    grid-row: span 2;
    margin: 0;
    font-size: 1.15rem;
    font-weight: 800;
    text-align: right;
}

.summary-list small {
    display: block;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

@media (min-width: 48rem) {
    .income-page :deep(.page-card) {
        padding: 1.5rem;
    }

    .form-section,
    .summary-card {
        padding: 1.5rem;
    }
}

.add-registration-button {
    width: 100%;
}
</style>