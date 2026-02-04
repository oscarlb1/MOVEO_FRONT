<script setup lang="ts">
import { ref } from 'vue';
import { Mail, Phone, MapPin, Send } from 'lucide-vue-next';
import BotonBase from '@/componentes/comunes/BotonBase.vue';
import { toast } from 'vue-sonner';

const form = ref({
  nombre: '',
  email: '',
  mensaje: ''
});
const loading = ref(false);

const enviarMensaje = async () => {
  loading.value = true;
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  toast.success('Mensaje enviado', {
    description: 'Gracias por contactarnos. Te responderemos pronto.',
  });
  
  form.value = { nombre: '', email: '', mensaje: '' };
  loading.value = false;
};
</script>

<template>
  <div class="min-h-[90vh] bg-gray-50 flex items-center justify-center py-20 px-4">
    <div class="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-start">
      
      <!-- Info Column -->
      <div class="space-y-8 animate-in slide-in-from-left-4 duration-500">
        <div>
          <h1 class="text-4xl font-bold text-[#092C4C] mb-4">Contáctanos</h1>
          <p class="text-lg text-gray-600 leading-relaxed">
            Estamos aquí para ayudarte a optimizar tu logística. Cuéntanos tus necesidades y nuestro equipo se pondrá en contacto contigo.
          </p>
        </div>

        <div class="space-y-6">
          <div class="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center shrink-0">
              <Mail class="w-6 h-6 text-[#E67E50]" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-[#092C4C] mb-1">Email</h3>
              <p class="text-gray-600">info@moveo.com</p>
              <p class="text-gray-600">soporte@moveo.com</p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center shrink-0">
              <Phone class="w-6 h-6 text-[#E67E50]" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-[#092C4C] mb-1">Teléfono</h3>
              <p class="text-gray-600">+34 900 123 456</p>
              <p class="text-sm text-gray-500 mt-1">Lunes a Viernes, 9:00 - 18:00</p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="w-12 h-12 bg-[#E67E50]/10 rounded-xl flex items-center justify-center shrink-0">
              <MapPin class="w-6 h-6 text-[#E67E50]" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-[#092C4C] mb-1">Oficinas</h3>
              <p class="text-gray-600">Calle Innovación 123</p>
              <p class="text-gray-600">28001 Madrid, España</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Column -->
      <div class="bg-white p-8 lg:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-in slide-in-from-right-4 duration-500 delay-100">
        <h2 class="text-2xl font-bold text-[#092C4C] mb-6">Envíanos un mensaje</h2>
        
        <form @submit.prevent="enviarMensaje" class="space-y-6">
          <div class="space-y-2">
            <label for="nombre" class="text-sm font-medium text-gray-700">Nombre completo</label>
            <input 
              id="nombre"
              v-model="form.nombre"
              type="text" 
              required
              placeholder="Tu nombre"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E67E50] focus:bg-white transition-all"
            />
          </div>

          <div class="space-y-2">
            <label for="email" class="text-sm font-medium text-gray-700">Correo electrónico</label>
            <input 
              id="email"
              v-model="form.email"
              type="email" 
              required
              placeholder="tu@email.com"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E67E50] focus:bg-white transition-all"
            />
          </div>

          <div class="space-y-2">
            <label for="mensaje" class="text-sm font-medium text-gray-700">Mensaje</label>
            <textarea 
              id="mensaje"
              v-model="form.mensaje"
              rows="4"
              required
              placeholder="¿En qué podemos ayudarte?"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E67E50] focus:bg-white transition-all resize-none"
            ></textarea>
          </div>

          <BotonBase 
            type="submit" 
            :cargando="loading"
            class="w-full justify-center !text-lg !py-3 !rounded-xl shadow-lg shadow-[#E67E50]/20"
          >
            <template #default>
              Enviar mensaje
              <Send class="w-5 h-5 ml-2" />
            </template>
          </BotonBase>
        </form>
      </div>

    </div>
  </div>
</template>
