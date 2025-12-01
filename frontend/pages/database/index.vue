<template>
  <div>
    <!-- Redirect to companies -->
    <p>Redirecting...</p>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard'
})

// Auto redirect to companies
const router = useRouter()

onMounted(() => {
  router.push('/database/companies')
})
</script>
