<template>
  <div class="h-full flex flex-col bg-slate-50 dark:bg-slate-900/50">
    <!-- Header -->
    <div
      class="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start"
    >
      <div>
        <h2 class="text-xl font-black text-slate-800 dark:text-white">
          AI Provider
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Kelola API Key untuk memaksimalkan performa.
        </p>
      </div>
      <button
        @click="$emit('close')"
        class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Provider Tabs -->
    <div
      class="flex gap-2 px-6 pt-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-3 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2"
        :class="
          activeTab === tab.id
            ? 'text-slate-800 dark:text-white border-blue-500 bg-slate-50 dark:bg-slate-800'
            : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
        "
      >
        <i :class="tab.icon" class="mr-1.5"></i>
        {{ tab.label }}
      </button>
    </div>

    <!-- Content Area (Scrollable) -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
      <!-- API Key Status & Input -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label
            class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
          >
            API Key {{ activeLabel }}
          </label>
          <div class="flex items-center gap-2">
            <span
              v-if="hasKey(activeTab)"
              class="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1"
            >
              <i class="fas fa-check"></i> Connected
            </span>
            <span
              v-else
              class="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold border border-slate-200"
            >
              Not Connected
            </span>

            <!-- Test Connection Button (Inline) -->
            <button
              v-if="hasKey(activeTab)"
              @click="testConnection"
              :disabled="testing"
              class="text-[10px] px-2 py-0.5 rounded font-bold border transition-all flex items-center gap-1"
              :class="
                testing
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  : 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              "
            >
              <i v-if="testing" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-plug"></i>
              <span>{{ testing ? "Testing..." : "Test" }}</span>
            </button>
          </div>
        </div>

        <div class="relative group">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <i class="fas fa-key text-slate-400 text-xs"></i>
          </div>
          <input
            v-model="inputKeys[activeTab]"
            :type="showKey ? 'text' : 'password'"
            class="w-full pl-9 pr-9 py-2.5 text-sm bg-white dark:bg-slate-950 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white placeholder-slate-400 shadow-sm"
            :class="getValidationClass"
            :placeholder="
              hasKey(activeTab)
                ? '••••••••••••••••••••'
                : 'Paste ' + activePlaceholder
            "
          />
          <button
            @click="showKey = !showKey"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <i
              class="fas text-xs"
              :class="showKey ? 'fa-eye-slash' : 'fa-eye'"
            ></i>
          </button>
        </div>

        <!-- Validation Message -->
        <p
          v-if="validationMessage"
          class="mt-2 text-[10px] flex items-center gap-1.5 font-medium transition-all"
          :class="
            validationMessage.type === 'error'
              ? 'text-red-500'
              : 'text-emerald-500'
          "
        >
          <i
            class="fas"
            :class="
              validationMessage.type === 'error'
                ? 'fa-exclamation-circle'
                : 'fa-check-circle'
            "
          ></i>
          {{ validationMessage.text }}
        </p>

        <!-- Current Key Masked (If exists and input is empty) -->
        <p
          v-if="hasKey(activeTab) && !inputKeys[activeTab]"
          class="mt-2 text-[10px] text-slate-400 font-mono pl-1"
        >
          Current: {{ getMaskedKey(activeTab) }}
        </p>
      </div>

      <!-- Tutorial Card -->
      <div
        class="rounded-xl p-4 border text-xs leading-relaxed relative overflow-hidden"
        :class="tutorialClass"
      >
        <div class="absolute top-0 right-0 p-4 opacity-10">
          <i
            :class="tabs.find((t) => t.id === activeTab).icon"
            class="text-6xl"
          ></i>
        </div>

        <h4 class="font-bold mb-3 flex items-center gap-2 relative z-10">
          <i class="fas fa-info-circle"></i> Cara Mendapatkan Key:
        </h4>

        <ol class="space-y-2 relative z-10 pl-4 list-decimal marker:font-bold">
          <template v-if="activeTab === 'gemini'">
            <li>
              Buka
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                class="underline font-bold hover:text-blue-600"
                >Google AI Studio</a
              >
            </li>
            <li>Login & klik "Create API key"</li>
            <li>Copy key (Format: <code>AIza...</code>)</li>
          </template>
          <template v-else-if="activeTab === 'groq'">
            <li>
              Buka
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                class="underline font-bold hover:text-orange-600"
                >Groq Console</a
              >
            </li>
            <li>Login & "Create API Key"</li>
            <li>Copy key (Format: <code>gsk_...</code>)</li>
          </template>
          <template v-else-if="activeTab === 'mistral'">
            <li>
              Buka
              <a
                href="https://console.mistral.ai/api-keys/"
                target="_blank"
                class="underline font-bold hover:text-indigo-600"
                >Mistral AI Console</a
              >
            </li>
            <li>Login/Sign up & "Create new key"</li>
            <li>Copy key</li>
          </template>
        </ol>
      </div>
    </div>

    <!-- Footer Actions -->
    <div
      class="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
    >
      <button
        @click="saveKey"
        :disabled="!isValidKey || saving"
        class="w-full py-3 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:shadow-none bg-gradient-to-r transform active:scale-95"
        :class="activeButtonClass"
      >
        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
        <i v-else class="fas fa-save"></i>
        <span>{{ saving ? "Menyimpan..." : "Simpan API Key" }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const emit = defineEmits(["close", "saved"]);

const config = useRuntimeConfig();
const apiUrl = config.public.apiBaseUrl || "http://localhost:5000";

const activeTab = ref("groq"); // Default to Groq as it's primary
const saving = ref(false);
const testing = ref(false);
const showKey = ref(false);

const tabs = [
  { id: "groq", label: "Groq (Fast)", icon: "fas fa-bolt" },
  { id: "gemini", label: "Gemini (Smart)", icon: "fas fa-brain" },
  { id: "mistral", label: "Mistral (OCR)", icon: "fas fa-file-alt" },
];

const apiKeys = ref({
  gemini: { exists: false, masked: "" },
  groq: { exists: false, masked: "" },
  mistral: { exists: false, masked: "" },
});

const inputKeys = ref({
  gemini: "",
  groq: "",
  mistral: "",
});

// Computed
const activeLabel = computed(
  () => tabs.find((t) => t.id === activeTab.value)?.label,
);

const activePlaceholder = computed(() => {
  switch (activeTab.value) {
    case "gemini":
      return "AIza...";
    case "groq":
      return "gsk_...";
    case "mistral":
      return "Key...";

    default:
      return "API Key";
  }
});

const activeButtonClass = computed(() => {
  switch (activeTab.value) {
    case "gemini":
      return "from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20";
    case "groq":
      return "from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-500/20";
    case "mistral":
      return "from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-500/20";

    default:
      return "bg-slate-600";
  }
});

const tutorialClass = computed(() => {
  switch (activeTab.value) {
    case "gemini":
      return "bg-blue-50 text-blue-900 border-blue-100 dark:bg-blue-900/10 dark:text-blue-200 dark:border-blue-900/20";
    case "groq":
      return "bg-orange-50 text-orange-900 border-orange-100 dark:bg-orange-900/10 dark:text-orange-200 dark:border-orange-900/20";
    case "mistral":
      return "bg-indigo-50 text-indigo-900 border-indigo-100 dark:bg-indigo-900/10 dark:text-indigo-200 dark:border-indigo-900/20";

    default:
      return "bg-slate-50";
  }
});

// Validation
const validateKey = (provider, key) => {
  if (!key) return { valid: false }; // Empty is handled by button disabled state
  if (key.length < 10) return { valid: false, message: "Terlalu pendek" };

  switch (provider) {
    case "gemini":
      if (!key.startsWith("AIza"))
        return { valid: false, message: "Harus dimulai 'AIza'" };
      break;
    case "groq":
      if (!key.startsWith("gsk_"))
        return { valid: false, message: "Harus dimulai 'gsk_'" };
      break;
    case "mistral":
      // Mistral keys don't seem to have a fixed prefix, just check length
      if (key.length < 20)
        return {
          valid: false,
          message: "Kunci terlihat tidak valid (terlalu pendek)",
        };
      break;
  }
  return { valid: true, message: "Format valid" };
};

const validationMessage = computed(() => {
  const key = inputKeys.value[activeTab.value];
  if (!key) return null;
  const result = validateKey(activeTab.value, key);
  return result.message
    ? { type: result.valid ? "success" : "error", text: result.message }
    : null;
});

const isValidKey = computed(() => {
  const key = inputKeys.value[activeTab.value];
  if (!key) return false;
  return validateKey(activeTab.value, key).valid;
});

const getValidationClass = computed(() => {
  const key = inputKeys.value[activeTab.value];
  if (!key)
    return "border-slate-200 dark:border-slate-800 focus:border-blue-500";
  return validateKey(activeTab.value, key).valid
    ? "border-emerald-500 focus:border-emerald-500 ring-emerald-500/20 text-emerald-600"
    : "border-red-500 focus:border-red-500 ring-red-500/20 text-red-600";
});

// Helpers
const hasKey = (provider) => apiKeys.value[provider]?.exists;
const getMaskedKey = (provider) => apiKeys.value[provider]?.masked;

// Data Operations
const fetchData = async () => {
  try {
    const response = await fetch(`${apiUrl}/settings/ai-keys`);
    if (response.ok) {
      const data = await response.json();
      if (data.keys) apiKeys.value = data.keys;
    }
  } catch (error) {
    console.error("Error fetching keys:", error);
  }
};

const saveKey = async () => {
  const provider = activeTab.value;
  const keyToSave = inputKeys.value[provider];
  if (!keyToSave) return;

  saving.value = true;
  try {
    const response = await fetch(`${apiUrl}/settings/ai-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, apiKey: keyToSave }),
    });

    if (response.ok) {
      inputKeys.value[provider] = "";
      await fetchData();
      emit("saved", { provider, success: true });
    } else {
      throw new Error("Gagal menyimpan");
    }
  } catch (error) {
    emit("saved", { provider, success: false, error: error.message });
  } finally {
    saving.value = false;
  }
};

const testConnection = async () => {
  const provider = activeTab.value;

  // Emit testing start event (loading toast)
  emit("saved", {
    provider,
    success: null,
    message: `🔄 Testing ${provider.toUpperCase()} API connection...`,
    isLoading: true,
  });

  testing.value = true;
  try {
    const response = await fetch(`${apiUrl}/settings/test-ai-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });

    const result = await response.json();

    if (result.success) {
      emit("saved", {
        provider,
        success: true,
        message: `✅ ${provider.toUpperCase()} API key is valid and working perfectly!`,
      });
    } else {
      // Failed with detailed error
      const errorDetail = result.error || "Unknown error occurred";
      emit("saved", {
        provider,
        success: false,
        error: `❌ Test failed: ${errorDetail}`,
      });
    }
  } catch (error) {
    // Network or parsing error
    let errorMsg = "Network request failed";
    if (error.message) {
      errorMsg = error.message;
    }

    emit("saved", {
      provider,
      success: false,
      error: `❌ Connection error: ${errorMsg}`,
    });
  } finally {
    testing.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.3);
  border-radius: 20px;
}
</style>
