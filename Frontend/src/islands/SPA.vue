<script setup>
import { ref } from "vue";

import AppSidebar from "./Admin/SPA-Admin-Sidebar.vue";
import AppDashboard from "./Admin/SPA-Admin-Dashboard.vue";
import AppUsers from "./Admin/SPA-Admin-Users.vue";

const page = ref("dashboard");
</script>

<template>
  <div class="flex min-h-screen bg-black text-white">

    <!-- SIDEBAR -->
    <AppSidebar v-model="page" />

    <!-- CONTENT -->
    <main class="flex-1 min-w-0 p-6 overflow-auto">

      <AppDashboard v-if="page === 'dashboard'" />
      <AppUsers v-if="page === 'users'" />

    </main>

  </div>
</template>
