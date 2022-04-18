<template>
  <q-btn
    class="display-button"
    :icon="icon"
    color="grey-9"
    dense
    style=""
  />
</template>

<script
  setup
  lang="ts"
>
defineProps<{
  icon: string;
}>();
</script>

<style scoped>
.display-button {
  min-width: 36px;
  height: 36px;

  padding: 0;
}
</style>
