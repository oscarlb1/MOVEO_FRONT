<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Bienvenido</h1>
        <p>Ingresa tus credenciales para continuar</p>
      </div>
      
      <form @submit.prevent="manejarLogin" class="login-form">
        <div class="form-group">
          <label for="usuario">Usuario</label>
          <input 
            id="usuario" 
            v-model="credenciales.usuario" 
            type="text" 
            placeholder="ej. usuario@moveo.com"
            required 
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="clave">Contraseña</label>
          <input 
            id="clave" 
            v-model="credenciales.clave" 
            type="password" 
            placeholder="••••••••"
            required 
            class="form-input"
          />
        </div>
        
        <div v-if="error" class="alerta-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {{ error }}
        </div>
        
        <BotonBase type="submit" :cargando="cargando" class="btn-full">
          Ingresar
        </BotonBase>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useSesionStore } from '@/tiendas/sesion';
import BotonBase from '@/componentes/comunes/BotonBase.vue';

const router = useRouter();
const sesionStore = useSesionStore();

const credenciales = reactive({
  usuario: '',
  clave: ''
});
const cargando = ref(false);
const error = ref('');

async function manejarLogin() {
  cargando.value = true;
  error.value = '';
  try {
    await sesionStore.iniciarSesion(credenciales);
    router.push('/');
  } catch (e) {
    error.value = 'Credenciales inválidas o error en el servidor';
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1rem;
}

.login-card {
  background: var(--color-surface);
  padding: 2.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-secondary);
  margin-bottom: 0.5rem;
}

.login-header p {
  color: var(--color-text-light);
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--color-text);
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: all 0.2s;
  background-color: #fff;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.alerta-error {
  background-color: #fef2f2;
  color: var(--color-error);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #fee2e2;
}

.btn-full {
  width: 100%;
  padding: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  margin-top: 0.5rem;
}
</style>
