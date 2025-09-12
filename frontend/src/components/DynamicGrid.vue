<template>
  <div 
    class="dynamic-grid"
    :class="[
      `dynamic-grid--${layout}`,
      {
        'dynamic-grid--responsive': responsive,
        'dynamic-grid--animated': animated,
        'dynamic-grid--masonry': masonry
      }
    ]"
    :style="gridStyles"
  >
    <div 
      v-for="(item, index) in items" 
      :key="getItemKey(item, index)"
      class="grid-item"
      :class="[
        `grid-item--${getItemSize(item, index)}`,
        { 'grid-item--animated': animated }
      ]"
      :style="{ 
        animationDelay: animated ? `${index * animationDelay}ms` : undefined,
        ...getItemStyles(item, index)
      }"
    >
      <slot 
        :item="item" 
        :index="index"
        :size="getItemSize(item, index)"
      >
        {{ item }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface GridItem {
  id?: string | number
  [key: string]: unknown
}

interface Props {
  items: GridItem[]
  layout?: 'grid' | 'masonry' | 'flex' | 'auto'
  columns?: number | 'auto'
  gap?: string
  minItemWidth?: string
  maxItemWidth?: string
  responsive?: boolean
  animated?: boolean
  animationDelay?: number
  masonry?: boolean
  itemSizes?: ('sm' | 'md' | 'lg' | 'xl')[]
  itemKey?: string | ((item: GridItem, index: number) => string | number)
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'grid',
  columns: 'auto',
  gap: '24px',
  minItemWidth: '300px',
  maxItemWidth: '1fr',
  responsive: true,
  animated: true,
  animationDelay: 100,
  masonry: false
})

const gridStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  styles['--grid-gap'] = props.gap
  styles['--min-item-width'] = props.minItemWidth
  styles['--max-item-width'] = props.maxItemWidth
  
  if (props.layout === 'grid') {
    if (typeof props.columns === 'number') {
      styles['grid-template-columns'] = `repeat(${props.columns}, 1fr)`
    } else {
      styles['grid-template-columns'] = `repeat(auto-fit, minmax(${props.minItemWidth}, ${props.maxItemWidth}))`
    }
  }
  
  return styles
})

function getItemKey(item: GridItem, index: number): string | number {
  if (typeof props.itemKey === 'string') {
    return (item[props.itemKey] as string | number) || index
  } else if (typeof props.itemKey === 'function') {
    return props.itemKey(item, index)
  }
  return item.id || index
}

function getItemSize(item: GridItem, index: number): string {
  if (props.itemSizes && props.itemSizes[index]) {
    return props.itemSizes[index]
  }
  
  // Auto-generate sizes based on content or patterns
  if (props.layout === 'masonry') {
    const sizes = ['sm', 'md', 'lg']
    return sizes[index % sizes.length]
  }
  
  return 'md'
}

function getItemStyles(item: GridItem, index: number): Record<string, string> {
  const styles: Record<string, string> = {}
  
  if (props.masonry) {
    const size = getItemSize(item, index)
    switch (size) {
      case 'sm':
        styles['grid-row-end'] = 'span 1'
        break
      case 'md':
        styles['grid-row-end'] = 'span 2'
        break
      case 'lg':
        styles['grid-row-end'] = 'span 3'
        break
      case 'xl':
        styles['grid-row-end'] = 'span 4'
        break
    }
  }
  
  return styles
}
</script>

<style scoped lang="scss">
.dynamic-grid {
  --grid-gap: 24px;
  --min-item-width: 300px;
  --max-item-width: 1fr;
  
  display: grid;
  gap: var(--grid-gap);
  width: 100%;
  
  // === LAYOUTS ===
  &--grid {
    grid-template-columns: repeat(auto-fit, minmax(var(--min-item-width), var(--max-item-width)));
  }
  
  &--masonry {
    grid-template-columns: repeat(auto-fit, minmax(var(--min-item-width), var(--max-item-width)));
    grid-auto-rows: 100px;
    
    .grid-item {
      display: flex;
      align-items: stretch;
      
      &--sm {
        grid-row-end: span 2;
      }
      
      &--md {
        grid-row-end: span 3;
      }
      
      &--lg {
        grid-row-end: span 4;
      }
      
      &--xl {
        grid-row-end: span 5;
      }
    }
  }
  
  &--flex {
    display: flex;
    flex-wrap: wrap;
    gap: var(--grid-gap);
    
    .grid-item {
      flex: 1 1 var(--min-item-width);
      max-width: calc(50% - var(--grid-gap) / 2);
      
      @media (max-width: 768px) {
        flex: 1 1 100%;
        max-width: 100%;
      }
    }
  }
  
  &--auto {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--min-item-width), var(--max-item-width)));
    grid-auto-rows: auto;
  }
  
  // === RESPONSIVE ===
  &--responsive {
    @media (max-width: 1200px) {
      --min-item-width: 280px;
      --grid-gap: 20px;
    }
    
    @media (max-width: 768px) {
      --min-item-width: 100%;
      --grid-gap: 16px;
      grid-template-columns: 1fr;
    }
    
    @media (max-width: 480px) {
      --grid-gap: 12px;
    }
  }
  
  // === ANIMATED ===
  &--animated {
    .grid-item {
      opacity: 0;
      animation: fadeInUp 0.6s ease-out forwards;
    }
  }
}

.grid-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &--animated {
    &:hover {
      transform: translateY(-2px);
    }
  }
}

// === ANIMATIONS ===
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// === UTILITY CLASSES ===
.grid-item {
  &--featured {
    grid-column: span 2;
    grid-row: span 2;
    
    @media (max-width: 768px) {
      grid-column: span 1;
      grid-row: span 1;
    }
  }
  
  &--highlight {
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4);
      border-radius: inherit;
      z-index: -1;
    }
  }
}

// === ADVANCED LAYOUTS ===
.dynamic-grid {
  &.layout-pinterest {
    columns: 4;
    column-gap: var(--grid-gap);
    
    .grid-item {
      break-inside: avoid;
      margin-bottom: var(--grid-gap);
    }
    
    @media (max-width: 1200px) {
      columns: 3;
    }
    
    @media (max-width: 768px) {
      columns: 2;
    }
    
    @media (max-width: 480px) {
      columns: 1;
    }
  }
  
  &.layout-isotope {
    .grid-item {
      &.w2 { width: calc(50% - var(--grid-gap) / 2); }
      &.h2 { height: 400px; }
      &.w3 { width: calc(75% - var(--grid-gap) * 0.75); }
    }
  }
}

// === LOADING STATES ===
.grid-loading {
  .grid-item {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
    border-radius: 8px;
    min-height: 200px;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

// Dark mode removed - manual theme control only
</style>
