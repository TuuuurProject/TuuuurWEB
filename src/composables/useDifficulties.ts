import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export interface DifficultyOption {
  id: number
  label: string
  icon: string
  colorClass: string
}

interface PartyDifficultyLike {
  idDifficulty?: unknown
  difficulty?: { id?: number; label?: string } | null
}

/**
 * Niveaux de difficulté partagés par la sélection et les écrans de fin
 * (ids identiques à ceux de l'API : 1 facile, 2 moyen, 3 difficile, 4 hardcore).
 */
export function useDifficulties() {
  const { t } = useI18n()

  const difficulties = computed<DifficultyOption[]>(() => [
    { id: 1, label: t('solo.difficulties.easy'), icon: 'seedling', colorClass: 'diff-easy' },
    { id: 2, label: t('solo.difficulties.medium'), icon: 'bolt', colorClass: 'diff-medium' },
    { id: 3, label: t('solo.difficulties.hard'), icon: 'fire', colorClass: 'diff-hard' },
    { id: 4, label: t('solo.difficulties.hardcore'), icon: 'skull', colorClass: 'diff-hardcore' },
  ])

  /** Retrouve les difficultés d'une partie renvoyée par l'API (par id, sinon par libellé). */
  const fromParty = (partyDifficulties: PartyDifficultyLike[] | undefined | null) => {
    if (!partyDifficulties) return []
    return partyDifficulties
      .map((d) => {
        const id = Number(d.idDifficulty ?? d.difficulty?.id)
        const label = d.difficulty?.label?.toLowerCase()
        return difficulties.value.find(
          (option) => option.id === id || option.label.toLowerCase() === label,
        )
      })
      .filter((option): option is DifficultyOption => Boolean(option))
  }

  return { difficulties, fromParty }
}
