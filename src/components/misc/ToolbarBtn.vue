<template>
  <q-btn
    dense
    flat
    :round="round"
    style="height: 28px; padding: 0"
    :style="{
      'min-width': round ? undefined : '28px',
    }"
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
  round?: boolean;
}>();
</script>
