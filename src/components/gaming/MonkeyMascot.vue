<template>
  <svg
    class="monkey-mascot"
    :viewBox="portrait ? '0 0 320 245' : '0 0 320 380'"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <radialGradient :id="`${id}-fur`" cx=".3" cy=".2" r=".9">
        <stop stop-color="#dc9752" />
        <stop offset=".6" stop-color="#b86b34" />
        <stop offset="1" stop-color="#6e351f" />
      </radialGradient>
      <radialGradient :id="`${id}-face`" cx=".35" cy=".2" r=".9">
        <stop stop-color="#ffe9b9" />
        <stop offset="1" stop-color="#e5a86b" />
      </radialGradient>
      <linearGradient :id="`${id}-purple`" x2=".8" y2="1">
        <stop stop-color="#bd9aff" />
        <stop offset=".5" stop-color="#9160e4" />
        <stop offset="1" stop-color="#5c359c" />
      </linearGradient>
      <linearGradient :id="`${id}-lime`" x2=".7" y2="1">
        <stop stop-color="#edffa6" />
        <stop offset="1" stop-color="#9cbd48" />
      </linearGradient>
    </defs>
    <g v-if="!portrait">
      <path
        d="M225 294c80 25 85-57 52-51-25 5-11 32 5 18"
        fill="none"
        :stroke="`url(#${id}-fur)`"
        stroke-width="19"
        stroke-linecap="round"
      />
      <path
        d="m123 302-14 41m86-41 14 41"
        stroke="#9b572c"
        stroke-width="37"
        stroke-linecap="round"
      />
      <path
        d="M109 222q-32-5-48 32l-19-24m169-5q40 28 28 61"
        fill="none"
        :stroke="`url(#${id}-purple)`"
        stroke-width="35"
        stroke-linecap="round"
      />
      <ellipse cx="235" cy="292" rx="20" ry="22" :fill="`url(#${id}-face)`" />
      <path d="M114 208q46-17 89 0l26 80q-8 40-70 40-63 0-71-40Z" :fill="`url(#${id}-purple)`" />
      <path
        d="m123 217 36 22 35-22"
        fill="none"
        stroke="#cdb0ff"
        stroke-width="12"
        stroke-linecap="round"
      />
      <path d="M143 238v27m31-27v27" stroke="#fff1dc" stroke-width="4" stroke-linecap="round" />
      <path d="M125 282q35 12 68 0l-3 22q-31 10-61 0Z" fill="#b18aef" />
      <path
        d="M78 334q24-16 51 2l10 23q-2 12-62 9-15-12 1-34m164 0q-24-16-51 2l-10 23q2 12 62 9 15-12-1-34"
        :fill="`url(#${id}-lime)`"
      />
      <path d="m77 365 56 1m54 0 56-1" stroke="#fff8e7" stroke-width="8" stroke-linecap="round" />
      <path
        d="m96 341 22 2m-25 8 24 2m108-12-22 2m25 8-24 2"
        stroke="#fff8e7"
        stroke-width="4"
        stroke-linecap="round"
      />
      <path
        d="M39 231Q-5 204 22 149q-5 47 32 65Z"
        fill="#ffd244"
        stroke="#e3a431"
        stroke-width="3"
      />
      <path d="m22 149 2-7m15 90 5 5" stroke="#734728" stroke-width="7" stroke-linecap="round" />
      <ellipse cx="43" cy="235" rx="17" ry="20" :fill="`url(#${id}-face)`" />
      <path
        d="m31 226 13 2m-14 6 14 2m-12 6 13 2"
        stroke="#d8965e"
        stroke-width="3"
        stroke-linecap="round"
      />
    </g>
    <g transform="rotate(-6 160 125)">
      <ellipse cx="40" cy="128" rx="37" ry="43" :fill="`url(#${id}-fur)`" />
      <ellipse cx="280" cy="128" rx="37" ry="43" :fill="`url(#${id}-fur)`" />
      <ellipse cx="39" cy="130" rx="23" ry="29" fill="#eea17a" />
      <ellipse cx="281" cy="130" rx="23" ry="29" fill="#e38c67" />
      <ellipse cx="160" cy="127" rx="104" ry="103" :fill="`url(#${id}-fur)`" />
      <path
        d="M77 133c-10-58 40-83 83-43 44-40 94-12 83 43 20 49-20 89-83 89s-103-40-83-89"
        :fill="`url(#${id}-face)`"
      />
      <ellipse cx="120" cy="129" rx="25" ry="32" fill="#fff9ed" />
      <ellipse cx="201" cy="132" rx="25" ry="28" fill="#fff9ed" />
      <ellipse cx="128" cy="134" rx="12" ry="18" fill="#30202b" />
      <ellipse cx="193" cy="134" rx="12" ry="17" fill="#30202b" />
      <circle cx="124" cy="127" r="5" fill="white" />
      <circle cx="189" cy="127" r="5" fill="white" />
      <path
        d="M98 91q17-19 33-7m54 8q17-9 31 4"
        fill="none"
        stroke="#774325"
        stroke-width="8"
        stroke-linecap="round"
      />
      <ellipse cx="160" cy="165" rx="19" ry="11" fill="#b96f3e" />
      <path d="m153 167 2 0m11 0 2 0" stroke="#704022" stroke-width="4" stroke-linecap="round" />
      <ellipse cx="94" cy="174" rx="14" ry="7" fill="#ed9c78" />
      <ellipse cx="229" cy="174" rx="14" ry="7" fill="#ed9c78" />
      <path d="M126 186q36 10 74-4-3 36-37 34-28-1-37-30" fill="#39202b" />
      <path d="m137 189 19 2-1 12-13-2Zm24 2 20-2-3 12-16 2Z" fill="#fff9ed" />
      <path d="M167 209q26-14 25 6-4 21-20 15-10-4-5-21" fill="#f57e9a" />
      <path d="m178 213-2 9" stroke="#cc587c" stroke-width="2" stroke-linecap="round" />
      <g transform="rotate(-9 160 55)">
        <path d="M70 77Q68 4 157 7q93-2 96 68Z" :fill="`url(#${id}-purple)`" />
        <path d="M234 43q78 11 70 34-8 17-66-1Z" fill="#7045bc" />
        <path
          d="M73 73q85-22 176 1"
          fill="none"
          stroke="#c4a3ff"
          stroke-width="12"
          stroke-linecap="round"
        />
        <ellipse cx="155" cy="9" rx="11" ry="5" fill="#d7f47b" />
        <ellipse cx="157" cy="43" rx="18" ry="16" fill="#d7f47b" />
        <path d="m151 40 0 7m11-7v7" stroke="#7952bd" stroke-width="4" stroke-linecap="round" />
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { useId } from 'vue'
defineProps<{ portrait?: boolean }>()
const id = `monkey-${useId()}`
</script>
