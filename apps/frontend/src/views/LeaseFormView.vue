<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-2 sm:px-4">
      <div class="bg-white dark:bg-gray-800 p-4 md:p-6 lg:p-8 rounded-lg shadow-lg dark:border dark:border-gray-700">
        <!-- Back Button -->
        <button
          type="button"
          @click="handleCancel"
          class="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2 mb-4 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Property
        </button>

        <h1 class="text-3xl font-heading font-bold mb-6 text-gray-800 dark:text-gray-100">
          {{ isEditMode ? 'Edit Lease' : 'Add Lease' }}
        </h1>

        <!-- Loading State -->
        <div v-if="fetchLoading" class="flex justify-center items-center py-12">
          <div class="text-gray-600 dark:text-gray-400">Loading lease data...</div>
        </div>

        <!-- Fetch Error State -->
        <div v-else-if="fetchError" class="mb-6 p-4 bg-primary-100 dark:bg-primary-900/30 text-primary-500 dark:text-primary-300 rounded dark:border dark:border-primary-700">
          {{ fetchError }}
        </div>

        <!-- Property Info Card (Edit Mode Only) -->
        <div v-else-if="isEditMode && property" class="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Property</h3>
          <p class="text-lg font-medium text-gray-800 dark:text-gray-100">
            {{ property.nickname || fullAddress }}
          </p>
          <p v-if="property.nickname" class="text-sm text-gray-600 dark:text-gray-400">{{ fullAddress }}</p>
        </div>

        <form v-if="!fetchLoading && !fetchError" @submit="onSubmit">
          <!-- Two-column layout: Lessee (left) and Lease Details (right) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 mb-6">
            <!-- LEFT COLUMN: Lessee Section (Create Mode) / Existing Lessees (Edit Mode) -->
            <div v-if="!isEditMode">
              <h2 class="text-xl font-heading font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Lessees <span class="text-primary-400 dark:text-primary-300">*</span>
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Add one or more lessees to the lease.
              </p>

              <div v-for="(field, index) in lesseeFields" :key="field.key">
                <LesseeFormGroup
                  :index="index"
                  :show-remove="lesseeFields.length > 1"
                  @remove="handleRemoveLessee"
                />
              </div>

              <button
                type="button"
                @click="handleAddLessee"
                class="mt-2 text-secondary-2-500 hover:text-secondary-2-700 dark:text-secondary-2-400 dark:hover:text-secondary-2-300 font-medium flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-2-300 rounded p-1"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add Lessee
              </button>

              <!-- OCCUPANTS SECTION (CREATE MODE) -->
              <div class="mt-8">
                <h2 class="text-xl font-heading font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Occupants (Optional)
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add occupants living at the property (adults or children).
                </p>

                <div v-for="(field, index) in occupantFields" :key="field.key">
                  <OccupantFormGroup
                    :index="index"
                    :show-remove="true"
                    @remove="handleRemoveOccupant"
                  />
                </div>

                <button
                  type="button"
                  @click="handleAddOccupant"
                  class="mt-2 text-secondary-2-500 hover:text-secondary-2-700 dark:text-secondary-2-400 dark:hover:text-secondary-2-300 font-medium flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-2-300 rounded p-1"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Add Occupant
                </button>
              </div>
            </div>

            <!-- LEFT COLUMN: Existing Lessees (Edit Mode Only) -->
            <div v-else-if="currentLease && currentLease.lessees && currentLease.lessees.length > 0">
              <h2 class="text-xl font-heading font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Lessees
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Existing lessees on this lease (read-only). Adding or removing lessees will void this lease and create a new one.
              </p>
              <div class="space-y-3">
                <div v-for="lessee in currentLease.lessees" :key="lessee.id" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <p class="font-medium text-gray-800 dark:text-gray-100">
                        {{ lessee.person.firstName }} {{ lessee.person.lastName }}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ lessee.person.email }}</p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ lessee.person.phone }}</p>
                      <p v-if="lessee.signedDate" class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Signed: {{ formatDate(lessee.signedDate) }}
                      </p>
                    </div>
                    <button
                      v-if="currentLease.lessees.length > 1"
                      type="button"
                      @click="openRemoveLesseeModal(lessee.person.id, `${lessee.person.firstName} ${lessee.person.lastName}`)"
                      class="text-primary-400 hover:text-primary-500 dark:text-primary-300 dark:hover:text-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 rounded p-1"
                      :aria-label="`Remove ${lessee.person.firstName} ${lessee.person.lastName}`"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <span
                      v-else
                      class="text-gray-400 dark:text-gray-500 text-xs italic"
                      title="Cannot remove the only lessee"
                    >
                      Only lessee
                    </span>
                  </div>
                </div>
              </div>

              <!-- Add Lessee Button -->
              <button
                type="button"
                @click="openAddLesseeModal"
                class="mt-4 text-secondary-2-500 hover:text-secondary-2-700 dark:text-secondary-2-400 dark:hover:text-secondary-2-300 font-medium flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-2-300 rounded p-1"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add Lessee
              </button>

              <!-- EDIT MODE: Existing Occupants -->
              <div class="mt-8">
                <OccupantList
                  :occupants="currentLease.occupants || []"
                  @add="openAddOccupantModal"
                  @remove="openRemoveOccupantModal"
                />
              </div>

              <!-- EDIT MODE: Pets -->
              <div class="mt-8">
                <PetList
                  :pets="currentLease.pets || []"
                  @add="openAddPetModal"
                  @remove="openRemovePetModal"
                />
              </div>
            </div>

            <!-- RIGHT COLUMN: Lease Details Section -->
            <div>
              <h2 class="text-xl font-heading font-semibold mb-2 text-gray-700 dark:text-gray-300">Lease Details</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter the lease term and financial information. Leave end date blank for month-to-month leases.
              </p>

              <div class="space-y-4">
                <FormInput
                  name="startDate"
                  label="Start Date"
                  type="date"
                  :required="true"
                />

                <FormInput
                  v-if="!isMonthToMonth"
                  name="endDate"
                  label="End Date (Optional)"
                  type="date"
                />

                <div>
                  <label for="monthlyRent" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                    Monthly Rent (Optional)
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
                    <input
                      id="monthlyRent"
                      name="monthlyRent"
                      type="number"
                      step="0.01"
                      :value="values.monthlyRent"
                      @input="handleMoneyInput('monthlyRent', $event)"
                      placeholder="0.00"
                      class="w-full pl-7 pr-3 py-2 border rounded focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      :class="{
                        'border-gray-300 dark:border-gray-600 focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500': !errors.monthlyRent,
                        'border-primary-400 dark:border-primary-300 focus:border-primary-400 dark:focus:border-primary-300 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-400': errors.monthlyRent,
                      }"
                    />
                  </div>
                  <p v-if="errors.monthlyRent" class="text-primary-400 dark:text-primary-300 text-sm mt-1">{{ errors.monthlyRent }}</p>
                </div>

                <div>
                  <label for="securityDeposit" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                    Security Deposit (Optional)
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
                    <input
                      id="securityDeposit"
                      name="securityDeposit"
                      type="number"
                      step="0.01"
                      :value="values.securityDeposit"
                      @input="handleMoneyInput('securityDeposit', $event)"
                      placeholder="0.00"
                      class="w-full pl-7 pr-3 py-2 border rounded focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      :class="{
                        'border-gray-300 dark:border-gray-600 focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500': !errors.securityDeposit,
                        'border-primary-400 dark:border-primary-300 focus:border-primary-400 dark:focus:border-primary-300 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-400': errors.securityDeposit,
                      }"
                    />
                  </div>
                  <p v-if="errors.securityDeposit" class="text-primary-400 dark:text-primary-300 text-sm mt-1">{{ errors.securityDeposit }}</p>
                </div>

                <div>
                  <label for="petDeposit" class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                    Pet Deposit (Optional)
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
                    <input
                      id="petDeposit"
                      name="petDeposit"
                      type="number"
                      step="0.01"
                      :value="values.petDeposit"
                      @input="handleMoneyInput('petDeposit', $event)"
                      placeholder="0.00"
                      class="w-full pl-7 pr-3 py-2 border rounded focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      :class="{
                        'border-gray-300 dark:border-gray-600 focus:border-complement-300 dark:focus:border-complement-400 focus:ring-2 focus:ring-complement-200 dark:focus:ring-complement-500': !errors.petDeposit,
                        'border-primary-400 dark:border-primary-300 focus:border-primary-400 dark:focus:border-primary-300 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-400': errors.petDeposit,
                      }"
                    />
                  </div>
                  <p v-if="errors.petDeposit" class="text-primary-400 dark:text-primary-300 text-sm mt-1">{{ errors.petDeposit }}</p>
                </div>

                <FormInput
                  name="depositPaidDate"
                  label="Deposit Paid Date (Optional)"
                  type="date"
                />
              </div>
            </div>
          </div>

          <div v-if="submitError" class="mb-4 p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-500 dark:text-primary-300 rounded dark:border dark:border-primary-700">
            {{ submitError }}
          </div>

          <div class="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              :disabled="!meta.valid || isSubmitting"
              class="w-full sm:flex-1 px-6 py-3 bg-complement-300 text-white rounded font-medium hover:bg-complement-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-complement-300 focus:ring-offset-2"
            >
              <svg v-if="!isSubmitting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="isEditMode" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{
                isSubmitting
                  ? (isEditMode ? 'Updating...' : 'Creating...')
                  : (isEditMode ? 'Update Lease' : 'Create Lease')
              }}
            </button>
            <button
              type="button"
              @click="handleCancel"
              class="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Modals for Edit Mode -->
      <AddLesseeModal
        v-if="showAddLesseeModal && currentLease"
        :current-lease="currentLease"
        @confirm="confirmAddLessee"
        @cancel="cancelAddLessee"
      />

      <RemoveLesseeModal
        v-if="showRemoveLesseeModal && currentLease && lesseeToRemove"
        :current-lease="currentLease"
        :lessee-name="lesseeToRemove.name"
        @confirm="confirmRemoveLessee"
        @cancel="cancelRemoveLessee"
      />

      <AddOccupantModal
        v-if="showAddOccupantModal"
        @confirm="confirmAddOccupant"
        @cancel="cancelAddOccupant"
      />

      <ConfirmModal
        v-if="showRemoveOccupantModal && occupantToRemove"
        title="Remove Occupant"
        :message="`Are you sure you want to remove ${occupantToRemove.name} from this lease?`"
        confirm-label="Remove"
        cancel-label="Cancel"
        @confirm="confirmRemoveOccupant"
        @cancel="cancelRemoveOccupant"
      />

      <AddPetModal
        v-if="showAddPetModal"
        @confirm="confirmAddPet"
        @cancel="cancelAddPet"
      />

      <ConfirmModal
        v-if="showRemovePetModal && petToRemove"
        title="Remove Pet"
        :message="`Are you sure you want to remove ${petToRemove.name} from this lease?`"
        confirm-label="Remove"
        cancel-label="Cancel"
        @confirm="confirmRemovePet"
        @cancel="cancelRemovePet"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useForm, useFieldArray } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { createLeaseSchema, updateLeaseSchema, type AddLesseeInput, type AddOccupantInput, type AddPetInput } from '@validators/lease';
import { LeaseStatus } from '@domain/entities';
import { useLeaseStore } from '@/stores/lease';
import { usePropertyStore } from '@/stores/property';
import FormInput from '@/components/FormInput.vue';
import LesseeFormGroup from '@/components/LesseeFormGroup.vue';
import OccupantFormGroup from '@/components/OccupantFormGroup.vue';
import OccupantList from '@/components/OccupantList.vue';
import PetList from '@/components/PetList.vue';
import AddLesseeModal from '@/components/AddLesseeModal.vue';
import AddOccupantModal from '@/components/AddOccupantModal.vue';
import AddPetModal from '@/components/AddPetModal.vue';
import RemoveLesseeModal from '@/components/RemoveLesseeModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { convertFormDates, convertNestedDates, formatDateForInput } from '@/utils/dateHelpers';
import { formatDate } from '@/utils/formatters';
import { extractErrorMessage } from '@/utils/errorHandlers';
import { useMoneyInput } from '@/composables/useMoneyInput';
import { useToast } from 'vue-toastification';

const router = useRouter();
const route = useRoute();
const leaseStore = useLeaseStore();
const propertyStore = usePropertyStore();
const toast = useToast();

// Detect edit mode
const isEditMode = computed(() => !!route.params.leaseId);
const leaseId = computed(() => route.params.leaseId as string);
const propertyId = computed(() => (route.params.propertyId || route.params.id) as string);

// Separate error state for fetching existing lease/property
const fetchLoading = ref(false);
const fetchError = ref('');

// Use different schema based on mode
const validationSchema = computed(() =>
  isEditMode.value ? updateLeaseSchema : createLeaseSchema
);

const { handleSubmit, errors, values, meta, setFieldValue, setValues } = useForm({
  validationSchema: toTypedSchema(validationSchema.value),
  validateOnMount: false,
  initialValues: isEditMode.value ? {} : {
    propertyId: propertyId.value,
    lessees: [{}], // Initialize with one empty lessee
    occupants: [], // Initialize with empty occupants array
  },
});

// Setup useFieldArray for dynamic lessee and occupant management (create mode only)
const { fields: lesseeFields, push: pushLessee, remove: removeLesseeField } = useFieldArray('lessees');
const { fields: occupantFields, push: pushOccupant, remove: removeOccupantField } = useFieldArray('occupants');

// Property and lease data
const property = computed(() => propertyStore.currentProperty);
const currentLease = computed(() => leaseStore.currentLease);

// Computed property for full address
const fullAddress = computed(() => {
  if (!property.value) return '';
  const parts = [property.value.street];
  if (property.value.address2) {
    parts.push(property.value.address2);
  }
  return parts.join(' ');
});

// Check if lease is month-to-month (for hiding endDate)
const isMonthToMonth = computed(() => currentLease.value?.status === LeaseStatus.MONTH_TO_MONTH);

const { createMoneyInputHandler } = useMoneyInput();
const handleMonthlyRentInput = createMoneyInputHandler(setFieldValue as (field: string, value: any) => void, 'monthlyRent');
const handleSecurityDepositInput = createMoneyInputHandler(setFieldValue as (field: string, value: any) => void, 'securityDeposit');
const handlePetDepositInput = createMoneyInputHandler(setFieldValue as (field: string, value: any) => void, 'petDeposit');

const handleMoneyInput = (fieldName: 'monthlyRent' | 'securityDeposit' | 'petDeposit', event: Event) => {
  if (fieldName === 'monthlyRent') {
    handleMonthlyRentInput(event);
  } else if (fieldName === 'securityDeposit') {
    handleSecurityDepositInput(event);
  } else {
    handlePetDepositInput(event);
  }
};

// Submission logic with mode detection
const submitError = ref('');
const isSubmitting = ref(false);

const submit = async (formValues: any) => {
  submitError.value = '';
  isSubmitting.value = true;

  try {
    if (isEditMode.value) {
      const data = convertFormDates(formValues, ['startDate', 'endDate', 'depositPaidDate']);
      await leaseStore.updateLease(leaseId.value, data);
      router.push(`/properties/${propertyId.value}`);
    } else {
      const data = {
        ...convertFormDates(formValues, ['startDate', 'endDate', 'depositPaidDate']),
        lessees: convertNestedDates(formValues.lessees, ['signedDate']),
        occupants: formValues.occupants ? convertNestedDates(formValues.occupants, ['moveInDate']) : [],
      };
      await leaseStore.createLease(data);
      router.push(`/properties/${propertyId.value}`);
    }
  } catch (err: any) {
    const errorMsg = extractErrorMessage(
      err,
      isEditMode.value ? 'Failed to update lease. Please try again.' : 'Failed to create lease. Please try again.'
    );
    submitError.value = errorMsg;
    throw err;
  } finally {
    isSubmitting.value = false;
  }
};

const onSubmit = handleSubmit(submit);

const handleCancel = () => {
  router.push(`/properties/${propertyId.value}`);
};

// CREATE MODE: Lessee management handlers
const handleAddLessee = () => {
  pushLessee({});
  nextTick(() => {
    const newIndex = lesseeFields.value.length - 1;
    const firstInput = document.querySelector(`[name="lessees[${newIndex}].firstName"]`) as HTMLInputElement;
    firstInput?.focus();
  });
};

const handleRemoveLessee = (index: number) => {
  removeLesseeField(index);
};

// EDIT MODE: Modal state and handlers
const showAddLesseeModal = ref(false);
const showRemoveLesseeModal = ref(false);
const lesseeToRemove = ref<{ personId: string; name: string } | null>(null);

const openAddLesseeModal = () => {
  showAddLesseeModal.value = true;
};

const openRemoveLesseeModal = (personId: string, name: string) => {
  lesseeToRemove.value = { personId, name };
  showRemoveLesseeModal.value = true;
};

const confirmAddLessee = async (input: AddLesseeInput) => {
  try {
    await leaseStore.addLesseeToLease(leaseId.value, input);
    showAddLesseeModal.value = false;
    toast.success('Lessee added. A new lease was created.');
    router.push(`/properties/${propertyId.value}`);
  } catch (error) {
    const errorMsg = extractErrorMessage(error, 'Failed to add lessee');
    toast.error(errorMsg);
  }
};

const confirmRemoveLessee = async (input: { voidedReason: string; newLeaseData: any }) => {
  if (!lesseeToRemove.value) return;

  try {
    await leaseStore.removeLesseeFromLease(
      leaseId.value,
      lesseeToRemove.value.personId,
      input
    );
    showRemoveLesseeModal.value = false;
    lesseeToRemove.value = null;
    toast.success('Lessee removed. A new lease was created.');
    router.push(`/properties/${propertyId.value}`);
  } catch (error) {
    const errorMsg = extractErrorMessage(error, 'Failed to remove lessee');
    toast.error(errorMsg);
  }
};

const cancelAddLessee = () => {
  showAddLesseeModal.value = false;
};

const cancelRemoveLessee = () => {
  showRemoveLesseeModal.value = false;
  lesseeToRemove.value = null;
};

// CREATE MODE: Occupant management handlers
const handleAddOccupant = () => {
  pushOccupant({ isAdult: false });
  nextTick(() => {
    const newIndex = occupantFields.value.length - 1;
    const firstInput = document.querySelector(`[name="occupants[${newIndex}].firstName"]`) as HTMLInputElement;
    firstInput?.focus();
  });
};

const handleRemoveOccupant = (index: number) => {
  removeOccupantField(index);
};

// EDIT MODE: Occupant modal state and handlers
const showAddOccupantModal = ref(false);
const showRemoveOccupantModal = ref(false);
const occupantToRemove = ref<{ occupantId: string; name: string } | null>(null);

const openAddOccupantModal = () => {
  showAddOccupantModal.value = true;
};

const openRemoveOccupantModal = (occupantId: string) => {
  const occupant = currentLease.value?.occupants.find(o => o.id === occupantId);
  if (occupant) {
    occupantToRemove.value = {
      occupantId,
      name: `${occupant.person.firstName} ${occupant.person.lastName}`,
    };
    showRemoveOccupantModal.value = true;
  }
};

const confirmAddOccupant = async (input: AddOccupantInput) => {
  try {
    await leaseStore.addOccupantToLease(leaseId.value, input);
    showAddOccupantModal.value = false;
    toast.success('Occupant added successfully');
  } catch (error) {
    const errorMsg = extractErrorMessage(error, 'Failed to add occupant');
    toast.error(errorMsg);
  }
};

const confirmRemoveOccupant = async () => {
  if (!occupantToRemove.value) return;

  try {
    await leaseStore.removeOccupantFromLease(leaseId.value, occupantToRemove.value.occupantId);
    showRemoveOccupantModal.value = false;
    occupantToRemove.value = null;
    toast.success('Occupant removed successfully');
  } catch (error) {
    const errorMsg = extractErrorMessage(error, 'Failed to remove occupant');
    toast.error(errorMsg);
  }
};

const cancelAddOccupant = () => {
  showAddOccupantModal.value = false;
};

const cancelRemoveOccupant = () => {
  showRemoveOccupantModal.value = false;
  occupantToRemove.value = null;
};

// EDIT MODE: Pet modal state and handlers
const showAddPetModal = ref(false);
const showRemovePetModal = ref(false);
const petToRemove = ref<{ petId: string; name: string } | null>(null);

const openAddPetModal = () => {
  showAddPetModal.value = true;
};

const openRemovePetModal = (petId: string) => {
  const pet = currentLease.value?.pets.find(p => p.id === petId);
  if (pet) {
    petToRemove.value = {
      petId,
      name: pet.name,
    };
    showRemovePetModal.value = true;
  }
};

const confirmAddPet = async (input: AddPetInput) => {
  try {
    await leaseStore.addPetToLease(leaseId.value, input);
    showAddPetModal.value = false;
    toast.success('Pet added successfully');
  } catch (error) {
    const errorMsg = extractErrorMessage(error, 'Failed to add pet');
    toast.error(errorMsg);
  }
};

const confirmRemovePet = async () => {
  if (!petToRemove.value) return;

  try {
    await leaseStore.removePetFromLease(leaseId.value, petToRemove.value.petId);
    showRemovePetModal.value = false;
    petToRemove.value = null;
    toast.success('Pet removed successfully');
  } catch (error) {
    const errorMsg = extractErrorMessage(error, 'Failed to remove pet');
    toast.error(errorMsg);
  }
};

const cancelAddPet = () => {
  showAddPetModal.value = false;
};

const cancelRemovePet = () => {
  showRemovePetModal.value = false;
  petToRemove.value = null;
};

// Auto-populate end date when start date is entered (1 year later)
watch(() => values.startDate, (newStartDate) => {
  if (newStartDate && !isEditMode.value) {
    const startDate = typeof newStartDate === 'string' ? new Date(newStartDate) : newStartDate;
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    const formattedEndDate = formatDateForInput(endDate);
    if (formattedEndDate) {
      setFieldValue('endDate', formattedEndDate as any);
    }
  }
});

// Fetch existing lease and property data in edit mode
onMounted(async () => {
  if (isEditMode.value) {
    fetchLoading.value = true;
    fetchError.value = '';

    try {
      // Fetch both lease and property in parallel
      await Promise.all([
        leaseStore.fetchLeaseById(leaseId.value),
        propertyStore.fetchPropertyById(propertyId.value)
      ]);

      const lease = leaseStore.currentLease;
      if (!lease) {
        fetchError.value = 'Lease not found';
        return;
      }

      // Pre-populate form with existing data
      setValues({
        startDate: formatDateForInput(lease.startDate) as any,
        endDate: formatDateForInput(lease.endDate) as any,
        monthlyRent: lease.monthlyRent,
        securityDeposit: lease.securityDeposit,
        petDeposit: lease.petDeposit,
        depositPaidDate: formatDateForInput(lease.depositPaidDate) as any,
      });
    } catch (err: any) {
      fetchError.value = extractErrorMessage(err, 'Failed to load lease. Please try again.');
    } finally {
      fetchLoading.value = false;
    }
  }
});
</script>
