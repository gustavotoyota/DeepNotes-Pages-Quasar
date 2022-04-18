<template>
  <q-btn
    class="display-btn"
    :icon="icon"
    color="grey-9"
    dense
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
.display-btn {
  min-width: 36px;
  height: 36px;

  padding: 0;
}
</style>
