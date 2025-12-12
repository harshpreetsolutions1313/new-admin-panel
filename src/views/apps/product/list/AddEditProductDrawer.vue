<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { requiredValidator } from '@validators'

const props = defineProps({
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
  product: {
    type: Object,
    default: null,
  },
  mode: {
    type: String,
    default: 'add', // add | edit
  },
})

const emit = defineEmits([
  'update:isDrawerOpen',
  'save',
])

const isFormValid = ref(false)
const refForm = ref()
const name = ref('')
const description = ref('')
const price = ref(null)
const images = ref('')
const stock = ref(null)
const category = ref('')
const variants = ref('')

watch(() => props.isDrawerOpen, val => {
  if (val && props.product) {
    name.value = props.product.name || ''
    description.value = props.product.description || ''
    price.value = props.product.price ?? null
    images.value = Array.isArray(props.product.images) ? props.product.images.join(', ') : ''
    stock.value = props.product.stock ?? null
    category.value = props.product.category || ''
    variants.value = Array.isArray(props.product.variants) ? props.product.variants.join(', ') : ''
  }
  if (val && !props.product) {
    resetForm()
  }
})

const resetForm = () => {
  name.value = ''
  description.value = ''
  price.value = null
  images.value = ''
  stock.value = null
  category.value = ''
  variants.value = ''
  nextTick(() => {
    refForm.value?.resetValidation()
  })
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
  nextTick(resetForm)
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (!valid) return

    const payload = {
      name: name.value,
      description: description.value,
      price: Number(price.value),
      images: images.value ? images.value.split(',').map(img => img.trim()).filter(Boolean) : [],
      stock: Number(stock.value),
      category: category.value,
      variants: variants.value ? variants.value.split(',').map(v => v.trim()).filter(Boolean) : [],
    }

    emit('save', payload)
    emit('update:isDrawerOpen', false)
    nextTick(resetForm)
  })
}

const handleDrawerModelValueUpdate = val => {
  emit('update:isDrawerOpen', val)
}
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="420"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <AppDrawerHeaderSection
      :title="mode === 'add' ? 'Add Product' : 'Edit Product'"
      @cancel="closeDrawer"
    />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="name"
                  :rules="[requiredValidator]"
                  label="Name"
                  placeholder="Product name"
                />
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="description"
                  :rules="[requiredValidator]"
                  label="Description"
                  placeholder="Short product description"
                  rows="3"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="price"
                  type="number"
                  :rules="[requiredValidator]"
                  label="Price"
                  placeholder="0.00"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="stock"
                  type="number"
                  :rules="[requiredValidator]"
                  label="Stock"
                  placeholder="10"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="category"
                  :rules="[requiredValidator]"
                  label="Category"
                  placeholder="Stationery"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="images"
                  label="Image URLs (comma separated)"
                  placeholder="https://example.com/a.jpg, https://example.com/b.png"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="variants"
                  label="Variants (comma separated)"
                  placeholder="size S, size M"
                />
              </VCol>

              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  {{ mode === 'add' ? 'Add' : 'Save changes' }}
                </VBtn>
                <VBtn
                  type="reset"
                  variant="outlined"
                  color="secondary"
                  @click="closeDrawer"
                >
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

