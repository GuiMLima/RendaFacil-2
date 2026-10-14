<script setup lang="ts">
import { storeToRefs } from 'pinia'
import PageCard from '@/components/PageCard.vue'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const { user } = storeToRefs(useAuthStore())
</script>

<template>
  <PageCard eyebrow="Account" title="User">
    <p>Sample user page. Profile details and sign-in will live here.</p>
    <p v-if="!isSupabaseConfigured">
      Supabase isn't configured yet. Add your project URL and publishable key to
      <code>.env</code> to enable authentication.
    </p>
    <p v-else-if="user">Signed in as {{ user.email }}.</p>
    <p v-else>Supabase is configured. You're not signed in.</p>
  </PageCard>
</template>
