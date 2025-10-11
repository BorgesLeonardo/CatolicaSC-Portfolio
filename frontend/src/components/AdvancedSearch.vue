<template>
  <div class="advanced-search" :class="{ 'advanced-search--expanded': isExpanded }">
    <!-- Main Search Bar -->
    <div class="search-bar" :class="{ 'search-bar--focused': isFocused }">
      <div class="search-input-wrapper">
        <q-input
          ref="searchInput"
          v-model="searchQuery"
          :placeholder="placeholder"
          outlined
          dense
          class="search-input"
          @focus="handleFocus"
          @blur="handleBlur"
          @keyup.enter="handleSearch"
          @input="handleInput"
        >
          <template #prepend>
            <q-icon name="search" color="primary" />
          </template>
          
          <template #append>
            <q-btn
              v-if="searchQuery"
              flat
              dense
              round
              icon="clear"
              @click="clearSearch"
              aria-label="Limpar busca"
            />
            <q-btn
              flat
              dense
              round
              :icon="isExpanded ? 'expand_less' : 'tune'"
              @click="toggleExpanded"
              :aria-label="isExpanded ? 'Ocultar filtros' : 'Mostrar filtros'"
            />
          </template>
        </q-input>
      </div>
      
      <!-- Quick Filters -->
      <div class="quick-filters" v-if="quickFilters.length">
        <q-chip
          v-for="filter in quickFilters"
          :key="filter.key"
          :selected="selectedQuickFilters.includes(filter.key)"
          clickable
          :color="selectedQuickFilters.includes(filter.key) ? 'primary' : 'grey-3'"
          :text-color="selectedQuickFilters.includes(filter.key) ? 'white' : 'grey-8'"
          @click="toggleQuickFilter(filter.key)"
          class="quick-filter-chip"
        >
          <q-icon :name="filter.icon" size="sm" class="q-mr-xs" />
          {{ filter.label }}
        </q-chip>
      </div>
    </div>

    <!-- Advanced Filters -->
    <transition name="expand">
      <div class="advanced-filters" v-if="isExpanded">
        <div class="filters-grid">
          <!-- Category Filter -->
          <div class="filter-group">
            <label class="filter-label">Categoria</label>
            <q-select
              v-model="filters.category"
              :options="categoryOptions"
              placeholder="Todas as categorias"
              outlined
              dense
              clearable
              emit-value
              map-options
              class="filter-select"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar v-if="scope.opt.icon">
                    <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Goal Range Filter -->
          <div class="filter-group">
            <label class="filter-label">Meta de Arrecadação</label>
            <div class="range-inputs">
              <q-input
                v-model.number="filters.goalMin"
                type="number"
                placeholder="Mín"
                outlined
                dense
                prefix="R$"
                class="range-input"
              />
              <span class="range-separator">até</span>
              <q-input
                v-model.number="filters.goalMax"
                type="number"
                placeholder="Máx"
                outlined
                dense
                prefix="R$"
                class="range-input"
              />
            </div>
          </div>

          <!-- Date Range Filter -->
          <div class="filter-group">
            <label class="filter-label">Período</label>
            <q-select
              v-model="filters.dateRange"
              :options="dateRangeOptions"
              placeholder="Qualquer período"
              outlined
              dense
              clearable
              emit-value
              map-options
              class="filter-select"
            />
          </div>

          <!-- Status Filter -->
          <div class="filter-group">
            <label class="filter-label">Status</label>
            <q-option-group
              v-model="filters.status"
              :options="statusOptions"
              color="primary"
              type="checkbox"
              class="status-options"
            />
          </div>

          <!-- Sort Options -->
          <div class="filter-group">
            <label class="filter-label">Ordenar por</label>
            <q-select
              v-model="filters.sortBy"
              :options="sortOptions"
              outlined
              dense
              emit-value
              map-options
              class="filter-select"
            />
          </div>

          <!-- Location Filter (if applicable) -->
          <div class="filter-group" v-if="showLocationFilter">
            <label class="filter-label">Localização</label>
            <q-input
              v-model="filters.location"
              placeholder="Cidade, estado ou país"
              outlined
              dense
              class="filter-input"
            >
              <template #prepend>
                <q-icon name="location_on" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="filter-actions">
          <div class="active-filters" v-if="activeFiltersCount > 0">
            <span class="active-filters-label">
              {{ activeFiltersCount }} filtro{{ activeFiltersCount > 1 ? 's' : '' }} ativo{{ activeFiltersCount > 1 ? 's' : '' }}
            </span>
            <q-btn
              flat
              dense
              label="Limpar todos"
              @click="clearAllFilters"
              color="grey-6"
              class="clear-filters-btn"
            />
          </div>
          
          <div class="action-buttons">
            <q-btn
              flat
              label="Cancelar"
              @click="resetFilters"
              color="grey-6"
            />
            <q-btn
              unelevated
              label="Aplicar Filtros"
              color="primary"
              @click="applyFilters"
              :loading="isSearching"
            />
          </div>
        </div>
      </div>
    </transition>

    <!-- Search Suggestions -->
    <transition name="fade">
      <div class="search-suggestions" v-if="showSuggestions && suggestions.length">
        <div class="suggestions-list">
          <div
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            <q-icon :name="suggestion.icon" size="sm" class="suggestion-icon" />
            <div class="suggestion-content">
              <div class="suggestion-text">{{ suggestion.text }}</div>
              <div class="suggestion-category">{{ suggestion.category }}</div>
            </div>
            <q-icon name="north_west" size="xs" class="suggestion-action" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface QuickFilter {
  key: string
  label: string
  icon: string
}

interface FilterOptions {
  category?: string
  goalMin?: number
  goalMax?: number
  dateRange?: string
  status: string[]
  sortBy: string
  location?: string
}

interface SearchSuggestion {
  text: string
  category: string
  icon: string
  value?: string | number
}

interface CategoryOption {
  label: string
  value: string
  icon?: string
  color?: string
}

interface Props {
  quickFilters?: QuickFilter[]
  categoryOptions?: CategoryOption[]
  showLocationFilter?: boolean
  placeholder?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
  quickFilters: () => [
    { key: 'active', label: 'Ativas', icon: 'play_circle' },
    { key: 'ending-soon', label: 'Terminando em breve', icon: 'schedule' },
    { key: 'successful', label: 'Bem-sucedidas', icon: 'check_circle' },
    { key: 'trending', label: 'Em alta', icon: 'trending_up' }
  ],
  categoryOptions: () => [],
  showLocationFilter: false,
  placeholder: 'Buscar campanhas, categorias, criadores...'
})

const emit = defineEmits<{
  search: [query: string, filters: FilterOptions]
  quickFilter: [filterKey: string]
  suggestion: [suggestion: SearchSuggestion]
}>()

// Refs
const searchInput = ref()
const searchQuery = ref('')
const isExpanded = ref(false)
const isFocused = ref(false)
const isSearching = ref(false)
const selectedQuickFilters = ref<string[]>([])
const showSuggestions = ref(false)

// Filters
const filters = ref<FilterOptions>({
  status: ['active'],
  sortBy: 'newest'
})

// Mock suggestions (in real app, would come from API)
const suggestions = ref<SearchSuggestion[]>([
  { text: 'Tecnologia sustentável', category: 'Categoria', icon: 'category' },
  { text: 'Projeto de educação', category: 'Busca popular', icon: 'trending_up' },
  { text: 'Arte digital', category: 'Categoria', icon: 'category' },
  { text: 'João Silva', category: 'Criador', icon: 'person' }
])

// Options
const dateRangeOptions = [
  { label: 'Última semana', value: '7d' },
  { label: 'Último mês', value: '30d' },
  { label: 'Últimos 3 meses', value: '90d' },
  { label: 'Último ano', value: '365d' }
]

const statusOptions = [
  { label: 'Ativas', value: 'active' },
  { label: 'Concluídas', value: 'completed' },
  { label: 'Encerradas', value: 'ended' },
  { label: 'Em breve', value: 'coming-soon' }
]

const sortOptions = [
  { label: 'Mais recentes', value: 'newest' },
  { label: 'Mais antigas', value: 'oldest' },
  { label: 'Maior meta', value: 'goal-desc' },
  { label: 'Menor meta', value: 'goal-asc' },
  { label: 'Mais populares', value: 'popular' },
  { label: 'Terminando em breve', value: 'ending-soon' }
]

// Computed
const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.category) count++
  if (filters.value.goalMin || filters.value.goalMax) count++
  if (filters.value.dateRange) count++
  if (filters.value.status.length > 1) count++
  if (filters.value.location) count++
  return count
})

// Methods
const handleFocus = () => {
  isFocused.value = true
  if (searchQuery.value.length > 0) {
    showSuggestions.value = true
  }
}

const handleBlur = () => {
  isFocused.value = false
  // Delay hiding suggestions to allow clicks
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const handleInput = () => {
  if (searchQuery.value.length > 2) {
    showSuggestions.value = true
    // In real app, debounce and fetch suggestions from API
  } else {
    showSuggestions.value = false
  }
}

const handleSearch = () => {
  showSuggestions.value = false
  isSearching.value = true
  
  setTimeout(() => {
    isSearching.value = false
    emit('search', searchQuery.value, filters.value)
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  showSuggestions.value = false
  void nextTick(() => {
    searchInput.value?.focus()
  })
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const toggleQuickFilter = (filterKey: string) => {
  const index = selectedQuickFilters.value.indexOf(filterKey)
  if (index > -1) {
    selectedQuickFilters.value.splice(index, 1)
  } else {
    selectedQuickFilters.value.push(filterKey)
  }
  emit('quickFilter', filterKey)
}

const selectSuggestion = (suggestion: SearchSuggestion) => {
  searchQuery.value = suggestion.text
  showSuggestions.value = false
  emit('suggestion', suggestion)
  handleSearch()
}

const clearAllFilters = () => {
  filters.value = {
    status: ['active'],
    sortBy: 'newest'
  }
  selectedQuickFilters.value = []
}

const resetFilters = () => {
  clearAllFilters()
  isExpanded.value = false
}

const applyFilters = () => {
  isExpanded.value = false
  handleSearch()
}

// Watch for changes
watch(selectedQuickFilters, () => {
  // Apply quick filters logic
}, { deep: true })
</script>

<style scoped lang="scss">
.advanced-search {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 16px;
  
  @media (min-width: 1024px) {
    max-width: 1200px;
    padding: 0 24px;
  }
  
  @media (min-width: 1440px) {
    max-width: 1400px;
  }
}

.search-bar {
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 2px solid transparent;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  
  // Glassmorphism effect - matching card background
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    z-index: -1;
  }
  
  &--focused {
    border-color: #1e40af;
    box-shadow: 0 12px 48px rgba(30, 64, 175, 0.25), 0 0 0 1px rgba(30, 64, 175, 0.1);
    transform: translateY(-4px) scale(1.02);
    
    &::before {
      background: rgba(255, 255, 255, 0.98);
    }
  }
  
  &:hover:not(&--focused) {
    transform: translateY(-2px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  }
}

.search-input-wrapper {
  padding: 16px 20px;
  position: relative;
  z-index: 1;
  
  @media (min-width: 768px) {
    padding: 20px 24px;
  }
  
  @media (min-width: 1024px) {
    padding: 24px 32px;
  }
}

.search-input {
  .q-field__control {
    border: none;
    box-shadow: none;
    background: transparent;
    min-height: 56px;
    
    @media (min-width: 768px) {
      min-height: 64px;
    }
    
    @media (min-width: 1024px) {
      min-height: 72px;
    }
    
    &:hover {
      border: none;
    }
  }
  
  .q-field__native {
    font-size: 1.125rem;
    font-weight: 500;
    padding: 0;
    
    @media (min-width: 768px) {
      font-size: 1.25rem;
    }
    
    @media (min-width: 1024px) {
      font-size: 1.375rem;
    }
    
    &::placeholder {
      color: #9ca3af;
      font-weight: 400;
    }
  }
  
  .q-field__prepend {
    .q-icon {
      font-size: 1.5rem;
      
      @media (min-width: 768px) {
        font-size: 1.75rem;
      }
      
      @media (min-width: 1024px) {
        font-size: 2rem;
      }
    }
  }
  
  .q-field__append {
    .q-btn {
      width: 40px;
      height: 40px;
      
      @media (min-width: 768px) {
        width: 44px;
        height: 44px;
      }
      
      @media (min-width: 1024px) {
        width: 48px;
        height: 48px;
      }
      
      .q-icon {
        font-size: 1.25rem;
        
        @media (min-width: 768px) {
          font-size: 1.375rem;
        }
        
        @media (min-width: 1024px) {
          font-size: 1.5rem;
        }
      }
    }
  }
}

.quick-filters {
  display: flex;
  gap: 12px;
  padding: 12px 20px 20px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
  
  @media (min-width: 768px) {
    gap: 16px;
    padding: 16px 24px 24px;
  }
  
  @media (min-width: 1024px) {
    gap: 20px;
    padding: 20px 32px 32px;
  }
}

.quick-filter-chip {
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
  padding: 8px 16px;
  border-radius: 12px;
  
  @media (min-width: 768px) {
    font-size: 0.9375rem;
    padding: 10px 18px;
    border-radius: 14px;
  }
  
  @media (min-width: 1024px) {
    font-size: 1rem;
    padding: 12px 20px;
    border-radius: 16px;
  }
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
  }
  
  .q-icon {
    font-size: 1rem;
    
    @media (min-width: 768px) {
      font-size: 1.125rem;
    }
    
    @media (min-width: 1024px) {
      font-size: 1.25rem;
    }
  }
}

.advanced-filters {
  background: white;
  border-radius: 20px;
  margin-top: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(229, 231, 235, 0.6);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  
  @media (min-width: 768px) {
    margin-top: 20px;
    padding: 32px;
  }
  
  @media (min-width: 1024px) {
    margin-top: 24px;
    padding: 40px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    z-index: -1;
  }
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.filter-select,
.filter-input {
  .q-field__control {
    border-radius: 8px;
  }
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-input {
  flex: 1;
}

.range-separator {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.status-options {
  .q-checkbox {
    margin-bottom: 8px;
  }
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 12px;
}

.active-filters-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.clear-filters-btn {
  font-size: 0.8125rem;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
}

.suggestions-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: var(--color-surface-muted);
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--color-surface-subtle);
  }
}

.suggestion-icon {
  color: #6b7280;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
}

.suggestion-text {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.suggestion-category {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.suggestion-action {
  color: #9ca3af;
  flex-shrink: 0;
}

// === TRANSITIONS ===
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: scaleY(0.8) translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// === RESPONSIVE DESIGN ===
@media (max-width: 1024px) {
  .advanced-search {
    max-width: 100%;
    padding: 0 12px;
  }
  
  .search-bar {
    border-radius: 16px;
  }
  
  .advanced-filters {
    border-radius: 16px;
    padding: 24px 20px;
  }
}

@media (max-width: 768px) {
  .advanced-search {
    padding: 0 8px;
  }
  
  .search-bar {
    border-radius: 14px;
  }
  
  .search-input-wrapper {
    padding: 12px 16px;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .filter-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .action-buttons {
    justify-content: stretch;
    
    .q-btn {
      flex: 1;
    }
  }
  
  .quick-filters {
    padding: 10px 16px 16px;
    gap: 8px;
  }
  
  .advanced-filters {
    padding: 20px 16px;
    border-radius: 14px;
  }
  
  .range-inputs {
    flex-direction: column;
    align-items: stretch;
    
    .range-separator {
      text-align: center;
      margin: 4px 0;
    }
  }
}

@media (max-width: 480px) {
  .advanced-search {
    padding: 0 4px;
  }
  
  .search-bar {
    border-radius: 12px;
  }
  
  .search-input-wrapper {
    padding: 10px 12px;
  }
  
  .search-input {
    .q-field__control {
      min-height: 48px;
    }
    
    .q-field__native {
      font-size: 1rem;
    }
    
    .q-field__prepend {
      .q-icon {
        font-size: 1.25rem;
      }
    }
    
    .q-field__append {
      .q-btn {
        width: 36px;
        height: 36px;
        
        .q-icon {
          font-size: 1.125rem;
        }
      }
    }
  }
  
  .quick-filters {
    gap: 6px;
    padding: 8px 12px 12px;
  }
  
  .quick-filter-chip {
    font-size: 0.8125rem;
    padding: 6px 12px;
    border-radius: 10px;
    
    .q-icon {
      font-size: 0.875rem;
    }
  }
  
  .advanced-filters {
    border-radius: 12px;
  }
}

// Dark mode removed - manual theme control only
</style>
