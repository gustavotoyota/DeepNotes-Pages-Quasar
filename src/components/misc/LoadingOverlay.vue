<template>
  <div class="loading-overlay">
    <q-circular-progress
      indeterminate
      size="lg"
    />
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;

  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  background-color: #181818;
}

.q-circular-progress {
  transform: translate(-50%, -50%);

  left: 50%;
  top: 50%;
}
</style>
