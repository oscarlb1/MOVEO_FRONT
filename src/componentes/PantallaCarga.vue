<script setup lang="ts">
// Componente de pantalla de carga "Moveo"
// Contiene la animación CSS del camión proporcionado y una barra de progreso.
</script>

<template>
  <div class="loading-screen">
    <div class="loading-content">
      <!-- Imagen del Camión con animación de baches -->
      <!-- OJO: Asegúrate de colocar la imagen proporcionada en esta ruta o cambiarla -->
      <img src="@/assets/camion-moveo.png" alt="Cargando Moveo" class="truck-image" />
      
      <!-- Texto animado (Pulso) -->
      <h2 class="loading-text">Cargando...</h2>
      
      <!-- Barra de progreso CSS -->
      <div class="progress-track">
        <div class="progress-fill"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor principal a pantalla completa */
.loading-screen {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background-color: #fcfcfc;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* Envoltorio de los elementos centrados */
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* Animación del camión (conduciendo por baches) */
.truck-image {
  width: 280px; /* Ajusta este valor al tamaño ideal de tu imagen */
  height: auto;
  /* Animación rápida (0.4s) infinita, alternando dirección */
  animation: conducir 0.4s ease-in-out infinite alternate;
}

@keyframes conducir {
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  100% {
    /* Sube ligeramente y rota de forma casi imperceptible para dar peso al camión */
    transform: translateY(-4px) rotate(-0.5deg);
  }
}

/* Texto de carga animado (Pulso de opacidad) */
.loading-text {
  font-family: system-ui, -apple-system, sans-serif;
  color: #374B54;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  animation: pulso 1.5s ease-in-out infinite;
}

@keyframes pulso {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

/* Barra de progreso gris claro de ancho fijo */
.progress-track {
  width: 280px;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 9999px; /* Forma de píldora redonda */
  overflow: hidden;
}

/* Relleno de la barra color naranja Moveo */
.progress-fill {
  height: 100%;
  width: 0%;
  background-color: #E67E50;
  border-radius: 9999px;
  /* Animación lineal de 0 a 100 en el tiempo fijado (1.5s sincronizado con el timeout manual) */
  animation: cargar 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes cargar {
  0% {
    width: 0%;
  }
  50% {
    width: 60%; /* Añade una ligera curva natural al progreso */
  }
  100% {
    width: 100%;
  }
}
</style>
