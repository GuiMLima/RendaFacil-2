<script setup lang="ts">
import PageCard from '@/components/PageCard.vue'
import { usePwaInstall } from '@/composables/usePwaInstall'

const { canInstall, install } = usePwaInstall()

const features = [
  {
    title: 'Vue 3 + Vite',
    text: 'TypeScript, Vue Router and Pinia are wired up and ready to build on.',
  },
  {
    title: 'Installable',
    text: 'A web app manifest and service worker let it install like a native app.',
  },
  {
    title: 'Supabase-ready',
    text: 'A typed client and environment variables are waiting for your project keys.',
  },
]
</script>

<template>
  <div class="home">
    <PageCard eyebrow="Welcome" title="RendaFacil">
      <p>
        This is a sample page. Replace this text with your own content — the layout, the navigation
        and the app shell are already in place.
      </p>
      <button v-if="canInstall" class="button" type="button" @click="install">Install app</button>
    </PageCard>

    <ul class="features">
      <li v-for="feature in features" :key="feature.title" class="feature glass">
        <h2>{{ feature.title }}</h2>
        <p>{{ feature.text }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.home {
  display: grid;
  justify-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 56rem;
}

/* One column on phones, three across once there is room. */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1rem;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.feature {
  padding: 1.25rem;
  border-radius: 1.25rem;
}

.feature h2 {
  font-size: 1rem;
}

.feature p {
  margin-top: 0.25rem;
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}
</style>
