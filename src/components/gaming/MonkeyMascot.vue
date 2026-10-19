<template>
  <svg
    class="monkey-mascot"
    :viewBox="portrait ? '35 10 250 225' : '0 0 320 380'"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <radialGradient :id="`${id}-fur`" cx=".32" cy=".2" r=".85">
        <stop stop-color="#cd8b50" />
        <stop offset=".55" stop-color="#91502e" />
        <stop offset="1" stop-color="#46261f" />
      </radialGradient>
      <radialGradient :id="`${id}-face`" cx=".4" cy=".25" r=".8">
        <stop stop-color="#fff0ca" />
        <stop offset=".65" stop-color="#efc18c" />
        <stop offset="1" stop-color="#cf8b58" />
      </radialGradient>
      <linearGradient :id="`${id}-jacket`" x2=".9" y2="1">
        <stop stop-color="#d4bfff" />
        <stop offset=".45" stop-color="#9870e8" />
        <stop offset="1" stop-color="#54329b" />
      </linearGradient>
      <linearGradient :id="`${id}-shoe`" x2=".7" y2="1">
        <stop stop-color="#efffb1" />
        <stop offset=".6" stop-color="#c4ed68" />
        <stop offset="1" stop-color="#719a33" />
      </linearGradient>
    </defs>
    <g v-if="!portrait">
      <path
        d="M229 294c80 25 83-55 52-51-29 4-12 34 3 18"
        fill="none"
        stroke="#502c20"
        stroke-width="23"
        stroke-linecap="round"
      />
      <path
        d="M231 290c75 26 79-51 50-43"
        fill="none"
        stroke="#a66a3c"
        stroke-width="12"
        stroke-linecap="round"
      />
      <ellipse
        cx="115"
        cy="317"
        rx="34"
        ry="39"
        :fill="`url(#${id}-fur)`"
        transform="rotate(16 115 317)"
      />
      <ellipse
        cx="203"
        cy="317"
        rx="34"
        ry="39"
        :fill="`url(#${id}-fur)`"
        transform="rotate(-16 203 317)"
      />
      <path
        d="M100 222q-35 15-39 64-1 26 22 26 22-2 24-34l17-35m93-21q35 15 39 64 1 26-22 26-22-2-24-34l-17-35"
        :fill="`url(#${id}-jacket)`"
      />
      <ellipse
        cx="77"
        cy="299"
        rx="21"
        ry="24"
        :fill="`url(#${id}-face)`"
        transform="rotate(15 77 299)"
      />
      <ellipse
        cx="239"
        cy="299"
        rx="21"
        ry="24"
        :fill="`url(#${id}-face)`"
        transform="rotate(-15 239 299)"
      />
      <path d="M110 207q49-24 98 0l21 76q-2 42-70 43-68-1-70-43Z" :fill="`url(#${id}-jacket)`" />
      <path
        d="m131 215 28 28 28-28"
        fill="none"
        stroke="#e3d7ff"
        stroke-width="8"
        stroke-linecap="round"
      />
      <path d="M139 234v25m39-25v25" stroke="#ede5ff" stroke-width="4" stroke-linecap="round" />
      <path
        d="M126 280q32 13 66 0l-3 23q-30 12-60 0Z"
        fill="#6640ae"
        stroke="#bd9af7"
        stroke-width="2"
      />
      <path
        d="M76 329q22-17 49-1l15 22q7 20-32 22l-38-3q-13-17 6-40m166 0q-22-17-49-1l-15 22q-7 20 32 22l38-3q13-17-6-40"
        :fill="`url(#${id}-shoe)`"
      />
      <path d="m73 361 57 1m58 0 57-1" stroke="#efffc8" stroke-width="9" stroke-linecap="round" />
      <path
        d="m95 337 23 3m-27 8 24 3m107-14-23 3m27 8-24 3"
        stroke="#5d7b2e"
        stroke-width="4"
        stroke-linecap="round"
      />
    </g>
    <ellipse cx="60" cy="125" rx="33" ry="40" :fill="`url(#${id}-fur)`" />
    <ellipse cx="260" cy="125" rx="33" ry="40" :fill="`url(#${id}-fur)`" />
    <ellipse cx="61" cy="128" rx="19" ry="25" fill="#e3a377" />
    <ellipse cx="259" cy="128" rx="19" ry="25" fill="#c98b60" />
    <path
      d="M62 121C56 42 105 19 158 27c63-14 108 24 102 97l-6 35c-5 48-44 71-95 71-58 0-94-25-98-72Z"
      :fill="`url(#${id}-fur)`"
    />
    <path d="m129 36 17-24 14 16 23-13-4 27" :fill="`url(#${id}-fur)`" />
    <path
      d="M79 130c-14-56 39-83 80-42 43-42 94-12 79 43 20 51-20 84-79 84-60 0-101-34-80-85"
      :fill="`url(#${id}-face)`"
    />
    <ellipse cx="119" cy="125" rx="18" ry="24" fill="#fff9e9" />
    <ellipse cx="201" cy="125" rx="18" ry="24" fill="#fff9e9" />
    <ellipse cx="124" cy="129" rx="11" ry="16" fill="#292126" />
    <ellipse cx="196" cy="129" rx="11" ry="16" fill="#292126" />
    <circle cx="128" cy="122" r="4" fill="white" />
    <circle cx="200" cy="122" r="4" fill="white" />
    <path
      d="M102 94q16-12 30-1m56 0q16-11 29 1"
      fill="none"
      stroke="#633922"
      stroke-width="7"
      stroke-linecap="round"
    />
    <ellipse cx="159" cy="155" rx="19" ry="12" fill="#b6774d" />
    <ellipse cx="153" cy="154" rx="3" ry="2" fill="#6c422e" />
    <ellipse cx="166" cy="154" rx="3" ry="2" fill="#6c422e" />
    <path d="M125 175q34 16 69-1-6 29-34 29-25 0-35-28" fill="#502b29" />
    <path d="M131 179q29 10 56-1l-6 10q-25 7-44-1Z" fill="#fffaf0" />
    <path d="M145 200q14-13 29-1-15 7-29 1" fill="#e98c80" />
    <ellipse cx="96" cy="160" rx="13" ry="7" fill="#dd956a" opacity=".55" />
    <ellipse cx="223" cy="160" rx="13" ry="7" fill="#dd956a" opacity=".55" />
    <path d="M57 118C51-4 264-7 264 118" fill="none" stroke="#382749" stroke-width="17" />
    <path d="M57 104C58 4 258 1 264 104" fill="none" stroke="#b798f3" stroke-width="9" />
    <rect
      x="41"
      y="105"
      width="27"
      height="51"
      rx="13"
      fill="#503a7d"
      transform="rotate(-8 54 130)"
    />
    <rect
      x="45"
      y="106"
      width="15"
      height="45"
      rx="7"
      fill="#c0a3ff"
      transform="rotate(-8 54 130)"
    />
    <rect
      x="252"
      y="105"
      width="27"
      height="51"
      rx="13"
      fill="#503a7d"
      transform="rotate(8 265 130)"
    />
    <rect
      x="260"
      y="108"
      width="15"
      height="43"
      rx="7"
      fill="#a382e3"
      transform="rotate(8 265 130)"
    />
    <path
      d="M266 151q-1 32-45 33"
      fill="none"
      stroke="#382749"
      stroke-width="6"
      stroke-linecap="round"
    />
    <rect x="207" y="177" width="23" height="12" rx="6" fill="#c4ed68" />
  </svg>
</template>

<script setup lang="ts">
import { useId } from 'vue'

defineProps<{ portrait?: boolean }>()
const id = `monkey-${useId()}`
</script>
