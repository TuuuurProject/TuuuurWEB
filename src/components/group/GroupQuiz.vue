<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button class="pill" @click="exitQuizGame">
          <font-awesome-icon icon="arrow-left" class="mr-2" />
          {{ $t('group.quiz.home') }}
        </button>
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

    <!-- Timer / progress -->
    <div
      v-if="!finished"
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
    <div v-if="!finished" class="gaming-card">
      <overlay-block :loading="false">
        <h3 class="font-branding text-2xl mb-4 text-brand-lightGray">{{ currentQuestion }}</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="(opt, idx) in currentAnswer"
            :key="opt"
            class="group rounded-2xl border px-4 py-3 text-left font-semibold transition duration-250 relative"
            :disabled="answered"
            :class="buttonClass(opt.valid)"
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

        <div class="mt-6 flex items-center justify-between">
          <div class="text-sm" v-if="answered && scoreIsAvailable">
            <span v-if="wasCorrect" class="badge-green">{{
              $t('group.quiz.correct', { points: lastPoints })
            }}</span>
            <span v-else class="badge-orange">{{ $t('group.quiz.incorrect') }}</span>
          </div>
          <!-- <div class="flex items-center gap-3 ml-auto">
            <button class="btn btn-secondary" @click="skip" :disabled="answered">
              {{ $t('group.quiz.skip') }}
              <span
                v-if="!answered"
                class="ml-2 px-2 py-0.5 rounded bg-brand-lightGray/20 text-xs font-mono"
              >
                S
              </span>
            </button>
            <button class="btn btn-primary relative" @click="next" :disabled="!answered">
              {{ $t('group.quiz.next') }}
              <span
                v-if="answered"
                class="ml-2 px-2 py-0.5 rounded bg-brand-lightGray/20 text-xs font-mono"
              >
                <font-awesome-icon icon="turn-down" />
              </span>
            </button>
          </div> -->
        </div>
      </overlay-block>
    </div>

    <!-- Players status section -->
    <div v-if="!finished" class="gaming-card">
      <!-- Classement en temps réel (si scoreEachRound activé et tous ont répondu) -->
      <div v-if="showCurrentRanking">
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

      <!-- Statut des joueurs (répondu ou non) -->
      <ul v-else class="grid gap-3 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        <li
          v-for="p in groupeStore.groupePartyInfo?.partyUsers"
          :key="String(p.id)"
          class="rounded-xl border bg-brand-darkGray/30 p-3 flex items-center gap-3 transition-all duration-300"
          :class="
            hasUserAnswered(p.user)
              ? 'border-brand-green/40 bg-brand-green/5'
              : 'border-brand-orange/40 bg-brand-orange/5'
          "
        >
          <div class="relative shrink-0">
            <div class="rounded-full bg-brand-purple/20 flex items-center justify-center">
              <img
                v-if="p?.user?.avatar"
                :src="p.user.avatar"
                alt="avatar"
                class="h-10 w-10 rounded-full border-2 object-cover"
                :class="hasUserAnswered(p.user) ? 'border-brand-green' : 'border-brand-orange'"
              />
              <div
                v-else
                class="h-10 w-10 rounded-full border-2 flex items-center justify-center"
                :class="hasUserAnswered(p.user) ? 'border-brand-green' : 'border-brand-orange'"
              >
                <span
                  class="text-lg font-bold"
                  :class="hasUserAnswered(p.user) ? 'text-brand-green' : 'text-brand-orange'"
                >
                  {{ p?.user?.nickName?.charAt(0).toUpperCase() || '?' }}
                </span>
              </div>
            </div>
            <!-- Status indicator badge -->
            <div
              class="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-brand-dark flex items-center justify-center shadow-lg transition-all duration-300"
              :class="hasUserAnswered(p.user) ? 'bg-brand-green' : 'bg-brand-orange animate-pulse'"
            >
              <font-awesome-icon
                :icon="hasUserAnswered(p.user) ? 'check' : 'clock'"
                class="text-[10px] text-white"
              />
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div
              class="text-sm font-semibold leading-tight truncate"
              :class="hasUserAnswered(p.user) ? 'text-brand-green' : 'text-brand-orange'"
            >
              {{ p.user?.nickName }}
            </div>
            <div class="text-xs text-brand-gray">
              {{ hasUserAnswered(p.user) ? $t('group.quiz.answered') : $t('group.quiz.waiting') }}
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Results -->
    <div v-if="finished" class="space-y-6">
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
            <div class="font-branding text-3xl text-brand-green">
              {{ Math.round((correctAnswersCount / allQuestionsParty.length) * 100) }}%
            </div>
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

        <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
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
                    <font-awesome-icon v-else-if="isUserAnswer(questionData)" icon="times" />
                    <font-awesome-icon v-else icon="circle" class="text-xs" />
                  </span>
                  <span class="flex-1">{{ answer.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions finales -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button class="btn btn-secondary w-full sm:w-auto" @click="exitQuizGame">
          <font-awesome-icon icon="arrow-left" class="mr-2" /> {{ $t('common.leave') }}
        </button>
      </div>
    </div>

    <!-- Mario Kart style Countdown Overlay -->
    <transition name="countdown-fade">
      <div
        v-if="countdownValue !== null"
        class="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 backdrop-blur-sm"
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
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRouter, type RouteLocationNormalized } from 'vue-router'
import OverlayBlock from '@/components/OverlayBlock.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import signalrService, { GroupEvent } from '@/services/signalrService'
import useGroupeStore from '@/stores/groupe'
import useUserStore from '@/stores/user'
import { useGroupLifecycle } from '@/composables/useGroupLifecycle'

const groupeStore = useGroupeStore()
const userStore = useUserStore()
const { cleanupGroup } = useGroupLifecycle()
const router = useRouter()

const { t } = useI18n()

const TOTAL_TIME = 15 // seconds per question

const emit = defineEmits<{
  (e: 'exit'): void
}>()

const nbMaxQuestions = ref(0)
const answered = ref(false)
const wasCorrect = ref(false)
const lastPoints = ref(0)
const finished = ref(false)
const globalUserScore = ref(0)
const userAnswerId = ref(<number | null>null)
const scoreIsAvailable = ref(false)

// Track which users have answered the current question
const usersAnswered = ref(new Set<number | string>())

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

// Gestion de la modale de confirmation pour quitter
const showConfirmLeaveModal = ref(false)
let pendingNavigation: { to: RouteLocationNormalized; from: RouteLocationNormalized } | null = null

const remainingRatio = computed(() => Math.max(0, remaining.value / TOTAL_TIME))

const instance = getCurrentInstance()
const proxy = instance?.proxy

// Helper function to check if a user has answered
const hasUserAnswered = (user: { id?: number | string; idUser?: number | string }) => {
  const userId = user?.id ?? user?.idUser
  return userId != null && usersAnswered.value.has(userId)
}

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
  timer = window.setInterval(async () => {
    remaining.value = Math.max(0, +(remaining.value - 0.1).toFixed(1))
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
  if (userStore.userId) {
    usersAnswered.value.add(userStore.userId)
  }

  console.log('Answer selected answer ID:', opt.id)

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

function buttonClass(valid: boolean) {
  if (!answered.value) {
    return 'bg-brand-darkGray/50 border-brand-purple/30 text-brand-lightGray hover:bg-brand-purple/20 hover:border-brand-purple'
  }

  if (valid === null) return

  return valid
    ? 'bg-brand-green/20 border-brand-green text-brand-green'
    : 'bg-brand-orange/20 border-brand-orange text-brand-orange'
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

// Total number of players
const totalPlayers = computed(() => {
  return groupeStore.groupePartyInfo?.partyUsers?.length ?? 0
})

// Check if all users have answered
const allUsersAnswered = computed(() => {
  return totalPlayers.value > 0 && usersAnswered.value.size >= totalPlayers.value
})

// Show current ranking when scoreEachRound is enabled and all answered
const showCurrentRanking = computed(() => {
  return (
    scoreEachRound.value &&
    answered.value &&
    allUsersAnswered.value &&
    playersRanking.value.length > 0
  )
})

// Fonctions pour le récapitulatif
const correctAnswersCount = computed(() => {
  return allQuestionsParty.value.filter((q: any) => isQuestionCorrect(q)).length
})

const isQuestionCorrect = (questionData: any) => {
  if (!questionData?.correct) return false
  return questionData?.correct
}

const getQuestionPoints = (questionData: any) => {
  // Simuler les points gagnés (à adapter selon votre logique)
  return questionData?.score || 100
}

const isUserAnswer = (questionData: any) => {
  return questionData?.idAnswer !== null
}

const isUserAnswerIsCorrect = (questions: any, answerId: number) => {
  const answer = questions.answer.find((ans: { id: number }) => ans.id === answerId)

  return answer ? answer.valid : false
}

const getAnswerClass = (questionData: any, answer: any) => {
  const isCorrect = answer.valid
  const isUserChoice = isUserAnswer(questionData)

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

  // Si la partie est terminée, quitter directement
  await cleanupGroup()
  emit('exit')
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
  console.log('User answer received:', data)
  // Add user to the set of users who answered
  if (data && (data.id || data.userId)) {
    usersAnswered.value.add(data.id ?? data.userId)
  }
}

const handleCountdownEvent = (data: any) => {
  console.log('Countdown event received:', data)

  const value = Number(data)
  if (!Number.isFinite(value)) return

  // Affiche 3 / 2 / 1 en gros overlay
  if (value >= 1) {
    countdownValue.value = value

    // Reset du timeout à chaque tick pour éviter un état “bloqué”
    if (countdownClearTimeout != null) clearTimeout(countdownClearTimeout)

    // On masque un poil après le "1"
    if (value === 1) {
      countdownClearTimeout = window.setTimeout(() => {
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
  console.log('New question received:', data)

  // Reset user answer ID
  userAnswerId.value = null

  // Reset users answered set for new question
  usersAnswered.value.clear()

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
  console.log('Answer received for question:', data)

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
  console.log('Party finished:', data)

  // Store players ranking data
  if (Array.isArray(data)) {
    playersRanking.value = data
  }

  finished.value = true
}

const handleScoreUpdate = (data: any) => {
  console.log('Score update received:', data)

  // Update players ranking data
  if (Array.isArray(data)) {
    playersRanking.value = data
  }
}

const handleOnError = (error: any) => {
  console.log('Lobby deleted:', error)
  proxy?.$toast.error(error)
}

const handlePartyDeleted = async () => {
  console.log('Party deleted by host')
  proxy?.$toast.warning(t('group.lobby.lobbyDeleted'))

  // Nettoyer le groupe et rediriger
  await cleanupGroup(true) // Skip API call car la partie est déjà supprimée
  emit('exit')
}

const allEvents = [
  { name: GroupEvent.Countdown, handler: handleCountdownEvent },
  { name: GroupEvent.QuestionSend, handler: handleQuestionSend },
  { name: GroupEvent.QuestionAnswerSend, handler: handleQuestionAnswerSend },
  { name: GroupEvent.UserAnswer, handler: handleOnUserAnswer },
  { name: GroupEvent.PartyFinished, handler: handlePartyFinished },
  { name: GroupEvent.PartyDeleted, handler: handlePartyDeleted },
  { name: GroupEvent.ScoreUpdate, handler: handleScoreUpdate },
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
  // Connection signalR
  try {
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
  window.addEventListener('keydown', handleKeyPress)

  // Ajouter le gestionnaire de fermeture de page
  window.addEventListener('beforeunload', handleBeforeUnload)
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

  // Retirer l'écouteur d'événements clavier
  window.removeEventListener('keydown', handleKeyPress)

  // Retirer le gestionnaire de fermeture de page
  window.removeEventListener('beforeunload', handleBeforeUnload)

  // Nettoyer les écouteurs SignalR
  allEvents.forEach((event) => {
    signalrService.off(event.name, event.handler)
  })

  // Quitter le groupe et déconnecter SignalR uniquement si le jeu n'est pas terminé
  // Si finished = true, l'utilisateur peut encore consulter les résultats
  if (finished.value) {
    // Si la partie est terminée, on nettoie seulement les listeners
    // Le cleanup complet sera fait quand l'utilisateur clique sur "Leave"
  } else {
    // Si l'utilisateur quitte pendant le jeu, nettoyer complètement
    await cleanupGroup()
  }
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

/* Countdown overlay animation (Mario Kart vibe) */
.countdown-pop {
  font-size: clamp(96px, 18vw, 220px);
  line-height: 1;
  text-shadow:
    0 0 18px rgba(108, 92, 231, 0.55),
    0 0 42px rgba(108, 92, 231, 0.35);
  animation: countdown-pop 420ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
}

.countdown-message {
  font-size: 2rem;
  animation: countdown-pop 420ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
  animation-delay: 150ms;
}

@keyframes countdown-pop {
  0% {
    transform: scale(0.65) rotate(-3deg);
    opacity: 0;
    filter: blur(2px);
  }
  60% {
    transform: scale(1.08) rotate(1deg);
    opacity: 1;
    filter: blur(0px);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Transition for overlay */
.countdown-fade-enter-active,
.countdown-fade-leave-active {
  transition: opacity 180ms ease;
}
.countdown-fade-enter-from,
.countdown-fade-leave-to {
  opacity: 0;
}

.countdown-swap-enter-active,
.countdown-swap-leave-active {
  transition:
    transform 120ms cubic-bezier(0.2, 0.9, 0.2, 1),
    opacity 120ms ease;
}

.countdown-swap-enter-from {
  transform: scale(0.8);
  opacity: 0;
}
.countdown-swap-enter-to {
  transform: scale(1);
  opacity: 1;
}

.countdown-swap-leave-from {
  transform: scale(1);
  opacity: 1;
}
.countdown-swap-leave-to {
  transform: scale(1.08);
  opacity: 0;
}
</style>
