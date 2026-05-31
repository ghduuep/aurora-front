<script setup lang="ts">
import { authClient } from '@/lib/auth-client'
import router from '@/router'

const logout = async () => {
  await authClient.signOut()

  router.push('/login')
}
</script>

<template>
  <div class="navbar bg-base-100 shadow-sm gap-4">
    <div class="flex-1">
      <a class="btn btn-ghost text-xl">AuroraCRM</a>
    </div>

    <button class="btn" popovertarget="popover-1" style="anchor-name:--anchor-1">
      Criar novo
    </button>
    <ul class="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
      popover id="popover-1" style="position-anchor:--anchor-1">
      <li><a>Lead</a></li>
      <li><a>Contato</a></li>
      <li><a>Empresa</a></li>
      <li><a>Tarefa</a></li>
    </ul>
    <div class="flex gap-2">
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img
              alt="Tailwind CSS Navbar component"
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            />
          </div>
        </div>
        <ul
          tabindex="-1"
          class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
        >
          <li>
            <router-link class="justify-between" to="/perfil"> Perfil </router-link>
          </li>
          <li><button @click="logout">Logout</button></li>
        </ul>
      </div>
    </div>
  </div>
</template>
