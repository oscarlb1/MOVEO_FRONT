<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User, Settings, Shield, Bell, CreditCard, 
  ChevronRight, Save, Camera, Mail, Phone, MapPin,
  Moon, Sun, Monitor, ArrowLeft
} from 'lucide-vue-next'
import { useSesionStore } from '@/tiendas/sesion'
import { useTemaStore } from '@/tiendas/tema'
import usuarioServicio from '@/servicios/usuarioServicio'

const router = useRouter()

const sesionStore = useSesionStore()
const temaStore = useTemaStore()
const usuario = computed(() => sesionStore.usuario)

type Seccion = 'perfil' | 'cuenta' | 'seguridad' | 'notificaciones' | 'apariencia'
const seccionActiva = ref<Seccion>('perfil')

const menuSecciones = [
  { id: 'perfil', tag: 'Perfil', icon: User, desc: 'Información personal y avatar' },
  { id: 'apariencia', tag: 'Apariencia', icon: Moon, desc: 'Personaliza el estilo visual' },
  { id: 'cuenta', tag: 'Cuenta', icon: Settings, desc: 'Preferencias de la cuenta y facturación' },
  { id: 'seguridad', tag: 'Seguridad', icon: Shield, desc: 'Contraseña y autenticación' },
  { id: 'notificaciones', tag: 'Notificaciones', icon: Bell, desc: 'Alertas y avisos por correo' }
]

const formularioPerfil = ref({
  nombre: usuario.value?.nombre || '',
  email: usuario.value?.email || '',
  telefono: '+34 600 000 000',
  cargo: 'Director de Logística',
  biografia: 'Profesional con más de 10 años de experiencia en el sector.'
})

const guardando = ref(false)
const mensajeExito = ref(false)

const guardarCambios = () => {
  guardando.value = true
  // Simulación de guardado
  setTimeout(() => {
    guardando.value = false
    mensajeExito.value = true
    setTimeout(() => mensajeExito.value = false, 3000)
  }, 1000)
}

const fileInput = ref<HTMLInputElement | null>(null)
const subiendoImagen = ref(false)
const errorImagen = ref<string | null>(null)

const abrirSelectorImagen = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const onArchivoSeleccionado = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    errorImagen.value = 'El archivo es demasiado grande. Máximo 2MB.'
    return
  }

  errorImagen.value = null
  subiendoImagen.value = true

  try {
    const formData = new FormData()
    formData.append('Imagen', file)
    formData.append('Nombre', formularioPerfil.value.nombre) // Enviamos el nombre actual porque el DTO lo pide
    formData.append('Telefono', formularioPerfil.value.telefono)

    const usuarioActualizado = await usuarioServicio.actualizarMiPerfil(formData)
    
    // Actualizar el estado global con la nueva foto para que todo el panel se entere
    if (sesionStore.usuario) {
      sesionStore.usuario.imagenUrl = usuarioActualizado.imagenUrl || undefined
    }
    
    mensajeExito.value = true
    setTimeout(() => mensajeExito.value = false, 3000)
  } catch (error) {
    console.error('Error al subir la imagen:', error)
    errorImagen.value = 'Ocurrió un error al subir la imagen. Inténtalo de nuevo.'
  } finally {
    subiendoImagen.value = false
    // Reset input
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50/50 pb-20">
    <div class="max-w-7xl mx-auto px-6 pt-10">
      <div class="mb-10">
        <div class="flex items-center gap-4 mb-2">
          <button @click="router.back()" class="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#092C4C]">
            <ArrowLeft class="w-6 h-6" />
          </button>
          <div>
            <h1 class="text-3xl font-bold text-[#092C4C]">Configuración</h1>
            <p class="text-gray-500">Gestiona tu información personal y preferencias de la plataforma.</p>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-[280px_1fr] gap-8">
        <!-- Sidebar Navigation -->
        <aside class="space-y-2">
          <button
            v-for="item in menuSecciones"
            :key="item.id"
            @click="seccionActiva = item.id as Seccion"
            class="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group text-left"
            :class="seccionActiva === item.id 
              ? 'bg-white shadow-md border-l-4 border-[#E67E50] text-[#092C4C]' 
              : 'text-gray-500 hover:bg-white hover:shadow-sm'"
          >
            <div class="p-2 rounded-lg transition-colors" :class="seccionActiva === item.id ? 'bg-[#E67E50]/10 text-[#E67E50]' : 'bg-gray-100 text-gray-400 group-hover:bg-white'">
              <component :is="item.icon" class="w-5 h-5" />
            </div>
            <div>
              <p class="font-bold text-sm leading-none mb-1">{{ item.tag }}</p>
              <p class="text-xs text-secondary-500 opacity-70">{{ item.desc }}</p>
            </div>
          </button>
        </aside>

        <!-- Main Content Area -->
        <main class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- Section: Perfil -->
          <div v-if="seccionActiva === 'perfil'" class="p-8">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-2xl font-bold text-[#092C4C]">Perfil Público</h2>
              <button 
                @click="guardarCambios"
                class="bg-[#E67E50] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#d66d40] transition-colors shadow-lg shadow-[#E67E50]/20 active:scale-95 disabled:opacity-50"
                :disabled="guardando"
              >
                <Save v-if="!guardando" class="w-4 h-4" />
                <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>

            <!-- Avatar Upload -->
            <div class="flex items-center gap-8 mb-10 pb-8 border-b border-gray-50">
              <div class="relative group">
                <div class="w-24 h-24 bg-gradient-to-br from-[#E67E50] to-[#374B54] rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl overflow-hidden relative">
                  <img v-if="usuario?.imagenUrl && !subiendoImagen" :src="usuario.imagenUrl" alt="Foto de perfil" class="w-full h-full object-cover" />
                  <span v-else-if="!subiendoImagen">{{ usuario?.nombre.substring(0, 2).toUpperCase() }}</span>
                  
                  <div v-if="subiendoImagen" class="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                    <div class="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                </div>
                <button 
                  @click="abrirSelectorImagen"
                  :disabled="subiendoImagen"
                  class="absolute -bottom-2 -right-2 p-2 bg-white rounded-lg shadow-md border border-gray-100 text-gray-500 hover:text-[#E67E50] transition-colors disabled:opacity-50">
                  <Camera class="w-4 h-4" />
                </button>
              </div>
              <div>
                <h4 class="font-bold text-[#092C4C] mb-1">Tu Foto de Perfil</h4>
                <p class="text-sm text-gray-500 mb-2">Recomendado 400x400px. Máximo 2MB.</p>
                <p v-if="errorImagen" class="text-xs text-red-500 font-bold mb-2">{{ errorImagen }}</p>
                <div class="flex gap-3">
                  <button @click="abrirSelectorImagen" :disabled="subiendoImagen" class="text-sm font-bold text-[#E67E50] hover:underline disabled:opacity-50 disabled:no-underline">Subir nueva</button>
                  <button :disabled="subiendoImagen" class="text-sm font-bold text-red-400 hover:underline disabled:opacity-50 disabled:no-underline">Eliminar</button>
                </div>
                <!-- Hidden file input -->
                <input 
                  type="file" 
                  ref="fileInput" 
                  accept="image/jpeg, image/png, image/webp" 
                  class="hidden" 
                  @change="onArchivoSeleccionado" 
                />
              </div>
            </div>

            <!-- Profile Form -->
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700">Nombre completo</label>
                <div class="relative group">
                  <User class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#E67E50] transition-colors" />
                  <input 
                    v-model="formularioPerfil.nombre"
                    type="text" 
                    class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#E67E50] focus:ring-4 focus:ring-[#E67E50]/5 outline-none transition-all"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700">Correo electrónico</label>
                <div class="relative group">
                  <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    v-model="formularioPerfil.email"
                    type="email" 
                    disabled
                    class="w-full pl-11 pr-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700">Teléfono</label>
                <div class="relative group">
                  <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#E67E50]" />
                  <input 
                    v-model="formularioPerfil.telefono"
                    type="tel" 
                    class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#E67E50] outline-none transition-all"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-gray-700">Cargo / Posición</label>
                <div class="relative group">
                  <Settings class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#E67E50]" />
                  <input 
                    v-model="formularioPerfil.cargo"
                    type="text" 
                    class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#E67E50] outline-none transition-all"
                  />
                </div>
              </div>
              <div class="md:col-span-2 space-y-2">
                <label class="text-sm font-bold text-gray-700">Biografía</label>
                <textarea 
                  v-model="formularioPerfil.biografia"
                  rows="4"
                  class="w-full p-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#E67E50] outline-none transition-all resize-none"
                ></textarea>
              </div>
            </div>
            
            <!-- Success Message Toast-like -->
            <Transition
              enter-active-class="transform transition duration-300 ease-out"
              enter-from-class="translate-y-10 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div v-if="mensajeExito" class="fixed bottom-10 right-10 bg-[#092C4C] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-white/10">
                <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Save class="w-4 h-4 text-white" />
                </div>
                <div>
                  <p class="font-bold">¡Cambios guardados!</p>
                  <p class="text-xs text-gray-400">Tu perfil ha sido actualizado correctamente.</p>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Section: Apariencia -->
          <div v-else-if="seccionActiva === 'apariencia'" class="p-8">
            <h2 class="text-2xl font-bold text-[#092C4C] dark:text-white mb-8">Personalización Visual</h2>
            
            <div class="space-y-8">
              <div>
                <h3 class="text-lg font-bold text-[#092C4C] dark:text-white mb-2">Tema de la interfaz</h3>
                <p class="text-gray-500 mb-6 font-normal">Escoge el modo que mejor se adapte a tu comodidad visual.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- Light Mode -->
                  <button 
                    @click="temaStore.setTema('claro')"
                    class="p-4 rounded-2xl border-2 transition-all text-left group"
                    :class="temaStore.tema === 'claro' 
                      ? 'border-[#E67E50] bg-[#E67E50]/5' 
                      : 'border-gray-100 hover:border-gray-200'"
                  >
                    <div class="w-full aspect-video bg-white border border-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      <Sun class="w-8 h-8 text-yellow-500" />
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-[#092C4C]">Claro</span>
                      <div v-if="temaStore.tema === 'claro'" class="w-2 h-2 bg-[#E67E50] rounded-full"></div>
                    </div>
                  </button>

                  <!-- Dark Mode -->
                  <button 
                    @click="temaStore.setTema('oscuro')"
                    class="p-4 rounded-2xl border-2 transition-all text-left group"
                    :class="temaStore.tema === 'oscuro' 
                      ? 'border-[#E67E50] bg-[#E67E50]/5' 
                      : 'border-gray-100 hover:border-gray-200 dark:border-gray-800'"
                  >
                    <div class="w-full aspect-video bg-[#092C4C] border border-white/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      <Moon class="w-8 h-8 text-blue-400" />
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-[#092C4C] dark:text-white">Oscuro</span>
                      <div v-if="temaStore.tema === 'oscuro'" class="w-2 h-2 bg-[#E67E50] rounded-full"></div>
                    </div>
                  </button>

                  <!-- System Mode -->
                  <button 
                    @click="temaStore.setTema('sistema')"
                    class="p-4 rounded-2xl border-2 transition-all text-left group"
                    :class="temaStore.tema === 'sistema' 
                      ? 'border-[#E67E50] bg-[#E67E50]/5' 
                      : 'border-gray-100 hover:border-gray-200 dark:border-gray-800'"
                  >
                    <div class="w-full aspect-video bg-gradient-to-r from-white to-[#092C4C] border border-gray-100 dark:border-white/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      <Monitor class="w-8 h-8 text-purple-500" />
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-[#092C4C] dark:text-white">Sistema</span>
                      <div v-if="temaStore.tema === 'sistema'" class="w-2 h-2 bg-[#E67E50] rounded-full"></div>
                    </div>
                  </button>
                </div>
              </div>

              <div class="pt-8 border-t border-gray-100 dark:border-gray-800">
                <h3 class="text-lg font-bold text-[#092C4C] dark:text-white mb-2">Consejo</h3>
                <p class="text-gray-500 font-normal">
                  El modo oscuro ayuda a reducir la fatiga visual en entornos con poca luz y puede ahorrar batería en dispositivos con pantallas OLED.
                </p>
              </div>
            </div>
          </div>

          <!-- Other Sections Shell -->
          <div v-else class="p-12 text-center">
            <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <component :is="menuSecciones.find(s => s.id === seccionActiva)?.icon" class="w-10 h-10 text-gray-300" />
            </div>
            <h3 class="text-xl font-bold text-[#092C4C] mb-2">Sección {{ menuSecciones.find(s => s.id === seccionActiva)?.tag }}</h3>
            <p class="text-gray-500 mb-8">Esta sección está actualmente en desarrollo. Pronto podrás configurar tus preferencias detalladas.</p>
            <button class="text-[#E67E50] font-bold hover:underline">Volver a Perfil</button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: slide-up 0.4s ease-out;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
