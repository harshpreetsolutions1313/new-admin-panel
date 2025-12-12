<script setup>
import AddEditProductDrawer from '@/views/apps/product/list/AddEditProductDrawer.vue'
import { useProductStore } from '@/views/apps/product/useProductStore'

const productStore = useProductStore()
const route = useRoute()
const router = useRouter()

const product = ref()
const isLoading = ref(false)
const isEditDrawerOpen = ref(false)

const normalizeProduct = data => ({
  ...data,
  id: data?.id ?? data?._id,
  images: Array.isArray(data?.images) ? data.images : [],
  variants: Array.isArray(data?.variants) ? data.variants : [],
})

const loadProduct = () => {
  isLoading.value = true
  productStore.fetchProduct(route.params.id)
    .then(res => {
      console.log(res.data)
      product.value = normalizeProduct(res.data)
      console.log(product.value)
    })
    .catch(err => {
      console.error('Unable to fetch product', err)
    })
    .finally(() => {
      isLoading.value = false
    })
}

onMounted(loadProduct)

const saveProduct = payload => {
  const id = product.value?.id ?? product.value?._id
  if (!id) return
  productStore.updateProduct(id, payload).then(() => {
    isEditDrawerOpen.value = false
    loadProduct()
  })
}

const deleteProduct = () => {
  const id = product.value?.id ?? product.value?._id
  if (!id) return
  productStore.deleteProduct(id).then(() => {
    router.push({ name: 'apps-product-list' })
  })
}
</script>

<template>
  <section>
    <VCard v-if="product" class="mb-6">
      <VCardText class="d-flex align-start gap-6 flex-wrap">
        <VAvatar
          size="120"
          variant="tonal"
          color="primary"
        >
          <VImg
            v-if="product.images?.length"
            :src="product.images[0]"
            cover
          />
          <span v-else class="text-h5 font-weight-medium">{{ product.name?.slice(0, 2)?.toUpperCase() }}</span>
        </VAvatar>

        <div class="flex-grow-1">
          <div class="d-flex align-center justify-space-between flex-wrap gap-4">
            <div>
              <h4 class="text-h5">{{ product.name }}</h4>
              <p class="text-body-2 text-medium-emphasis mb-2">{{ product.category }}</p>
              <VChip
                :color="product.stock > 0 ? 'success' : 'error'"
                size="small"
              >
                {{ product.stock }} in stock
              </VChip>
            </div>

            <div class="d-flex gap-3">
              <VBtn color="primary" @click="isEditDrawerOpen = true">
                Edit
              </VBtn>
              <VBtn
                color="error"
                variant="outlined"
                @click="deleteProduct"
              >
                Delete
              </VBtn>
              <VBtn
                variant="tonal"
                color="secondary"
                :to="{ name: 'apps-product-list' }"
              >
                Back to list
              </VBtn>
            </div>
          </div>

          <div class="d-flex align-center gap-3 mt-4">
            <h5 class="text-h5 font-weight-medium mb-0">${{ Number(product.price).toFixed(2) }}</h5>
          </div>

          <p class="mt-4">{{ product.description }}</p>

          <div class="d-flex flex-wrap gap-3 mt-4">
            <VChip
              v-for="variant in product.variants || []"
              :key="variant"
              variant="tonal"
              color="primary"
              size="small"
            >
              {{ variant }}
            </VChip>
          </div>
        </div>
      </VCardText>
    </VCard>

    <VAlert
      v-else-if="!isLoading"
      type="warning"
    >
      Product not found.
    </VAlert>

    <AddEditProductDrawer
      v-model:isDrawerOpen="isEditDrawerOpen"
      :product="product"
      mode="edit"
      @save="saveProduct"
    />
  </section>
</template>

