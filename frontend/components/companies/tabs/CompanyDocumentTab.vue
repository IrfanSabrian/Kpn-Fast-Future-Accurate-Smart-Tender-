<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- Left Column: Data List -->
    <div class="lg:col-span-7 space-y-4">
      <!-- Empty State -->
      <div
        v-if="!items || items.length === 0"
        class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6"
      >
        <!-- Header -->
        <div
          class="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 opacity-50"
              :class="iconBgClass"
            >
              <i :class="icon"></i>
            </div>
            <div>
              <div
                class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
              >
                {{ titleLabel }}
              </div>
              <h4
                class="font-bold text-slate-400 dark:text-slate-500 text-lg leading-none mt-1"
              >
                -
              </h4>
            </div>
          </div>
        </div>

        <!-- Fields with placeholder values -->
        <div class="space-y-0.5 mt-4">
          <div
            v-for="(field, index) in fields"
            :key="index"
            class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
          >
            <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">
              {{ field.label }}
            </div>
            <div
              class="text-xs font-medium text-slate-400 dark:text-slate-500 break-word"
            >
              -
            </div>
          </div>
        </div>
      </div>

      <!-- Item List -->
      <div v-else class="space-y-3">
        <div
          v-for="item in items"
          :key="item[idKey]"
          @click="$emit('select-item', item)"
          class="bg-white dark:bg-slate-800 rounded-xl border-2 p-6 transition-all group"
          :class="[
            selectedId === item[idKey] && !singleMode
              ? 'border-blue-500 ring-2 ring-blue-500/20'
              : 'border-slate-200 dark:border-slate-700',
            !singleMode
              ? 'hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md cursor-pointer'
              : 'cursor-default',
          ]"
        >
          <!-- Header -->
          <div
            class="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                :class="iconBgClass"
              >
                <i :class="icon"></i>
              </div>
              <div>
                <div
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  {{ titleLabel }}
                </div>
                <h4
                  class="font-bold text-slate-800 dark:text-white text-lg leading-none mt-1"
                >
                  {{ item[titleKey] }}
                </h4>
              </div>
            </div>

            <!-- Edit Button -->
            <button
              v-if="
                !isEditing &&
                (singleMode || selectedId === item[idKey]) &&
                selectedUrl
              "
              @click.stop="startEditing(item)"
              class="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 dark:border-blue-800"
            >
              <i class="fas fa-edit mr-1"></i> Edit Data
            </button>
          </div>

          <!-- Fields Container (Standard Behavior - Scroll only on Edit) -->
          <div
            class="mt-4 space-y-0.5"
            :class="{
              'max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar':
                isEditing && editingId === item[idKey],
            }"
          >
            <div
              v-for="(field, index) in fields"
              :key="index"
              class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-100 dark:border-slate-700 items-center"
            >
              <div
                class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
              >
                {{ field.label }}
              </div>

              <!-- View Mode -->
              <div
                v-if="!isEditing || editingId !== item[idKey]"
                class="text-xs font-medium text-slate-700 dark:text-slate-200 break-word"
              >
                {{
                  field.format
                    ? field.format(item[field.key])
                    : item[field.key] || "-"
                }}
              </div>

              <!-- Edit Mode -->
              <div v-else class="flex gap-2 items-start">
                <div class="flex-1 min-w-0">
                  <input
                    v-if="
                      !field.type ||
                      field.type === 'text' ||
                      field.type === 'date' ||
                      field.type === 'number'
                    "
                    v-model="editFormData[field.key]"
                    :type="field.type || 'text'"
                    :placeholder="field.label"
                    :disabled="validatedFields[field.key]"
                    class="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-white disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
                    :class="{
                      'border-green-500 ring-1 ring-green-500/20':
                        validatedFields[field.key],
                    }"
                  />
                  <textarea
                    v-else-if="field.type === 'textarea'"
                    v-model="editFormData[field.key]"
                    rows="2"
                    :placeholder="field.label"
                    :disabled="validatedFields[field.key]"
                    class="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-white resize-none disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
                    :class="{
                      'border-green-500 ring-1 ring-green-500/20':
                        validatedFields[field.key],
                    }"
                  ></textarea>
                  <select
                    v-else-if="field.type === 'select'"
                    v-model="editFormData[field.key]"
                    :disabled="validatedFields[field.key]"
                    class="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-white disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
                    :class="{
                      'border-green-500 ring-1 ring-green-500/20':
                        validatedFields[field.key],
                    }"
                  >
                    <option value="" disabled>Pilih {{ field.label }}</option>
                    <option
                      v-for="opt in field.options"
                      :key="opt"
                      :value="opt"
                    >
                      {{ opt }}
                    </option>
                  </select>
                </div>

                <!-- Validation Toggle Button -->
                <button
                  @click.stop="toggleValidation(field.key)"
                  type="button"
                  class="w-6 h-6 flex items-center justify-center rounded transition-all shrink-0"
                  :class="[
                    validatedFields[field.key]
                      ? 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-500 hover:text-blue-500',
                  ]"
                  :title="
                    validatedFields[field.key]
                      ? 'Batalkan validasi (Edit kembali)'
                      : 'Validasi data ini (Kunci)'
                  "
                >
                  <i class="fas fa-check text-[10px]"></i>
                </button>
              </div>
            </div>
            <!-- Edit Footer Actions -->
            <div
              v-if="isEditing && editingId === item[idKey]"
              class="sticky bottom-0 z-10 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 py-3 mt-2 flex justify-between items-center gap-2"
            >
              <button
                @click.stop="triggerAiScan"
                class="px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-500 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                title="Scan data dari dokumen PDF dengan AI"
              >
                <i class="fas fa-magic"></i> Scan AI
              </button>

              <div class="flex items-center gap-2">
                <!-- Warning -->
                <span
                  v-if="!isAllValidated"
                  class="text-[9px] text-orange-500 font-bold animate-pulse"
                >
                  <i class="fas fa-exclamation-circle mr-1"></i>
                  Ceklis semua data!
                </span>

                <!-- Validate All Button -->
                <button
                  @click.stop="validateAll"
                  class="px-2 py-1 text-[10px] font-bold rounded transition-all flex items-center gap-1"
                  :class="[
                    isAllValidated
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
                  ]"
                  title="Validasi semua kolom sekaligus"
                >
                  <i
                    class="fas"
                    :class="isAllValidated ? 'fa-check' : 'fa-check-double'"
                  ></i>
                  {{ isAllValidated ? "Verified" : "All" }}
                </button>

                <button
                  @click.stop="cancelEditing"
                  class="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  @click.stop="saveEditing"
                  :disabled="!isAllValidated"
                  class="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400"
                  :title="
                    !isAllValidated
                      ? 'Validasi semua kolom terlebih dahulu'
                      : 'Simpan Perubahan'
                  "
                >
                  <i class="fas fa-save"></i> Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Extra Content Slot (e.g. KBLI) -->
      <slot
        name="sidebar-extra"
        :is-editing="isEditing"
        :local-data="editFormData"
      />
    </div>

    <!-- Right Column: Document Preview -->
    <div class="lg:col-span-5 flex flex-col h-full">
      <DocumentPdfPreview
        :document-type="documentType"
        :label="label"
        :icon="icon"
        :icon-color="color"
        :existing-pdf-url="selectedUrl"
        :pending-file="pendingFile"
        :pending-preview="pendingPreview"
        :is-uploading="isUploading"
        @file-selected="$emit('upload-select', $event)"
        @save="$emit('upload-save')"
        @cancel="$emit('upload-cancel')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import DocumentPdfPreview from "~/components/DocumentPdfPreview.vue";

const props = defineProps({
  items: Array,
  documentType: String,
  label: String,
  idKey: { type: String, default: "id" },
  titleKey: String,
  titleLabel: String,
  fields: Array, // [{ label: 'Nomor', key: 'nomor_akta' }]
  icon: String,
  color: { type: String, default: "orange" },
  selectedItem: Object,
  selectedUrl: String,
  pendingFile: Object,
  pendingPreview: String,
  isUploading: Boolean,
  singleMode: Boolean,
});

const emit = defineEmits([
  "select-item",
  "upload-select",
  "upload-save",
  "upload-cancel",
  "update-item",
  "ai-scan",
]);

const isEditing = ref(false);
const editingId = ref(null);
const editFormData = ref({});
const validatedFields = ref({});

const startEditing = (item) => {
  isEditing.value = true;
  editingId.value = item[props.idKey];
  // Clone data for editing
  editFormData.value = { ...item };

  // Initialize all fields as NOT validated (unchecked)
  const validation = {};
  if (props.fields) {
    props.fields.forEach((f) => {
      validation[f.key] = false;
    });
  }
  validatedFields.value = validation;
};

const cancelEditing = () => {
  isEditing.value = false;
  editingId.value = null;
  editFormData.value = {};
  validatedFields.value = {};
};

const saveEditing = () => {
  // Only save if all fields validated
  if (!isAllValidated.value) {
    return;
  }
  emit("update-item", { ...editFormData.value }); // Send clean object
  cancelEditing();
};

const triggerAiScan = () => {
  emit("ai-scan", { ...editFormData.value });
};

const updateEditData = (newData) => {
  // Update form data with AI scan results
  editFormData.value = { ...editFormData.value, ...newData };

  // Reset all validations to force manual review
  const resetValidation = {};
  if (props.fields) {
    props.fields.forEach((f) => {
      resetValidation[f.key] = false;
    });
  }
  validatedFields.value = resetValidation;
};

// Validation functions
const toggleValidation = (key) => {
  validatedFields.value[key] = !validatedFields.value[key];
};

const validateAll = () => {
  const allValidated = {};
  if (props.fields) {
    props.fields.forEach((f) => {
      allValidated[f.key] = true;
    });
  }
  validatedFields.value = allValidated;
};

const isAllValidated = computed(() => {
  if (!props.fields || props.fields.length === 0) return true;
  return props.fields.every((f) => validatedFields.value[f.key] === true);
});

defineExpose({ updateEditData, startEditing, cancelEditing, saveEditing });

const selectedId = computed(() =>
  props.selectedItem ? props.selectedItem[props.idKey] : null,
);

const iconBgClass = computed(() => {
  const colorMap = {
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600",
    cyan: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600",
    teal: "bg-teal-50 dark:bg-teal-900/20 text-teal-600",
    pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-600",
  };
  return colorMap[props.color] || colorMap.orange;
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
