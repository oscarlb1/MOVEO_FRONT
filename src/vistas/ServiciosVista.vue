<script setup lang="ts">
import { 
  Truck, Zap, Brain, Map, Bell, Clock, Shield, 
  BarChart3, Users, FileText, Lock, CheckCircle2 
} from 'lucide-vue-next'

// No necesitamos lógica compleja, es puramente visual según la imagen
</script>

<template>
  <div class="bg-gray-50 min-h-screen font-sans text-slate-800">
    
    <section class="py-20 bg-[#092C4C] text-center px-6">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-white text-lg font-medium opacity-80 mb-2">Soluciones <span class="text-[#E67E50]">completas</span> para tu logística</h2>
        <p class="text-2xl md:text-3xl text-white font-semibold">
          Módulos profesionales que transforman la forma en que gestionas tu operación
        </p>
      </div>
    </section>

    <section class="py-24 max-w-7xl mx-auto px-6">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span class="bg-[#E67E50]/10 text-[#E67E50] px-4 py-1 rounded-full text-sm font-bold mb-6 inline-block">
            🚀 Servicio #1
          </span>
          <h2 class="text-3xl font-bold text-[#092C4C] mb-6">Optimización de Rutas con IA</h2>
          <p class="text-gray-600 mb-8 leading-relaxed">
            Algoritmos inteligentes que calculan la ruta perfecta considerando tráfico en tiempo real, condiciones climáticas e histórico de entregas.
          </p>

          <div class="space-y-6 mb-8">
            <div class="flex gap-4">
              <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <Clock class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 class="font-bold text-[#092C4C]">30% menos tiempo de entrega</h4>
                <p class="text-sm text-gray-500">Reducción promedio en tiempo total de ruta</p>
              </div>
            </div>
            <div class="flex gap-4">
              <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Brain class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 class="font-bold text-[#092C4C]">Aprendizaje continuo</h4>
                <p class="text-sm text-gray-500">La IA mejora con cada ruta completada</p>
              </div>
            </div>
            <div class="flex gap-4">
              <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                <Map class="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 class="font-bold text-[#092C4C]">Replanificación dinámica</h4>
                <p class="text-sm text-gray-500">Adaptación automática a cambios e imprevistos</p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h5 class="text-sm font-bold text-gray-500 mb-4">Comparativa de eficiencia</h5>
            
            <div class="mb-4">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Ruta manual</span>
                <span>125 min</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-gray-400 h-2.5 rounded-full" style="width: 100%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-bold text-[#E67E50] mb-1">
                <span>Ruta optimizada con IA</span>
                <span>87 min</span>
              </div>
              <div class="w-full bg-orange-100 rounded-full h-2.5">
                <div class="bg-[#E67E50] h-2.5 rounded-full" style="width: 70%"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="relative">
            <img 
              src="https://images.unsplash.com/photo-1586155638764-bf045442fcc3?auto=format&fit=crop&q=80&w=1000" 
              alt="Rutas IA" 
              class="rounded-2xl shadow-2xl w-full object-cover h-[500px]"
            />
            <div class="absolute bottom-6 left-6 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Calculando ruta óptima...
            </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-white border-y border-gray-100">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          
          <div class="order-2 lg:order-1 bg-gray-50 p-8 rounded-3xl">
             <div class="bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                <h4 class="font-bold text-[#092C4C]">Mapa en vivo</h4>
                <div class="flex gap-2 text-xs">
                    <span class="bg-[#E67E50] text-white px-2 py-1 rounded">Todos</span>
                    <span class="bg-gray-100 text-gray-500 px-2 py-1 rounded">En ruta</span>
                </div>
             </div>
             <img 
               src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" 
               alt="Dashboard Móvil" 
               class="rounded-xl shadow-inner w-full h-[300px] object-cover mb-4"
             />
             <div class="space-y-2">
                <div class="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center text-sm border-l-4 border-green-500">
                    <span>Vehículo #MV-001</span>
                    <span class="text-green-600 font-bold">En ruta</span>
                </div>
                <div class="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center text-sm border-l-4 border-yellow-500">
                    <span>Vehículo #MV-002</span>
                    <span class="text-yellow-600 font-bold">Parada 15min</span>
                </div>
             </div>
          </div>

          <div class="order-1 lg:order-2">
            <span class="bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm font-bold mb-6 inline-block">
              📡 Servicio #2
            </span>
            <h2 class="text-3xl font-bold text-[#092C4C] mb-6">Seguimiento en Tiempo Real</h2>
            <p class="text-gray-600 mb-8 leading-relaxed">
              Monitoriza cada vehículo de tu flota con actualización GPS cada 30 segundos. Control total de tu operación desde cualquier lugar.
            </p>

            <div class="grid sm:grid-cols-2 gap-4">
              <div class="bg-gray-50 p-6 rounded-xl hover:bg-white hover:shadow-md transition-all">
                <Map class="w-6 h-6 text-[#092C4C] mb-3" />
                <h4 class="font-bold text-[#092C4C] mb-1">GPS Premier</h4>
                <p class="text-xs text-gray-500">Localización exacta en tiempo real</p>
              </div>
              <div class="bg-gray-50 p-6 rounded-xl hover:bg-white hover:shadow-md transition-all">
                <Bell class="w-6 h-6 text-[#092C4C] mb-3" />
                <h4 class="font-bold text-[#092C4C] mb-1">Alertas</h4>
                <p class="text-xs text-gray-500">Notificaciones instantáneas</p>
              </div>
              <div class="bg-gray-50 p-6 rounded-xl hover:bg-white hover:shadow-md transition-all">
                <Clock class="w-6 h-6 text-[#092C4C] mb-3" />
                <h4 class="font-bold text-[#092C4C] mb-1">Histórico</h4>
                <p class="text-xs text-gray-500">Consulta rutas pasadas</p>
              </div>
              <div class="bg-gray-50 p-6 rounded-xl hover:bg-white hover:shadow-md transition-all">
                <Shield class="w-6 h-6 text-[#092C4C] mb-3" />
                <h4 class="font-bold text-[#092C4C] mb-1">Geocercas</h4>
                <p class="text-xs text-gray-500">Zonas de seguridad</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="py-20 bg-[#1e293b] text-white relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 bg-[#E67E50] rounded-full blur-[120px] opacity-10"></div>

      <div class="max-w-7xl mx-auto px-6 relative z-10">
        <div class="text-center mb-16">
          <span class="bg-[#1e293b] border border-gray-600 text-gray-300 px-4 py-1 rounded-full text-sm font-bold mb-4 inline-block">
            📊 Servicio #3
          </span>
          <h2 class="text-3xl font-bold mb-4">Analítica Avanzada</h2>
          <p class="text-gray-400 max-w-2xl mx-auto">
            Dashboards interactivos con KPIs en tiempo real para tomar decisiones informadas.
          </p>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
             <div class="text-[#E67E50] mb-2"><Truck class="w-6 h-6" /></div>
             <div class="text-3xl font-bold mb-1">1,247</div>
             <div class="text-sm text-gray-400">Entregas Completadas</div>
          </div>
          <div class="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
             <div class="text-[#E67E50] mb-2"><Clock class="w-6 h-6" /></div>
             <div class="text-3xl font-bold mb-1">28min</div>
             <div class="text-sm text-gray-400">Tiempo Promedio</div>
          </div>
          <div class="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
             <div class="text-[#E67E50] mb-2"><FileText class="w-6 h-6" /></div>
             <div class="text-3xl font-bold mb-1">€4.20</div>
             <div class="text-sm text-gray-400">Costo por Entrega</div>
          </div>
          <div class="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10">
             <div class="text-[#E67E50] mb-2"><BarChart3 class="w-6 h-6" /></div>
             <div class="text-3xl font-bold mb-1">94%</div>
             <div class="text-sm text-gray-400">Eficiencia Global</div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 max-w-7xl mx-auto px-6">
      <div class="text-center mb-16">
        <h2 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Control de Acceso y Roles</h2>
        <h3 class="text-3xl font-bold text-[#092C4C]">Sistema de permisos granular para máxima seguridad</h3>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-[#E67E50]">
          <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
             <Lock class="w-6 h-6 text-[#E67E50]" />
          </div>
          <h4 class="font-bold text-lg mb-4">Administrador</h4>
          <ul class="space-y-3 text-sm text-gray-600">
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-[#E67E50]" /> Acceso total</li>
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-[#E67E50]" /> Gestión usuarios</li>
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-[#E67E50]" /> Configuración sistema</li>
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-[#E67E50]" /> Reportes avanzados</li>
          </ul>
        </div>

        <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
             <Zap class="w-6 h-6 text-gray-600" />
          </div>
          <h4 class="font-bold text-lg mb-4">Supervisor</h4>
          <ul class="space-y-3 text-sm text-gray-600">
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-gray-400" /> Ver dashboard</li>
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-gray-400" /> Asignar rutas</li>
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-gray-400" /> Monitoreo flota</li>
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-gray-400" /> Gestión incidencias</li>
          </ul>
        </div>

        <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
             <Truck class="w-6 h-6 text-gray-600" />
          </div>
          <h4 class="font-bold text-lg mb-4">Repartidor</h4>
          <ul class="space-y-3 text-sm text-gray-600">
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-gray-400" /> Ver ruta asignada</li>
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-gray-400" /> Confirmar entregas</li>
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-gray-400" /> Reportar incidencias</li>
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-gray-400" /> Chat soporte</li>
          </ul>
        </div>

        <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
             <Users class="w-6 h-6 text-gray-600" />
          </div>
          <h4 class="font-bold text-lg mb-4">Cliente</h4>
          <ul class="space-y-3 text-sm text-gray-600">
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-gray-400" /> Seguimiento pedido</li>
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-gray-400" /> Notificaciones</li>
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-gray-400" /> Valoración servicio</li>
            <li class="flex gap-2"><CheckCircle2 class="w-4 h-4 text-gray-400" /> Historial</li>
          </ul>
        </div>
      </div>
    </section>

  </div>
</template>