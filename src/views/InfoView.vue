<script setup lang="ts">
import PageCard from '@/components/PageCard.vue'
import { usePwaInstall } from '@/composables/usePwaInstall'

const { isInstalled } = usePwaInstall()
const mode = import.meta.env.MODE
</script>

<template>
  <PageCard eyebrow="About" title="Info">
    <p>Sample info page. Describe your app, link to support, or show version details here.</p>
    <dl class="facts">
      <div>
        <dt>Build mode</dt>
        <dd>{{ mode }}</dd>
      </div>
      <div>
        <dt>Running as installed app</dt>
        <dd>{{ isInstalled ? 'Yes' : 'No' }}</dd>
      </div>
    </dl>
  </PageCard>
</template>

<style scoped>
.facts {
  display: grid;
  gap: 0.5rem;
  width: 100%;
  max-width: 24rem;
  margin: 0;
  font-size: 0.9375rem;
}

.facts div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.625rem 1rem;
  border-radius: 0.875rem;
  background: var(--glass-bg-raised);
}

.facts dd {
  margin: 0;
  color: var(--color-text);
  font-weight: 600;
}
</style>
