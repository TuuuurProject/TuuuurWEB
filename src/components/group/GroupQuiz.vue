<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <h2 class="font-branding text-3xl">{{ $t('group.quiz.title') }}</h2>
      </div>
      <div v-if="!finished" class="flex items-center gap-3">
        <span class="pill">{{
          $t('group.quiz.question', { current: lastQuestionIndex + 1, total: nbMaxQuestions })
        }}</span>
        <span class="pill">
          {{ $t('group.quiz.score') }} <strong>{{ globalUserScore }}</strong>
        </span>
      </div>
    </header>

    <Transition name="slide-fade" mode="out-in">
      <!-- Timer / progress -->
      <div v-if="!finished && !showCurrentRanking" class="flex flex-col gap-4">
        <div
          class="rounded-2xl overflow-hidden border border-brand-purple/20 bg-brand-darkGray/80 shadow-neon"
        >
          <div class="h-2 w-full bg-brand-dark/30">
            <div
              class="h-2 transition-[width] duration-250"
              :class="remainingRatio < 0.33 ? 'bg-brand-orange' : 'bg-brand-green'"
              :style="{ width: (remainingRatio * 100).toFixed(2) + '%' }"
            />
          </div>
          <div class="px-6 py-3 flex items-center justify-between text-sm text-brand-lightGray">
            <span>{{ $t('group.quiz.timeRemaining', { time: remaining.toFixed(1) }) }}</span>
          </div>
        </div>

        <!-- Question card -->
        <div class="gaming-card">
          <overlay-block :loading="false">
            <h3 class="font-branding text-2xl mb-4 text-brand-lightGray">{{ currentQuestion }}</h3>
            <div class="grid gap-3 sm:grid-cols-2">
              <button
                v-for="(opt, idx) in currentAnswer"
                :key="opt"
                class="group rounded-2xl border px-4 py-3 text-left font-semibold transition duration-250 relative"
                :disabled="answered"
                :class="buttonClass(opt.id, opt.valid)"
                @click="answer(opt)"
              >
                <span
                  class="absolute top-2 right-2 w-6 h-6 rounded-md bg-brand-purple/20 border border-brand-purple/40 text-brand-purple text-xs flex items-center justify-center font-bold"
                >
                  {{ idx + 1 }}
                </span>
                {{ opt?.value }}
              </button>
            </div>

            <div v-if="answered && scoreIsAvailable" class="mt-6 flex items-center justify-between">
              <div class="text-sm">
                <span v-if="wasCorrect" class="badge-green">{{
                  $t('group.quiz.correct', { points: lastPoints })
                }}</span>
                <span v-else class="badge-orange">{{ $t('group.quiz.incorrect') }}</span>
              </div>
            </div>
          </overlay-block>
        </div>

        <!-- Players status section -->
        <div class="gaming-card">
          <!-- Statut des joueurs (répondu ou non) -->
          <ul
            class="grid gap-4 lg:grid-cols-[repeat(auto-fit,minmax(220px,0.5fr))] grid-cols-1 sm:grid-cols-2"
          >
            <li
              v-for="p in groupeStore.groupePartyInfo?.partyUsers"
              :key="String(p.id)"
              class="rounded-xl border bg-brand-darkGray/30 p-3 flex items-center gap-3 transition-all duration-300"
              :class="getPlayerCardClass(p.user)"
            >
              <div class="relative shrink-0">
                <div class="rounded-full bg-brand-purple/20 flex items-center justify-center">
                  <img
                    v-if="p?.user?.avatar"
                    :src="p.user.avatar"
                    alt="avatar"
                    class="h-10 w-10 rounded-full border-2 object-cover"
                    :class="getPlayerBorderClass(p.user)"
                  />
                  <div
                    v-else
                    class="h-10 w-10 rounded-full border-2 flex items-center justify-center"
                    :class="getPlayerBorderClass(p.user)"
                  >
                    <span class="text-lg font-bold" :class="getPlayerStatusColor(p.user)">
                      {{ p?.user?.nickName?.charAt(0).toUpperCase() || '?' }}
                    </span>
                  </div>
                </div>
                <!-- Status indicator badge -->
                <div
                  class="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-brand-dark flex items-center justify-center shadow-lg transition-all duration-300"
                  :class="getPlayerBadgeClass(p.user)"
                >
                  <font-awesome-icon
                    :icon="getPlayerStatusIcon(p.user)"
                    class="text-[10px] text-white"
                  />
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <div
                  class="text-sm font-semibold leading-tight truncate"
                  :class="getPlayerStatusColor(p.user)"
                >
                  {{ p.user?.nickName }}
                </div>
                <div class="text-xs text-brand-gray">
                  {{ getPlayerStatusText(p.user) }}
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Classement en temps réel (si scoreEachRound activé et tous ont répondu) -->
      <div v-else-if="!finished && showCurrentRanking" class="gaming-card">
        <div class="flex items-center gap-3 mb-4 pb-3 border-b border-brand-purple/20">
          <div
            class="w-8 h-8 rounded-xl bg-brand-yellow/20 flex items-center justify-center text-brand-yellow"
          >
            <font-awesome-icon icon="trophy" />
          </div>
          <h3 class="font-branding text-xl text-brand-lightGray">
            {{ $t('group.quiz.currentRanking') }}
          </h3>
        </div>

        <div class="space-y-2">
          <div
            v-for="(player, index) in sortedCurrentPlayers"
            :key="player.user.id"
            class="flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300"
            :class="[
              index === 0
                ? 'border-brand-yellow/40 bg-brand-yellow/10'
                : index === 1
                  ? 'border-brand-gray/40 bg-brand-gray/5'
                  : index === 2
                    ? 'border-brand-orange/40 bg-brand-orange/5'
                    : 'border-brand-purple/20 bg-brand-darkGray/30',
            ]"
          >
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <span
                class="font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                :class="[
                  index === 0
                    ? 'bg-brand-yellow/20 text-brand-yellow'
                    : index === 1
                      ? 'bg-brand-gray/20 text-brand-gray'
                      : index === 2
                        ? 'bg-brand-orange/20 text-brand-orange'
                        : 'bg-brand-purple/20 text-brand-purple',
                ]"
              >
                {{ index + 1 }}
              </span>
              <div class="relative shrink-0">
                <div
                  class="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                  :class="[
                    index === 0
                      ? 'border-brand-yellow'
                      : index === 1
                        ? 'border-brand-gray'
                        : index === 2
                          ? 'border-brand-orange'
                          : 'border-brand-purple',
                  ]"
                >
                  <img
                    v-if="player?.user?.avatar"
                    :src="player.user.avatar"
                    alt="avatar"
                    class="w-full h-full rounded-full object-cover"
                  />
                  <span
                    v-else
                    class="text-lg font-bold"
                    :class="[
                      index === 0
                        ? 'text-brand-yellow'
                        : index === 1
                          ? 'text-brand-gray'
                          : index === 2
                            ? 'text-brand-orange'
                            : 'text-brand-purple',
                    ]"
                  >
                    {{ player?.user?.nickName?.charAt(0).toUpperCase() || '?' }}
                  </span>
                </div>
                <div
                  v-if="index < 3"
                  class="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-brand-dark flex items-center justify-center"
                  :class="[
                    index === 0
                      ? 'bg-brand-yellow'
                      : index === 1
                        ? 'bg-brand-gray'
                        : 'bg-brand-orange',
                  ]"
                >
                  <font-awesome-icon
                    v-if="index === 0"
                    icon="crown"
                    class="text-[10px] text-brand-dark"
                  />
                  <span v-else class="text-[10px] font-bold text-white">{{ index + 1 }}</span>
                </div>
              </div>
              <span class="font-semibold text-brand-lightGray truncate">
                {{ player.user?.nickName }}
              </span>
            </div>
            <div
              class="font-branding text-xl shrink-0 ml-3"
              :class="[
                index === 0
                  ? 'text-brand-yellow'
                  : index === 1
                    ? 'text-brand-gray'
                    : index === 2
                      ? 'text-brand-orange'
                      : 'text-brand-purple',
              ]"
            >
              {{ player.score }}
            </div>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="finished" class="space-y-6">
        <!-- Header avec score final -->
        <div
          class="gaming-card text-center bg-gradient-to-br from-brand-purple/20 to-brand-orange/20"
        >
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-yellow/20 border-2 border-brand-yellow mb-4 animate-pulse-slow"
          >
            <font-awesome-icon icon="trophy" class="text-3xl text-brand-yellow" />
          </div>
          <h3 class="font-branding text-4xl mb-2 text-brand-lightGray glow-text">
            {{ $t('group.quiz.finished') }}
          </h3>
          <div class="flex items-center justify-center gap-6 mt-4">
            <div class="text-center">
              <div class="text-sm text-brand-gray mb-1">{{ $t('group.quiz.finalScore') }}</div>
              <div class="font-branding text-3xl text-brand-yellow">{{ globalUserScore }}</div>
            </div>
            <div class="h-12 w-px bg-brand-purple/30"></div>
            <div class="text-center">
              <div class="text-sm text-brand-gray mb-1">{{ $t('group.quiz.questions') }}</div>
              <div class="font-branding text-3xl text-brand-lightGray">
                {{ allQuestionsParty.length }}
              </div>
            </div>
            <div class="h-12 w-px bg-brand-purple/30"></div>
            <div class="text-center">
              <div class="text-sm text-brand-gray mb-1">{{ $t('group.quiz.successRate') }}</div>
              <div class="font-branding text-3xl text-brand-green">{{ pourcentageCorrect }}%</div>
            </div>
          </div>

          <!-- Statistiques rapides -->
          <div class="flex items-center justify-center gap-3 mt-6">
            <div class="badge-success">
              <font-awesome-icon icon="check-circle" class="mr-1" />
              {{ correctAnswersCount }} {{ $t('group.quiz.correctAnswers') }}
            </div>
            <div class="badge-warning">
              <font-awesome-icon icon="times-circle" class="mr-1" />
              {{ allQuestionsParty.length - correctAnswersCount }}
              {{ $t('group.quiz.incorrectAnswers') }}
            </div>
          </div>
        </div>

        <!-- Classement des joueurs -->
        <div class="gaming-card">
          <div class="flex items-center gap-3 mb-6 pb-4 border-b border-brand-purple/20">
            <div
              class="w-8 h-8 rounded-xl bg-brand-yellow/20 flex items-center justify-center text-brand-yellow"
            >
              <font-awesome-icon icon="trophy" />
            </div>
            <h3 class="font-branding text-2xl text-brand-lightGray">
              {{ $t('group.quiz.ranking') }}
            </h3>
          </div>

          <!-- Podium Top 3 -->
          <div class="mb-6">
            <div
              class="grid gap-4 max-w-3xl mx-auto items-end"
              :class="{
                'grid-cols-1 max-w-xs': sortedPlayers.length === 1,
                'grid-cols-3': sortedPlayers.length > 1,
              }"
            >
              <!-- 2nd place -->
              <div
                v-if="sortedPlayers[1]"
                class="text-center transform transition-all duration-300 hover:scale-105"
              >
                <div class="relative inline-block mb-3">
                  <div
                    class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-brand-gray/40 bg-brand-darkGray/50 flex items-center justify-center mx-auto shadow-lg"
                  >
                    <img
                      v-if="sortedPlayers[1]?.user?.avatar"
                      :src="sortedPlayers[1].user.avatar"
                      alt="avatar"
                      class="w-full h-full rounded-full object-cover"
                    />
                    <span v-else class="text-2xl sm:text-3xl font-bold text-brand-gray">
                      {{ sortedPlayers[1]?.user?.nickName?.charAt(0).toUpperCase() || '?' }}
                    </span>
                  </div>
                  <div
                    class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-gray/80 border-2 border-brand-dark flex items-center justify-center shadow-lg"
                  >
                    <span class="text-sm font-bold text-white">2</span>
                  </div>
                </div>
                <div class="font-semibold text-sm text-brand-lightGray truncate px-2">
                  {{ sortedPlayers[1].user?.nickName }}
                </div>
                <div class="text-2xl font-branding text-brand-gray mt-1">
                  {{ sortedPlayers[1].score }}
                </div>
                <div
                  class="mt-2 h-24 sm:h-32 bg-gradient-to-t from-brand-gray/30 to-brand-gray/10 border-2 border-brand-gray/30 rounded-t-xl"
                ></div>
              </div>

              <!-- 1st place -->
              <div
                v-if="sortedPlayers[0]"
                class="text-center transform transition-all duration-300 hover:scale-105"
              >
                <div class="relative inline-block mb-3">
                  <div
                    class="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-brand-yellow bg-brand-darkGray/50 flex items-center justify-center mx-auto shadow-neon animate-pulse-slow"
                  >
                    <img
                      v-if="sortedPlayers[0]?.user?.avatar"
                      :src="sortedPlayers[0].user.avatar"
                      alt="avatar"
                      class="w-full h-full rounded-full object-cover"
                    />
                    <span v-else class="text-3xl sm:text-4xl font-bold text-brand-yellow">
                      {{ sortedPlayers[0]?.user?.nickName?.charAt(0).toUpperCase() || '?' }}
                    </span>
                  </div>
                  <div
                    class="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-yellow border-2 border-brand-dark flex items-center justify-center shadow-lg"
                  >
                    <font-awesome-icon icon="crown" class="text-sm text-brand-dark" />
                  </div>
                  <div
                    class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-yellow border-2 border-brand-dark flex items-center justify-center shadow-lg"
                  >
                    <span class="text-sm font-bold text-brand-dark">1</span>
                  </div>
                </div>
                <div class="font-bold text-brand-lightGray truncate px-2">
                  {{ sortedPlayers[0].user?.nickName }}
                </div>
                <div class="text-3xl font-branding text-brand-yellow mt-1 glow-text">
                  {{ sortedPlayers[0].score }}
                </div>
                <div
                  class="mt-2 h-32 sm:h-40 bg-gradient-to-t from-brand-yellow/30 to-brand-yellow/10 border-2 border-brand-yellow/40 rounded-t-xl"
                ></div>
              </div>

              <!-- 3rd place -->
              <div
                v-if="sortedPlayers[2]"
                class="text-center transform transition-all duration-300 hover:scale-105"
              >
                <div class="relative inline-block mb-3">
                  <div
                    class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-brand-orange/40 bg-brand-darkGray/50 flex items-center justify-center mx-auto shadow-lg"
                  >
                    <img
                      v-if="sortedPlayers[2]?.user?.avatar"
                      :src="sortedPlayers[2].user.avatar"
                      alt="avatar"
                      class="w-full h-full rounded-full object-cover"
                    />
                    <span v-else class="text-2xl sm:text-3xl font-bold text-brand-orange">
                      {{ sortedPlayers[2]?.user?.nickName?.charAt(0).toUpperCase() || '?' }}
                    </span>
                  </div>
                  <div
                    class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-orange/80 border-2 border-brand-dark flex items-center justify-center shadow-lg"
                  >
                    <span class="text-sm font-bold text-white">3</span>
                  </div>
                </div>
                <div class="font-semibold text-sm text-brand-lightGray truncate px-2">
                  {{ sortedPlayers[2].user?.nickName }}
                </div>
                <div class="text-2xl font-branding text-brand-orange mt-1">
                  {{ sortedPlayers[2].score }}
                </div>
                <div
                  class="mt-2 h-20 sm:h-28 bg-gradient-to-t from-brand-orange/30 to-brand-orange/10 border-2 border-brand-orange/30 rounded-t-xl"
                ></div>
              </div>
            </div>
          </div>

          <!-- Autres joueurs (Accordion) -->
          <div v-if="sortedPlayers.length > 3" class="mt-6">
            <button
              @click="showAllPlayers = !showAllPlayers"
              class="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-brand-purple/20 bg-brand-darkGray/30 hover:bg-brand-purple/10 transition-all duration-300"
            >
              <span class="font-semibold text-brand-lightGray">
                {{ $t('group.quiz.otherPlayers', { count: sortedPlayers.length - 3 }) }}
              </span>
              <font-awesome-icon
                :icon="showAllPlayers ? 'chevron-up' : 'chevron-down'"
                class="text-brand-purple transition-transform duration-300"
                :class="{ 'rotate-180': showAllPlayers }"
              />
            </button>

            <transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-[500px]"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="opacity-100 max-h-[500px]"
              leave-to-class="opacity-0 max-h-0"
            >
              <div v-show="showAllPlayers" class="overflow-hidden">
                <div class="mt-3 space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <div
                    v-for="(player, index) in sortedPlayers.slice(3)"
                    :key="player.user.id"
                    class="flex items-center justify-between px-4 py-3 rounded-xl border border-brand-purple/10 bg-brand-darkGray/20 hover:border-brand-purple/30 transition-all duration-200"
                  >
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                      <span class="text-brand-gray font-bold text-sm w-6 text-center shrink-0">
                        {{ index + 4 }}
                      </span>
                      <div
                        class="w-10 h-10 rounded-full border-2 border-brand-purple/30 bg-brand-darkGray/50 flex items-center justify-center shrink-0"
                      >
                        <img
                          v-if="player?.user?.avatar"
                          :src="player.user.avatar"
                          alt="avatar"
                          class="w-full h-full rounded-full object-cover"
                        />
                        <span v-else class="text-lg font-bold text-brand-purple">
                          {{ player?.user?.nickName?.charAt(0).toUpperCase() || '?' }}
                        </span>
                      </div>
                      <span class="font-semibold text-brand-lightGray truncate">
                        {{ player.user?.nickName }}
                      </span>
                    </div>
                    <div class="font-branding text-xl text-brand-purple shrink-0 ml-3">
                      {{ player.score }}
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- Informations de la partie -->
        <div class="gaming-card">
          <div class="flex items-center gap-3 mb-6 pb-4 border-b border-brand-purple/20">
            <div
              class="w-8 h-8 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple"
            >
              <font-awesome-icon icon="info-circle" />
            </div>
            <h3 class="font-branding text-2xl text-brand-lightGray">
              {{ $t('group.quiz.partyInfo') }}
            </h3>
          </div>

          <div class="space-y-4">
            <!-- Thèmes -->
            <div class="flex flex-wrap gap-2 items-center">
              <h3 class="font-branding text-xl text-brand-lightGray">
                <font-awesome-icon icon="tag" class="mr-2" /> {{ $t('group.quiz.themes') }} :
              </h3>
              <template v-if="partyThemes.length === 0">
                <div class="text-brand-gray">{{ $t('group.quiz.allThemes') }}</div>
              </template>
              <div v-else class="flex flex-wrap gap-3">
                <div
                  v-for="theme in partyThemes"
                  :key="theme.id"
                  class="category-button group inline-flex items-center gap-2 px-4 py-3 font-semibold"
                >
                  <font-awesome-icon :icon="theme.icon" class="text-lg" />
                  <span>{{ theme.label }}</span>
                </div>
              </div>
            </div>

            <!-- Difficultés -->
            <div class="flex flex-wrap gap-2 items-center">
              <h3 class="font-branding text-xl text-brand-lightGray">
                <font-awesome-icon icon="fire" class="mr-2 text-brand-orange" />
                {{ $t('group.quiz.difficulties') }} :
              </h3>
              <div class="flex flex-wrap gap-3">
                <div
                  v-for="diff in partyDifficulties"
                  :key="diff.id"
                  class="difficulty-button group inline-flex items-center gap-2 px-4 py-3 font-semibold"
                  :class="[diff.colorClass]"
                >
                  <font-awesome-icon :icon="diff.icon" class="text-lg" />
                  <span>{{ diff.label }}</span>
                </div>
              </div>
            </div>

            <!-- Nombre de questions -->
            <div>
              <h3 class="font-branding text-xl text-brand-lightGray">
                <font-awesome-icon icon="list-ol" class="mr-2" />
                {{ $t('group.quiz.numberOfQuestions') }} :
                {{ groupeStore.groupePartyInfo?.nbQuestions }}
              </h3>
            </div>

            <!-- Score Each Round (uniquement en groupe) -->
            <div v-if="groupeStore.groupePartyInfo?.scoreEachRound !== undefined">
              <h3 class="font-branding text-xl text-brand-lightGray">
                <font-awesome-icon icon="trophy" class="mr-2" />
                {{ $t('group.quiz.scoreEachRound') }} :
                {{
                  groupeStore.groupePartyInfo?.scoreEachRound ? $t('common.yes') : $t('common.no')
                }}
              </h3>
            </div>
          </div>
        </div>

        <!-- Récapitulatif des questions -->
        <div class="gaming-card">
          <div class="flex items-center gap-3 mb-6 pb-4 border-b border-brand-purple/20">
            <div
              class="w-8 h-8 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple"
            >
              <font-awesome-icon icon="list-check" />
            </div>
            <h3 class="font-branding text-2xl text-brand-lightGray">
              {{ $t('group.quiz.summary') }}
            </h3>
          </div>

          <div v-if="allQuestionsParty.length > 0" class="space-y-4 pr-2">
            <div
              v-for="(questionData, idx) in allQuestionsParty"
              :key="idx"
              class="rounded-2xl border border-brand-purple/20 bg-brand-darkGray/50 p-4 hover:border-brand-purple/40 transition-all duration-300"
            >
              <!-- En-tête de la question -->
              <div class="flex items-start gap-3 mb-3">
                <div
                  class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  :class="
                    isQuestionCorrect(questionData)
                      ? 'bg-brand-green/20 text-brand-green border border-brand-green/40'
                      : 'bg-brand-orange/20 text-brand-orange border border-brand-orange/40'
                  "
                >
                  {{ idx + 1 }}
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-brand-lightGray mb-2">
                    {{ questionData?.question?.label }}
                  </p>
                  <div v-if="isQuestionCorrect(questionData)" class="badge-success text-xs">
                    <font-awesome-icon icon="check" class="mr-1" />
                    {{ $t('group.quiz.goodAnswer') }} +{{ getQuestionPoints(questionData) }}
                    pts
                  </div>
                  <div v-else class="badge-warning text-xs">
                    <font-awesome-icon icon="times" class="mr-1" /> {{ $t('group.quiz.badAnswer') }}
                  </div>
                </div>
              </div>

              <!-- Liste des réponses -->
              <div class="grid gap-2 sm:grid-cols-2 mt-3">
                <div
                  v-for="answer in questionData?.question?.answer"
                  :key="answer.id"
                  class="rounded-xl px-3 py-2 text-sm border transition-all duration-200"
                  :class="getAnswerClass(questionData, answer)"
                >
                  <div class="flex items-center gap-2">
                    <span class="flex-shrink-0">
                      <font-awesome-icon v-if="answer.valid" icon="check" />
                      <font-awesome-icon
                        v-else-if="answer.id === questionData?.idAnswer"
                        icon="times"
                      />
                      <font-awesome-icon v-else icon="circle" class="text-xs" />
                    </span>
                    <span class="flex-1">{{ answer.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-brand-gray space-y-4 pr-2">
            {{ $t('group.quiz.noQuestions') }}
          </div>
        </div>

        <!-- Actions finales -->
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-3 sticky bottom-0 left-0 right-0 pb-3"
        >
          <button
            class="btn btn-secondary w-full sm:w-auto"
            @click="comeFromHistory ? router.push({ name: 'Profile' }) : $emit('exit')"
          >
            <font-awesome-icon icon="arrow-left" class="mr-2" /> {{ $t('common.back') }}
          </button>
          <button
            v-if="!comeFromHistory"
            class="btn btn-secondary w-full sm:w-auto"
            @click="exitQuizGame"
          >
            <font-awesome-icon icon="arrow-left" class="mr-2" />
            {{ $t('group.quiz.returnToLobby') }}
          </button>
        </div>
      </div>
    </Transition>

    <div v-if="!finished" class="flex flex-wrap items-center justify-end gap-3 mt-4">
      <button class="btn btn-ghost" @click="showConfirmLeaveModal = true">
        <font-awesome-icon icon="arrow-left" class="mr-2" /> {{ $t('group.lobby.leave') }}
      </button>
    </div>

    <!-- Modale de confirmation pour quitter la partie -->
    <ModalDialog
      :open="showConfirmLeaveModal"
      :title="$t('group.quiz.confirmLeave.title')"
      @confirm="confirmLeave"
      @close="cancelLeave"
    >
      <p class="text-brand-lightGray">{{ $t('group.quiz.confirmLeave.message') }}</p>
    </ModalDialog>
  </section>

  <transition name="countdown-fade">
    <div
      v-if="countdownValue !== null"
      class="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 backdrop-blur-sm mt-0"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="text-center select-none">
        <transition name="countdown-swap" mode="out-in">
          <div
            :key="countdownValue"
            class="countdown-pop drop-shadow-[0_0_30px_rgba(108,92,231,0.55)]"
            :class="countdownTextClass"
          >
            {{ countdownValue }}
          </div>
        </transition>
        <div class="countdown-message mt-4 text-sm text-brand-lightGray/80">
          {{ $t('group.quiz.getReady') }}
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRouter, type RouteLocationNormalized } from 'vue-router'
import OverlayBlock from '@/components/OverlayBlock.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import signalrService, { GroupEvent } from '@/services/signalrService'
import useGroupeStore, {
  type GroupePartyInfo,
  type PartyQuestion,
  type User,
} from '@/stores/groupe'
import useUserStore from '@/stores/user'
import useThemeStore from '@/stores/theme'
import { useGroupLifecycle } from '@/composables/useGroupLifecycle'

const groupeStore = useGroupeStore()
const userStore = useUserStore()
const themeStore = useThemeStore()
const { cleanupGroup } = useGroupLifecycle()
const router = useRouter()

const { t } = useI18n()

const TOTAL_TIME = 15 // seconds per question

const emit = defineEmits<{
  (e: 'exit'): void
  (e: 'goToLobby'): void
}>()

const nbMaxQuestions = ref(0)
const answered = ref(false)
const wasCorrect = ref(false)
const lastPoints = ref(0)
const finished = ref(false)
const globalUserScore = ref(5000)
const userAnswerId = ref(<number | null>null)
const scoreIsAvailable = ref(false)
const percentageCorrectScore = ref(<number | null>null)
const comeFromHistory = ref(false)

// Track which users have answered the current question
const usersAnswered = ref(new Set<number | string>())

// Track player answer results (userId -> correct)
const playerAnswerResults = ref(new Map<number | string, boolean>())

// Players ranking
const playersRanking = ref<
  Array<{
    score: number
    user: {
      id?: number
      nickName?: string
      avatar?: string | null
      email?: string
      isAdmin?: boolean
      isNew?: boolean
    }
  }>
>([])
const showAllPlayers = ref(false)

const remaining = ref(TOTAL_TIME)
let timer: number | null = null
let startTime: number | null = null

// Gestion de la modale de confirmation pour quitter
const showConfirmLeaveModal = ref(false)
let pendingNavigation: { to: RouteLocationNormalized; from: RouteLocationNormalized } | null = null

const remainingRatio = computed(() => Math.max(0, remaining.value / TOTAL_TIME))

const instance = getCurrentInstance()
const proxy = instance?.proxy

// Computed to calculate all players' status once
const playersStatus = computed(() => {
  const players = groupeStore.groupePartyInfo?.partyUsers || []
  const statusMap = new Map()

  players.forEach((p: any) => {
    const userId = p.user?.id ?? p.user?.idUser
    if (userId == null) return

    const hasAnswered = usersAnswered.value.has(userId)
    const hasResult = playerAnswerResults.value.has(userId)
    const isCurrentUser =
      (userId === userStore.userId && userStore.isLogged) ||
      (userId === userStore.userIdInvited && userStore.isLoggedAsInvited)

    let status = 'waiting'

    // Before score is available: show if player answered or is waiting
    if (!scoreIsAvailable.value) {
      status = hasAnswered ? 'answered' : 'waiting'
    }
    // After score is available: show correct/incorrect/noAnswer
    else {
      if (isCurrentUser) {
        // For current user, use answered and wasCorrect
        if (answered.value) {
          status = wasCorrect.value ? 'correct' : 'incorrect'
        } else {
          status = 'noAnswer'
        }
      } else {
        // For other players, use playerAnswerResults if available
        if (hasResult) {
          const isCorrect = playerAnswerResults.value.get(userId)
          status = isCorrect ? 'correct' : 'incorrect'
        } else if (hasAnswered) {
          // Answered but result not received yet (transient state)
          status = 'answered'
        } else {
          status = 'noAnswer'
        }
      }
    }

    statusMap.set(userId, {
      status,
      colorClass:
        status === 'correct'
          ? 'text-brand-green'
          : status === 'incorrect'
            ? 'text-red-500'
            : status === 'answered'
              ? 'text-brand-green'
              : status === 'noAnswer'
                ? 'text-brand-gray'
                : 'text-brand-orange',
      borderClass:
        status === 'correct'
          ? 'border-brand-green'
          : status === 'incorrect'
            ? 'border-red-500'
            : status === 'answered'
              ? 'border-brand-green'
              : status === 'noAnswer'
                ? 'border-brand-gray'
                : 'border-brand-orange',
      cardClass:
        status === 'correct'
          ? 'border-brand-green/40 bg-brand-green/5'
          : status === 'incorrect'
            ? 'border-red-500/40 bg-red-500/5'
            : status === 'answered'
              ? 'border-brand-green/40 bg-brand-green/5'
              : status === 'noAnswer'
                ? 'border-brand-gray/40 bg-brand-gray/5'
                : 'border-brand-orange/40 bg-brand-orange/5',
      badgeClass:
        status === 'correct'
          ? 'bg-brand-green'
          : status === 'incorrect'
            ? 'bg-red-500'
            : status === 'answered'
              ? 'bg-brand-green'
              : status === 'noAnswer'
                ? 'bg-brand-gray'
                : 'bg-brand-orange animate-pulse',
      icon:
        status === 'correct'
          ? 'check'
          : status === 'incorrect'
            ? 'times'
            : status === 'answered'
              ? 'check'
              : status === 'noAnswer'
                ? 'times'
                : 'clock',
      text:
        status === 'correct'
          ? t('group.quiz.goodAnswer')
          : status === 'incorrect'
            ? t('group.quiz.badAnswer')
            : status === 'answered'
              ? t('group.quiz.answered')
              : status === 'noAnswer'
                ? t('group.quiz.noAnswer')
                : t('group.quiz.waiting'),
    })
  })

  return statusMap
})

// Helper functions to get player status data
const getPlayerStatusData = (user: { id?: number | string; idUser?: number | string }) => {
  const userId = user?.id ?? user?.idUser
  return (
    playersStatus.value.get(userId) || {
      status: 'waiting',
      colorClass: 'text-brand-orange',
      borderClass: 'border-brand-orange',
      cardClass: 'border-brand-orange/40 bg-brand-orange/5',
      badgeClass: 'bg-brand-orange animate-pulse',
      icon: 'clock',
      text: t('group.quiz.waiting'),
    }
  )
}

const getPlayerStatusColor = (user: { id?: number | string; idUser?: number | string }) =>
  getPlayerStatusData(user).colorClass

const getPlayerBorderClass = (user: { id?: number | string; idUser?: number | string }) =>
  getPlayerStatusData(user).borderClass

const getPlayerCardClass = (user: { id?: number | string; idUser?: number | string }) =>
  getPlayerStatusData(user).cardClass

const getPlayerStatusIcon = (user: { id?: number | string; idUser?: number | string }) =>
  getPlayerStatusData(user).icon

const getPlayerBadgeClass = (user: { id?: number | string; idUser?: number | string }) =>
  getPlayerStatusData(user).badgeClass

const getPlayerStatusText = (user: { id?: number | string; idUser?: number | string }) =>
  getPlayerStatusData(user).text

// Gestion du clavier
const handleKeyPress = async (event: KeyboardEvent) => {
  // Si le quiz est terminé, ne rien faire
  if (finished.value) return

  // Touche Enter pour passer à la question suivante
  if (event.key === 'Enter') {
    if (answered.value) {
      await next()
    }
    return
  }

  // Touche S pour skip la question
  if (event.key === 's' || event.key === 'S') {
    if (!answered.value) {
      await skip()
    }
    return
  }

  // Mapping des touches clavier français (AZERTY) et international (QWERTY)
  const keyMap: Record<string, number> = {
    // QWERTY
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    // AZERTY (français)
    '&': 1,
    é: 2,
    '"': 3,
    "'": 4,
  }

  const answerNumber = keyMap[event.key]
  if (answerNumber && !answered.value) {
    const answerIndex = answerNumber - 1
    if (currentAnswer.value && currentAnswer.value[answerIndex]) {
      await answer(currentAnswer.value[answerIndex])
    }
  }
}

const startTimer = () => {
  clearTimer()
  remaining.value = TOTAL_TIME
  startTime = Date.now()

  timer = globalThis.setInterval(async () => {
    const elapsed = (Date.now() - startTime!) / 1000 // temps écoulé en secondes
    remaining.value = Math.max(0, +(TOTAL_TIME - elapsed).toFixed(1))

    if (remaining.value <= 0) {
      // Load the answer by ID, set to null to indicate timeout
      // await soloStore.loadAnswerById(null)

      clearTimer()
      answered.value = true
      wasCorrect.value = false
      lastPoints.value = 0
    }
  }, 100)
}
function clearTimer() {
  if (timer != null) {
    clearInterval(timer)
    timer = null
  }
}

const answer = async (opt: { id: number }) => {
  if (answered.value) return
  answered.value = true

  clearTimer()

  // Set user answer ID
  userAnswerId.value = opt.id

  // Add current user to answered set
  if (userStore.userId && userStore.isLogged) {
    usersAnswered.value.add(userStore.userId)
  } else if (userStore.userIdInvited && userStore.isLoggedAsInvited) {
    usersAnswered.value.add(userStore.userIdInvited)
  }

  // Answer
  if (signalrService.isConnected()) {
    await signalrService.send(GroupEvent.SendAnswer, opt.id)
  } else {
    proxy?.$toast.error(t('group.quiz.errorAnswering'))
  }
}

const skip = async () => {
  if (!answered.value) {
    // Load the answer by ID, set to null to indicate skip
    // await soloStore.loadAnswerById(null)
    // answered.value = true
    // clearTimer()
    // wasCorrect.value = false
    // lastPoints.value = 0
  }
}

const next = async () => {
  if (!answered.value) return

  // await soloStore.loadPartyInfo()

  // if (index.value + 1 >= nbMaxQuestions.value) {
  //   finished.value = true
  //   clearTimer()
  //   return
  // }
  // // index.value++
  // answered.value = false
  // wasCorrect.value = false
  // lastPoints.value = 0
  // startTimer()
}

function buttonClass(answerId: number, valid: boolean) {
  if (scoreIsAvailable.value) {
    if (valid === true) {
      return 'border-brand-green bg-brand-green/15 text-brand-green cursor-default'
    }
    if (answerId === userAnswerId.value && valid === false) {
      return 'border-brand-orange bg-brand-orange/15 text-brand-orange cursor-default'
    }
    return 'border-brand-purple/20 bg-brand-darkGray/20 text-brand-gray cursor-default opacity-50'
  }

  if (answerId === userAnswerId.value) {
    return 'border-brand-purple bg-brand-purple/20 text-brand-lightGray cursor-default'
  }

  if (answered.value) {
    return 'border-brand-purple/20 bg-brand-darkGray/20 text-brand-gray cursor-default opacity-50'
  }

  return 'border-brand-purple/20 bg-brand-darkGray/30 text-brand-lightGray hover:border-brand-purple/60 hover:bg-brand-purple/10 cursor-pointer'
}

const allQuestionsParty = computed(() => {
  if (groupeStore.groupePartyInfo) {
    return groupeStore.getQuestions
  }
  return []
})

const lastQuestionIndex = computed(() => allQuestionsParty.value.length - 1)

const currentQuestion = computed(() => {
  return allQuestionsParty.value[lastQuestionIndex.value]?.question?.label ?? ''
})

const currentAnswer = computed(() => {
  return allQuestionsParty.value[lastQuestionIndex.value]?.question?.answer ?? ''
})

// Sorted players by score (descending)
const sortedPlayers = computed(() => {
  return [...playersRanking.value].sort((a, b) => b.score - a.score)
})

// Sorted current players for real-time ranking
const sortedCurrentPlayers = computed(() => {
  return [...playersRanking.value].sort((a, b) => b.score - a.score)
})

// Check if scoreEachRound is enabled
const scoreEachRound = computed(() => {
  return groupeStore.groupePartyInfo?.scoreEachRound ?? false
})

// Show current ranking when scoreEachRound is enabled and all answered
const showCurrentRanking = computed(() => {
  return scoreEachRound.value && playersRanking.value.length > 0
})

// Fonctions pour le récapitulatif
const correctAnswersCount = computed(() => {
  return allQuestionsParty.value.filter((q: any) => isQuestionCorrect(q)).length
})

const pourcentageCorrect = computed(() => {
  if (percentageCorrectScore.value !== null) return percentageCorrectScore.value
  if (allQuestionsParty.value.length === 0) return 0
  return Math.round((correctAnswersCount.value / allQuestionsParty.value.length) * 100)
})

const isQuestionCorrect = (questionData: any) => {
  if (!questionData?.correct) return false
  return questionData?.correct
}

const getQuestionPoints = (questionData: any) => {
  // Simuler les points gagnés (à adapter selon votre logique)
  return questionData?.score || 100
}

// Computed properties pour les informations de la partie
const difficulties = computed(() => [
  {
    id: 1,
    label: t('solo.difficulties.easy'),
    icon: 'seedling',
    colorClass: 'diff-easy',
    glowClass: 'glow-green',
  },
  {
    id: 2,
    label: t('solo.difficulties.medium'),
    icon: 'bolt',
    colorClass: 'diff-medium',
    glowClass: 'glow-yellow',
  },
  {
    id: 3,
    label: t('solo.difficulties.hard'),
    icon: 'fire',
    colorClass: 'diff-hard',
    glowClass: 'glow-orange',
  },
  {
    id: 4,
    label: t('solo.difficulties.hardcore'),
    icon: 'skull',
    colorClass: 'diff-hardcore',
    glowClass: 'glow-red',
  },
])

const partyDifficulties = computed(() => {
  const diffLabels =
    groupeStore.groupePartyInfo?.partyDifficulty.map((d: any) => {
      const difficultyObj = difficulties.value.find(
        (diff: any) => diff.label.toLowerCase() === d.difficulty.label.toLowerCase(),
      )

      if (difficultyObj) return difficultyObj
      return null
    }) || []

  if (!diffLabels || diffLabels.length === 0) return []

  // Remove null values and duplicates
  return diffLabels.filter((item): item is NonNullable<typeof item> => Boolean(item))
})

const partyThemes = computed(() => {
  if (!groupeStore.groupePartyInfo?.partyTheme || !themeStore.list) return []
  const themeIds = groupeStore.groupePartyInfo.partyTheme.map((t: any) => t.idTheme)
  return themeStore.list.filter((t: any) => themeIds.includes(parseInt(t.id)))
})

const isUserAnswerIsCorrect = (questions: any, answerId: number) => {
  const answer = questions.answer.find((ans: { id: number }) => ans.id === answerId)

  return answer ? answer.valid : false
}

const getAnswerClass = (questionData: any, answer: any) => {
  const isCorrect = answer.valid
  const isUserChoice = answer.id === questionData?.idAnswer

  if (isCorrect && isUserChoice) {
    // Bonne réponse sélectionnée
    return 'bg-brand-green/20 border-brand-green text-brand-green font-semibold'
  } else if (isCorrect) {
    // Bonne réponse non sélectionnée
    return 'bg-brand-green/10 border-brand-green/40 text-brand-green'
  } else if (isUserChoice) {
    // Mauvaise réponse sélectionnée
    return 'bg-brand-orange/20 border-brand-orange text-brand-orange font-semibold'
  } else {
    // Autre réponse
    return 'bg-brand-darkGray/30 border-brand-gray/20 text-brand-gray'
  }
}

const exitQuizGame = async () => {
  // Si la partie n'est pas terminée, demander confirmation
  if (!finished.value && groupeStore.groupeId) {
    showConfirmLeaveModal.value = true
    return
  }

  // Sinon retour au lobby
  groupeStore.comeFromEndOfQuizGame = true

  // Reset data du groupe pour éviter des futures
  if (groupeStore.groupePartyInfo?.partyQuestions) groupeStore.groupePartyInfo.partyQuestions = []

  emit('goToLobby')
}

// Handlers for SignalR events
const countdownValue = ref<number | null>(null)
let countdownClearTimeout: number | null = null

const countdownTextClass = computed(() => {
  // Variantes de couleur façon “3-2-1” arcade
  if (countdownValue.value === 3) return 'text-brand-yellow'
  if (countdownValue.value === 2) return 'text-brand-orange'
  if (countdownValue.value === 1) return 'text-brand-green'
  return 'text-brand-lightGray'
})

const handleOnUserAnswer = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('User answer received:', data)
  // Add user to the set of users who answered
  if (data && (data.id || data.userId)) {
    usersAnswered.value.add(data.id ?? data.userId)
  }
}

const handleCountdownEvent = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Countdown event received:', data)

  const value = Number(data)
  if (!Number.isFinite(value)) return

  // Affiche 3 / 2 / 1 en gros overlay
  if (value >= 1) {
    countdownValue.value = value

    // Reset du timeout à chaque tick pour éviter un état “bloqué”
    if (countdownClearTimeout != null) clearTimeout(countdownClearTimeout)

    // On masque un poil après le "1"
    if (value === 1) {
      countdownClearTimeout = globalThis.setTimeout(() => {
        clearCountdownOverlay()
      }, 900)
    }
  } else {
    // Si jamais le backend envoie 0 ou autre signal de fin
    clearCountdownOverlay()
  }
}

function clearCountdownOverlay() {
  if (countdownClearTimeout != null) {
    clearTimeout(countdownClearTimeout)
    countdownClearTimeout = null
  }
  countdownValue.value = null
}

const handleQuestionSend = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('New question received:', data)

  // Reset ranking values for new question
  playersRanking.value = []

  // Reset user answer ID
  userAnswerId.value = null

  // Reset users answered set for new question
  usersAnswered.value.clear()

  // Reset player answer results for new question
  playerAnswerResults.value.clear()

  // Réinitialiser l'état "finished" si une nouvelle partie commence
  if (finished.value) {
    finished.value = false
    globalUserScore.value = 5000
    showAllPlayers.value = false

    // Réinitialiser les questions de la partie précédente
    if (groupeStore.groupePartyInfo) {
      groupeStore.groupePartyInfo.partyQuestions = []
    }
  }

  // Start timer, reset for new question and get question data
  answered.value = false
  wasCorrect.value = false
  scoreIsAvailable.value = false
  lastPoints.value = 0
  groupeStore.groupePartyInfo?.partyQuestions.push(data)

  // Clear timer before start new one
  clearTimer()
  startTimer()
}

const handleQuestionAnswerSend = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Answer received for question:', data)

  scoreIsAvailable.value = true

  // User good answered?
  wasCorrect.value = isUserAnswerIsCorrect(data.question, userAnswerId.value!)

  // Replace value of the question with the updated one containing user answer and correctness
  groupeStore.groupePartyInfo!.partyQuestions.splice(lastQuestionIndex.value, 1, {
    ...data,
    correct: wasCorrect.value,
    idAnswer: userAnswerId.value,
  })

  // Update score
  lastPoints.value = data.score // Points wined for this question
  globalUserScore.value += data.score
}

const handlePartyFinished = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Party finished:', data)

  // Store players ranking data
  if (Array.isArray(data)) {
    playersRanking.value = data
  }

  finished.value = true
}

const handleScoreUpdate = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Score update received:', data)

  // Update players ranking data
  if (Array.isArray(data)) {
    playersRanking.value = data
  }
}

const handleOnError = (error: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Lobby deleted:', error)
  proxy?.$toast.error(error)
}

const handlePartyDeleted = async () => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG) console.log('Party deleted by host')
  proxy?.$toast.warning(t('group.lobby.lobbyDeleted'))

  // Nettoyer le groupe et rediriger
  await cleanupGroup(true) // Skip API call car la partie est déjà supprimée
  emit('exit')
}

const handleAllPlayerAnswered = (data: any) => {
  if (import.meta.env.VITE_DEBUG_CONSOLE_LOG)
    console.log('All players answered the question : ', data)

  // Store player answer results
  if (Array.isArray(data)) {
    data.forEach((playerResult: any) => {
      const userId = playerResult.user?.id ?? playerResult.user?.idUser
      if (userId != null) {
        playerAnswerResults.value.set(userId, playerResult.correct)
      }
    })
  }
}

const allEvents = [
  { name: GroupEvent.Countdown, handler: handleCountdownEvent },
  { name: GroupEvent.QuestionSend, handler: handleQuestionSend },
  { name: GroupEvent.QuestionAnswerSend, handler: handleQuestionAnswerSend },
  { name: GroupEvent.UserAnswer, handler: handleOnUserAnswer },
  { name: GroupEvent.PartyFinished, handler: handlePartyFinished },
  { name: GroupEvent.PartyDeleted, handler: handlePartyDeleted },
  { name: GroupEvent.ScoreUpdate, handler: handleScoreUpdate },
  { name: GroupEvent.AllPlayerAnswered, handler: handleAllPlayerAnswered },
  { name: GroupEvent.Error, handler: handleOnError },
]

// Gestionnaire de fermeture de page
const handleBeforeUnload = () => {
  if (groupeStore.groupeId) {
    // Utiliser la méthode synchrone du store qui utilise fetch + keepalive
    groupeStore.leaveGroupeSync()
  }
}

onMounted(async () => {
  // If onMounted, the groupId exist, display the recap
  if (groupeStore.groupeId) {
    await groupeStore.getGroupeInfo(groupeStore.groupeId)
    finished.value = groupeStore.groupePartyInfo!.finish
    if (finished.value) {
      comeFromHistory.value = true
      globalUserScore.value = groupeStore.groupePartyInfo!.score
      percentageCorrectScore.value = groupeStore.groupePartyInfo!.percent

      // Populate players ranking from userScores (API data, not SignalR)
      const partyInfoRaw = groupeStore.groupePartyInfo as GroupePartyInfo & {
        userScores?: { score: number; user: User }[]
      }
      if (Array.isArray(partyInfoRaw.userScores)) {
        playersRanking.value = partyInfoRaw.userScores.map((us) => ({
          score: us.score,
          user: us.user as {
            id?: number
            nickName?: string
            avatar?: string | null
            email?: string
            isAdmin?: boolean
            isNew?: boolean
          },
        }))
      }

      // Normalize partyQuestions to match the live-game format expected by the recap
      if (groupeStore.groupePartyInfo!.partyQuestions) {
        groupeStore.groupePartyInfo!.partyQuestions =
          groupeStore.groupePartyInfo!.partyQuestions.map((pq) => {
            const raw = pq as PartyQuestion & {
              userPartyQuestion?: { correct?: boolean; idAnswer?: number | null; score?: number }
            }
            return {
              ...pq,
              correct: raw.userPartyQuestion?.correct ?? false,
              idAnswer: raw.userPartyQuestion?.idAnswer ?? null,
              score: raw.userPartyQuestion?.score ?? 0,
            }
          })
      }

      // Load themes so partyThemes computed can resolve icons/labels
      if (!themeStore.list) {
        await themeStore.loadThemes()
      }

      return
    }
  }

  // Load themes if not already loaded
  if (!themeStore.list) {
    await themeStore.loadThemes()
  }

  // Connection signalR
  try {
    allEvents.forEach((event) => {
      signalrService.off(event.name)
    })

    allEvents.forEach((event) => {
      signalrService.on(event.name, (data: unknown) => {
        event.handler(data)
      })
    })
  } catch (error) {
    console.error('Failed to connect to SignalR:', error)
    proxy?.$toast.error(t('group.lobby.connectionError'))
  }

  // Get max questions from party info
  nbMaxQuestions.value = groupeStore.groupePartyInfo?.nbQuestions || 0

  // Ajouter l'écouteur d'événements clavier
  globalThis.addEventListener('keydown', handleKeyPress)

  // Ajouter le gestionnaire de fermeture de page
  globalThis.addEventListener('beforeunload', handleBeforeUnload)
})

// Gérer la navigation (bouton retour du navigateur, changement de route)
onBeforeRouteLeave((to, from, next) => {
  // Si la partie n'est pas terminée et qu'il y a un groupe actif, demander confirmation
  if (groupeStore.groupeId && !finished.value) {
    // Bloquer la navigation et afficher la modale
    pendingNavigation = { to, from }
    showConfirmLeaveModal.value = true
    next(false) // Bloquer la navigation pour l'instant
  } else {
    // Si la partie est terminée ou pas de groupe, laisser partir
    next()
  }
})

// Confirmer le départ
const confirmLeave = async () => {
  showConfirmLeaveModal.value = false

  if (groupeStore.groupeId) {
    await cleanupGroup()
  }

  // Si c'est une navigation de route (bouton retour), naviguer vers la destination
  if (pendingNavigation) {
    await router.push(pendingNavigation.to)
    pendingNavigation = null
  } else {
    // Sinon, c'est le bouton "Leave" qui a été cliqué, émettre l'événement
    emit('exit')
  }
}

// Annuler le départ
const cancelLeave = () => {
  showConfirmLeaveModal.value = false
  pendingNavigation = null
}

onBeforeUnmount(async () => {
  clearTimer()
  clearCountdownOverlay()

  comeFromHistory.value = false

  globalThis.removeEventListener('keydown', handleKeyPress)
  globalThis.removeEventListener('beforeunload', handleBeforeUnload)

  // Nettoyer les listeners SignalR
  allEvents.forEach((event) => {
    signalrService.off(event.name, event.handler)
  })

  // Si on retourne au lobby, NE PAS déconnecter SignalR ni quitter le groupe
  if (groupeStore.comeFromEndOfQuizGame) {
    // Ne rien faire de plus, on garde la connexion et l'état du groupe
    return
  }

  // Sinon (sortie complète ou partie non terminée), cleanup total
  await cleanupGroup()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(10, 11, 30, 0.5);
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(108, 92, 231, 0.4);
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(108, 92, 231, 0.6);
}

/* Boutons de difficulté */
.difficulty-button {
  position: relative;
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(30, 30, 40, 0.5);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--brand-lightGray);
}

.difficulty-button:hover {
  transform: translateX(4px);
  border-color: rgba(255, 255, 255, 0.2);
}

.difficulty-button.selected {
  border-color: currentColor;
  background: rgba(30, 30, 40, 0.8);
}

/* Couleurs par difficulté */
.diff-easy {
  --diff-color: #10b981;
}
.diff-medium {
  --diff-color: #f59e0b;
}
.diff-hard {
  --diff-color: #f97316;
}
.diff-hardcore {
  --diff-color: #ef4444;
}

.difficulty-button {
  color: var(--diff-color);
}

.difficulty-button.selected {
  box-shadow: 0 0 20px rgba(var(--diff-color-rgb), 0.3);
}

/* Effet de glow animé */
.difficulty-glow {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 0.75rem;
}

.difficulty-button:hover .difficulty-glow {
  opacity: 0.1;
}

.glow-green {
  background: radial-gradient(circle, #10b981 0%, transparent 70%);
}
.glow-yellow {
  background: radial-gradient(circle, #f59e0b 0%, transparent 70%);
}
.glow-orange {
  background: radial-gradient(circle, #f97316 0%, transparent 70%);
}
.glow-red {
  background: radial-gradient(circle, #ef4444 0%, transparent 70%);
}
</style>
