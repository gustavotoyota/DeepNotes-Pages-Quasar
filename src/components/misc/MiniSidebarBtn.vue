<template>
  <q-item
    clickable
    :active="active"
    v-ripple
    :disable="disabled"
  >
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-tooltip
      anchor="center left"
      self="center right"
      :offset="[10, 10]"
      max-width="200px"
      transition-show="jump-left"
      transition-hide="jump-right"
    >
      {{ tooltip }}
    </q-tooltip>
  </q-item>
</template>

<script
  setup
  lang="ts"
>
defineProps<{
  active?: boolean;
  icon: string;
  tooltip: string;
  disabled?: boolean;
}>();
</script>
