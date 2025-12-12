<script setup>
import AddEditProductDrawer from '@/views/apps/product/list/AddEditProductDrawer.vue'
import { useProductStore } from '@/views/apps/product/useProductStore'

const productStore = useProductStore()

const searchQuery = ref('')
const products = ref([])
const isDrawerOpen = ref(false)
const drawerMode = ref('add')
const selectedProduct = ref(null)
const isLoading = ref(false)

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Category', key: 'category' },
  { title: 'Price', key: 'price' },
  { title: 'Stock', key: 'stock' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const fetchProducts = () => {
  isLoading.value = true
  productStore.fetchProducts()
    .then(res => {
      products.value = Array.isArray(res.data) ? res.data : res.data?.products || []
    })
    .catch(err => {
      console.error('Unable to load products', err)
    })
    .finally(() => {
      isLoading.value = false
    })
}

onMounted(fetchProducts)

const filteredProducts = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return products.value
  return products.value.filter(p =>
    p.name?.toLowerCase().includes(query)
    || p.category?.toLowerCase().includes(query)
    || String(p.price ?? '').includes(query),
  )
})

const openAddDrawer = () => {
  drawerMode.value = 'add'
  selectedProduct.value = null
  isDrawerOpen.value = true
}

const openEditDrawer = product => {
  drawerMode.value = 'edit'
  selectedProduct.value = product
  isDrawerOpen.value = true
}

const saveProduct = payload => {
  if (drawerMode.value === 'edit' && selectedProduct.value?.id) {
    productStore.updateProduct(selectedProduct.value.id, payload).then(fetchProducts)
  }
  else {
    productStore.createProduct(payload).then(fetchProducts)
  }
}

const deleteProduct = id => {
  productStore.deleteProduct(id).then(fetchProducts)
}
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardText class="d-flex justify-space-between flex-wrap gap-4">
        <VTextField
          v-model="searchQuery"
          placeholder="Search product"
          density="compact"
          style="min-inline-size: 12rem;"
        />

        <VBtn @click="openAddDrawer">
          Add Product
        </VBtn>
      </VCardText>
    </VCard>

    <VCard>
      <VDataTable
        :headers="headers"
        :items="filteredProducts"
        :loading="isLoading"
        item-key="id"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center gap-x-3">
            <VAvatar
              size="38"
              variant="tonal"
              color="primary"
            >
              <VImg
                v-if="item.raw.images?.length"
                :src="item.raw.images[0]"
                cover
              />
              <span v-else>{{ item.raw.name?.slice(0, 2)?.toUpperCase() }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <RouterLink :to="{ name: 'apps-product-view-id', params: { id: item.raw.id } }" class="font-weight-medium">
                {{ item.raw.name }}
              </RouterLink>
              <span class="text-xs text-medium-emphasis">{{ item.raw.description }}</span>
            </div>
          </div>
        </template>

        <template #item.price="{ item }">
          <span class="text-high-emphasis">${{ Number(item.raw.price).toFixed(2) }}</span>
        </template>

        <template #item.stock="{ item }">
          <VChip
            :color="item.raw.stock > 0 ? 'success' : 'error'"
            size="small"
          >
            {{ item.raw.stock }} in stock
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            icon
            variant="text"
            size="small"
            color="medium-emphasis"
          >
            <VIcon
              size="24"
              icon="mdi-dots-vertical"
            />

            <VMenu activator="parent">
              <VList>
                <VListItem :to="{ name: 'apps-product-view-id', params: { id: item.raw.id } }">
                  <template #prepend>
                    <VIcon icon="mdi-eye-outline" />
                  </template>
                  <VListItemTitle>View</VListItemTitle>
                </VListItem>
                <VListItem @click="openEditDrawer(item.raw)">
                  <template #prepend>
                    <VIcon icon="mdi-pencil-outline" />
                  </template>
                  <VListItemTitle>Edit</VListItemTitle>
                </VListItem>
                <VListItem @click="deleteProduct(item.raw.id)">
                  <template #prepend>
                    <VIcon icon="mdi-delete-outline" />
                  </template>
                  <VListItemTitle>Delete</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VBtn>
        </template>
      </VDataTable>
    </VCard>

    <AddEditProductDrawer
      v-model:isDrawerOpen="isDrawerOpen"
      :product="selectedProduct"
      :mode="drawerMode"
      @save="saveProduct"
    />
  </section>
</template>

