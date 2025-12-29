<template>
  <div
    class="bg-slate-200 dark:bg-slate-700 animate-pulse"
    :class="[rounded ? 'rounded-lg' : '', className]"
    :style="{
      width: width,
      height: height,
    }"
  ></div>
</template>

<script setup>
defineProps({
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "1rem",
  },
  rounded: {
    type: Boolean,
    default: true,
  },
  className: {
    type: String,
    default: "",
  },
});
</script>
