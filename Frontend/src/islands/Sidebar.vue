<script setup>
import { ref } from 'vue';

const active = ref('dashboard');

function go(page) {
  active.value = page;
  window.location.href = `/${page}`;
}
</script>

<template>
  <aside class="w-52 shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col py-6 px-3 gap-1">

    <div class="px-3 mb-6 text-lg font-bold">
      DASH<span class="text-sky-400">X</span>
    </div>

    <button @click="go('dashboard')"
      :class="active === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-400'"
      class="px-3 py-2 rounded-lg text-left">
      Dashboard
    </button>

    <button @click="go('users')"
      :class="active === 'users' ? 'bg-zinc-800 text-white' : 'text-zinc-400'"
      class="px-3 py-2 rounded-lg text-left">
      Users
    </button>

  </aside>
</template>
