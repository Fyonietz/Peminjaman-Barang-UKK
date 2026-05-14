<script setup>
import { ref, onMounted } from "vue";

/**
 * Matches your UsersDTO
 */
const users = ref([]);

const form = ref({
  id: null,
  name: "",
  email: "",
  password: "",
  role: ""
});

const isEdit = ref(false);

/**
 * MOCK DATA (replace with API later)
 */
async function fetchUsers() {
  users.value = [
    { id: 1, name: "Alice", email: "alice@mail.com", role: "Admin" },
    { id: 2, name: "Budi", email: "budi@mail.com", role: "Editor" }
  ];
  try {
    const response = await fetch("http://localhost:3000/api/v1/users");
    if(!response.ok){
      throw new Error("Failed to fetch")
    }
    users.value = await response.json();
  } catch (error) {
    console.log(error);
  }
}

onMounted(fetchUsers);
 const showModal = ref(false);
 function openCreate() {
  resetForm();
  showModal.value = true;
}
/**
 * CREATE / UPDATE
 */
function saveUser() {
  if (isEdit.value) {
    const index = users.value.findIndex(u => u.id === form.value.id);
    users.value[index] = { ...form.value };
  } else {
    users.value.push({
      id: Date.now(),
      name: form.value.name,
      email: form.value.email,
      role: form.value.role
    });
  }

  resetForm();
  showModal.value = false;
}

/**
 * EDIT
 */
function editUser(user) {
  form.value = { ...user, password: "" };
  isEdit.value = true;
  showModal.value = true;
}

/**
 * DELETE
 */
function deleteUser(id) {
  users.value = users.value.filter(u => u.id !== id);
}

/**
 * RESET FORM
 */
function resetForm() {
  form.value = {
    id: null,
    name: "",
    email: "",
    password: "",
    role: ""
  };

  isEdit.value = false;
}
</script>

<template>
  <div class="w-full p-6 space-y-6">

    <!-- TITLE -->
    <h1 class="text-2xl font-semibold text-white">Users</h1>

    <!-- FORM -->
<div class="flex justify-between items-center">

  <h1 class="text-2xl font-semibold text-white">
    Users
  </h1>

  <button
    @click="openCreate"
    class="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg text-white"
  >
    Add User
  </button>

</div>

    <!-- TABLE -->
    <div class="w-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

      <table class="w-full text-sm text-left">

        <thead class="bg-zinc-800 text-zinc-400">
          <tr>
            <th class="p-4">Name</th>
            <th class="p-4">Email</th>
            <th class="p-4">Role</th>
            <th class="p-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            class="border-t border-zinc-800"
          >
            <td class="p-4 text-white">{{ user.name }}</td>

            <td class="p-4 text-zinc-400">
              {{ user.email }}
            </td>

            <td class="p-4 text-zinc-400">
              {{ user.role }}
            </td>

            <td class="p-4 flex gap-3">
              <button
                @click="editUser(user)"
                class="text-sky-400 hover:text-sky-300"
              >
                Edit
              </button>

              <button
                @click="deleteUser(user.id)"
                class="text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>

      </table>

    </div>
          <!-- MODAL -->
<div
  v-if="showModal"
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
>

  <div
    class="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5"
  >

    <!-- HEADER -->
    <div class="flex items-center justify-between">

      <h2 class="text-xl font-semibold text-white">
        {{ isEdit ? "Edit User" : "Create User" }}
      </h2>

      <button
        @click="showModal = false"
        class="text-zinc-400 hover:text-white text-xl"
      >
        ✕
      </button>

    </div>

    <!-- FORM -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <input
        v-model="form.name"
        class="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        placeholder="Name"
      />

      <input
        v-model="form.email"
        class="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        placeholder="Email"
      />

      <input
        v-model="form.password"
        type="password"
        class="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        placeholder="Password"
      />

      <input
        v-model="form.role"
        class="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        placeholder="Role"
      />

    </div>

    <!-- ACTIONS -->
    <div class="flex justify-end gap-3 pt-2">

      <button
        @click="showModal = false"
        class="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-white"
      >
        Cancel
      </button>

      <button
        @click="saveUser"
        class="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg text-white"
      >
        {{ isEdit ? "Update" : "Save" }}
      </button>

    </div>

  </div>

</div>
  </div>
</template>
