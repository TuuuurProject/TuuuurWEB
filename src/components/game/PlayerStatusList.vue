<template>
  <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <li
      v-for="player in players"
      :key="player.id"
      class="flex items-center gap-3 rounded-2xl border-2 bg-brand-surface px-3 py-2"
      :class="statusStyle[player.status].border"
    >
      <span class="relative">
        <player-avatar :name="player.name" :avatar="player.avatar" />
        <span
          class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand-surface text-[10px]"
          :class="statusStyle[player.status].badge"
        >
          <font-awesome-icon :icon="statusStyle[player.status].icon" />
        </span>
      </span>
      <span class="flex min-w-0 flex-col">
        <span class="truncate font-semibold">
          {{ player.name }}
          <span v-if="player.isMe" class="text-sm font-normal text-brand-muted">
            {{ $t('game.status.you') }}
          </span>
        </span>
        <span class="text-sm" :class="statusStyle[player.status].text">
          {{ $t(`game.status.${player.status}`) }}
        </span>
      </span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import PlayerAvatar from './PlayerAvatar.vue'

export type PlayerStatus = 'waiting' | 'answered' | 'correct' | 'wrong' | 'noAnswer'

export interface PlayerStatusEntry {
  id: string | number
  name?: string
  avatar?: string | null
  status: PlayerStatus
  isMe?: boolean
}

defineProps<{ players: PlayerStatusEntry[] }>()

const statusStyle: Record<
  PlayerStatus,
  { border: string; badge: string; text: string; icon: string }
> = {
  waiting: {
    border: 'border-brand-line',
    badge: 'bg-brand-surface2 text-brand-muted',
    text: 'text-brand-muted',
    icon: 'hourglass-half',
  },
  answered: {
    border: 'border-brand-purple/50',
    badge: 'bg-brand-purple text-white',
    text: 'text-brand-purple',
    icon: 'check',
  },
  correct: {
    border: 'border-brand-green',
    badge: 'bg-brand-green text-brand-bg',
    text: 'text-brand-green',
    icon: 'check',
  },
  wrong: {
    border: 'border-brand-orange',
    badge: 'bg-brand-orange text-brand-onOrange',
    text: 'text-brand-orange',
    icon: 'xmark',
  },
  noAnswer: {
    border: 'border-brand-line',
    badge: 'bg-brand-surface2 text-brand-muted',
    text: 'text-brand-muted',
    icon: 'xmark',
  },
}
</script>
