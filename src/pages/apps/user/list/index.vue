<script setup>
import { paginationMeta } from '@/@fake-db/utils'
import AddNewUserDrawer from '@/views/apps/user/list/AddNewUserDrawer.vue'
import { useUserListStore } from '@/views/apps/user/useUserListStore'
import { avatarText } from '@core/utils/formatters'
import { VDataTableServer } from 'vuetify/labs/VDataTable'

const userListStore = useUserListStore()

const searchQuery = ref('')
const selectedRole = ref()
const selectedPlan = ref()
const selectedStatus = ref()
const totalPage = ref(1)
const totalUsers = ref(0)
const users = ref([])

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  groupBy: [],
  search: undefined,
})

// Updated headers to match the actual data returned by your API
const headers = [
  { title: 'User', key: 'user' },
  { title: 'Email', key: 'email' },
  { title: 'Cart Items', key: 'cartCount' },
  { title: 'Wishlist Items', key: 'wishlistCount' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Fetching users – correctly handles the new API response format
const fetchUsers = () => {
  userListStore
    .fetchUsers({
      q: searchQuery.value,
      status: selectedStatus.value,
      plan: selectedPlan.value,
      role: selectedRole.value,
      options: options.value,
    })
    .then(response => {
      const res = response.data

      console.log("here is the users response", res)

      // New API format: { success: true, count: X, data: [...] }
      if (res.success && Array.isArray(res.data)) {
        users.value = res.data
        totalUsers.value = res.count || res.data.length
        totalPage.value = Math.ceil((res.count || res.data.length) / options.value.itemsPerPage)
      } else {
        console.warn('Invalid or empty response:', res)
        users.value = []
        totalUsers.value = 0
        totalPage.value = 1
      }
    })
    .catch(error => {
      console.error('Error fetching users:', error)
      users.value = []
      totalUsers.value = 0
      totalPage.value = 1
    })
}

// Trigger fetch whenever filters, search or pagination options change
watchEffect(fetchUsers)

// No longer needed since role/plan/status don't exist in current data
// const roles = [...]
// const plans = [...]
// const status = [...]

const isAddNewUserDrawerVisible = ref(false)

// Add user – refetch list after success
const addNewUser = userData => {
  userListStore.addUser(userData).then(() => {
    options.value.page = 1
    fetchUsers()
  })
}

// Delete user – refetch list after success
const deleteUser = id => {
  userListStore.deleteUser(id).then(() => {
    fetchUsers()
  })
}
</script>

<template>
  <section>
    <!-- Removed the Search Filters card because role/plan/status filters are not applicable yet -->
    <!-- You can re-add it later when those fields exist in the API -->

    <VCard>
      <VCardText class="d-flex justify-space-between flex-wrap gap-4">
        <!-- Export button -->
        <VBtn
          variant="outlined"
          color="secondary"
          prepend-icon="mdi-tray-arrow-up"
        >
          Export
        </VBtn>

        <div class="app-user-search-filter d-flex flex-wrap align-center gap-x-6 gap-y-4">
          <!-- Search -->
          <VTextField
            v-model="searchQuery"
            placeholder="Search User"
            density="compact"
            style="min-inline-size: 10rem;"
            class="order-2 order-sm-1"
          />

          <!-- Add user button -->
          <VBtn
            class="order-sm-2 order-1"
            @click="isAddNewUserDrawerVisible = true"
          >
            Add User
          </VBtn>
        </div>
      </VCardText>

      <!-- Data table -->
      <VDataTableServer
        v-model:items-per-page="options.itemsPerPage"
        v-model:page="options.page"
        :items="users"
        :items-length="totalUsers"
        :headers="headers"
        show-select
        class="text-no-wrap rounded-0"
        @update:options="options = $event"
      >
        <!-- User column -->
        <template #item.user="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              size="34"
              color="primary"
              variant="tonal"
              class="me-3"
            >
              <span class="text-sm font-weight-medium">
                {{ avatarText(item.raw.name || '') }}
              </span>
            </VAvatar>

            <div class="d-flex flex-column">
              <h6 class="text-sm">
                <RouterLink
                  :to="{ name: 'apps-user-view-id', params: { id: item.raw._id } }"
                  class="font-weight-medium user-list-name"
                >
                  {{ item.raw.name || 'Unnamed User' }}
                </RouterLink>
              </h6>
              <span class="text-xs text-medium-emphasis">{{ item.raw.email }}</span>
            </div>
          </div>
        </template>

        <!-- Email column (optional – you can remove if you prefer showing it only in User column) -->
        <template #item.email="{ item }">
          <span class="text-sm">{{ item.raw.email }}</span>
        </template>

        <!-- Cart Items Count -->
        <template #item.cartCount="{ item }">
          <span class="text-sm font-weight-medium">
            {{ item.raw.cart?.length || 0 }}
          </span>
        </template>

        <!-- Wishlist Items Count -->
        <template #item.wishlistCount="{ item }">
          <span class="text-sm font-weight-medium">
            {{ item.raw.wishlist?.length || 0 }}
          </span>
        </template>

        <!-- Actions -->
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
                <VListItem :to="{ name: 'apps-user-view-id', params: { id: item.raw._id } }">
                  <template #prepend>
                    <VIcon icon="mdi-eye-outline" />
                  </template>
                  <VListItemTitle>View</VListItemTitle>
                </VListItem>

                <VListItem link>
                  <template #prepend>
                    <VIcon icon="mdi-pencil-outline" />
                  </template>
                  <VListItemTitle>Edit</VListItemTitle>
                </VListItem>

                <VListItem @click="deleteUser(item.raw._id)">
                  <template #prepend>
                    <VIcon icon="mdi-delete-outline" />
                  </template>
                  <VListItemTitle>Delete</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VBtn>
        </template>

        <!-- Pagination -->
        <template #bottom>
          <VDivider />
          <div class="d-flex gap-x-6 flex-wrap justify-end pa-2">
            <div class="d-flex align-center gap-x-2 text-sm">
              Rows Per Page:
              <VSelect
                v-model="options.itemsPerPage"
                variant="plain"
                class="per-page-select text-high-emphasis"
                density="compact"
                :items="[10, 20, 25, 50, 100]"
              />
            </div>

            <div class="d-flex text-sm align-center text-high-emphasis">
              {{ paginationMeta(options, totalUsers) }}
            </div>

            <div class="d-flex gap-x-2 align-center">
              <VBtn
                icon="mdi-chevron-left"
                variant="text"
                density="comfortable"
                color="default"
                :disabled="options.page <= 1"
                @click="options.page <= 1 ? options.page = 1 : options.page--"
              />

              <VBtn
                icon="mdi-chevron-right"
                variant="text"
                density="comfortable"
                color="default"
                :disabled="options.page >= Math.ceil(totalUsers / options.itemsPerPage)"
                @click="options.page >= Math.ceil(totalUsers / options.itemsPerPage) ? options.page = Math.ceil(totalUsers / options.itemsPerPage) : options.page++"
              />
            </div>
          </div>
        </template>
      </VDataTableServer>
    </VCard>

    <!-- Add New User Drawer -->
    <AddNewUserDrawer
      v-model:isDrawerOpen="isAddNewUserDrawerVisible"
      @user-data="addNewUser"
    />
  </section>
</template>

<style lang="scss">
.app-user-search-filter {
  inline-size: 24.0625rem;
}

.user-list-name:not(:hover) {
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
}
</style>
