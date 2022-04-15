<template>
  <q-btn
    dense
    flat
    style="min-width: 28px; height: 28px; padding: 0"
  >
    <q-icon
      :size="size ?? '19px'"
      :name="icon"
    />

    <q-tooltip
      anchor="bottom middle"
      self="top middle"
      :offset="[10, 10]"
    >
      {{ tooltip }}
    </q-tooltip>
  </q-btn>
</template>

<script
  setup
  lang="ts"
>
defineProps<{
  icon: string;
  tooltip: string;
  size?: string;
}>();
</script>
