<template>
  <!--
    Illustration provisoire de la mascotte Monkizz.
    À remplacer par l'illustration officielle : garder le composant et ses props
    pour que les écrans qui l'utilisent n'aient rien à changer.
  -->
  <svg
    class="monkizz-mascot"
    :class="{ 'monkizz-mascot--bob': animated }"
    :width="size"
    :height="Math.round((size * 152) / 200)"
    viewBox="0 18 200 152"
    role="img"
    :aria-label="$t('mascot.alt')"
  >
    <!-- Oreilles -->
    <circle cx="38" cy="98" r="27" fill="#8a5636" />
    <circle cx="38" cy="98" r="15" fill="#f3cfa8" />
    <circle cx="162" cy="98" r="27" fill="#8a5636" />
    <circle cx="162" cy="98" r="15" fill="#f3cfa8" />

    <!-- Tête -->
    <circle cx="100" cy="98" r="64" fill="#9b6343" />
    <path d="M86 38c4-12 14-18 22-14-6 2-8 7-6 12 6-8 16-9 22-3-8 0-12 4-12 9" fill="#9b6343" />

    <!-- Bandeau aux couleurs de la marque -->
    <path
      d="M42 74c34-20 82-20 116 0l-4 14c-32-17-76-17-108 0z"
      style="fill: rgb(var(--c-primary))"
    />

    <!-- Masque du visage -->
    <ellipse cx="100" cy="122" rx="48" ry="36" fill="#f3cfa8" />
    <circle cx="79" cy="102" r="22" fill="#f3cfa8" />
    <circle cx="121" cy="102" r="22" fill="#f3cfa8" />

    <!-- Yeux -->
    <circle cx="81" cy="104" r="8" fill="#1b1442" />
    <circle cx="119" cy="104" r="8" fill="#1b1442" />
    <circle cx="84" cy="101" r="2.6" fill="#ffffff" />
    <circle cx="122" cy="101" r="2.6" fill="#ffffff" />

    <!-- Joues -->
    <circle cx="66" cy="124" r="7" fill="#f08a7a" opacity="0.45" />
    <circle cx="134" cy="124" r="7" fill="#f08a7a" opacity="0.45" />

    <!-- Nez et sourire -->
    <ellipse cx="94" cy="120" rx="3" ry="2.4" fill="#6b3d24" />
    <ellipse cx="106" cy="120" rx="3" ry="2.4" fill="#6b3d24" />
    <path d="M80 132c10 14 30 14 40 0-6 3-34 3-40 0z" fill="#6b3d24" />
    <path d="M90 138c6 4 14 4 20 0-6-1-14-1-20 0z" fill="#f08a7a" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    animated?: boolean
  }>(),
  {
    size: 200,
    animated: false,
  },
)
</script>

<style scoped>
.monkizz-mascot {
  display: block;
  max-width: 100%;
  height: auto;
}

/* Un seul mouvement à l'arrivée : la mascotte salue en se balançant deux fois */
.monkizz-mascot--bob {
  transform-origin: 50% 90%;
  animation: mascot-bob 1.4s ease-in-out 0.2s 2;
}

@keyframes mascot-bob {
  0%,
  100% {
    transform: rotate(0deg);
  }
  30% {
    transform: rotate(-6deg);
  }
  70% {
    transform: rotate(5deg);
  }
}
</style>
