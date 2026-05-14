<script setup>
const props = defineProps({
  modelValue: String
});

const emit = defineEmits(["update:modelValue"]);

function go(page) {
  emit("update:modelValue", page);
}
</script>

<template>
<aside class="w-52 min-h-screen shrink-0 bg-zinc-900 border-r border-zinc-800 p-3 flex flex-col gap-2">

    <div class="font-bold mb-6 px-2">
      DASH<span class="text-sky-400">X</span>
    </div>

    <button @click="go('dashboard')"
      :class="modelValue === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-400'"
      class="px-3 py-2 rounded text-left">
      Dashboard
    </button>

    <button @click="go('users')"
      :class="modelValue === 'users' ? 'bg-zinc-800 text-white' : 'text-zinc-400'"
      class="px-3 py-2 rounded text-left">
      Users
    </button>

  </aside>
</template>
