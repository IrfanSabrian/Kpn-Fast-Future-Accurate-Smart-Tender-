<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-black text-slate-800 dark:text-white mb-2">
        Pengaturan Gemini AI
      </h1>
      <p class="text-slate-500 dark:text-slate-400">
        Konfigurasi API Key untuk mengaktifkan fitur scan dokumen otomatis.
      </p>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Left Column: Form -->
      <div class="space-y-6">
        <!-- Current Status System -->
        <div
          class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <h2
            class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4"
          >
            Status Koneksi
          </h2>

          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm transition-colors"
              :class="
                hasKey
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              "
            >
              <i class="fas" :class="hasKey ? 'fa-check' : 'fa-link-slash'"></i>
            </div>

            <div>
              <div class="font-bold text-slate-800 dark:text-white text-lg">
                {{ hasKey ? "Terhubung" : "Belum Dikonfigurasi" }}
              </div>
              <div class="text-sm text-slate-500 font-mono" v-if="hasKey">
                {{ maskedKey }}
              </div>
              <div class="text-sm text-slate-400" v-else>
                API Key diperlukan
              </div>
            </div>
          </div>
        </div>

        <!-- Input Form -->
        <div
          class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
        >
          <div
            class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"
          ></div>

          <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-4">
            Update API Key
          </h2>

          <div class="space-y-4">
            <div>
              <label
                class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Google Gemini API Key
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <i class="fas fa-key text-slate-400"></i>
                </div>
                <input
                  v-model="newKey"
                  :type="showKey ? 'text' : 'password'"
                  class="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white placeholder-slate-400"
                  placeholder="Paste AIza..."
                />
                <button
                  @click="showKey = !showKey"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <i
                    class="fas"
                    :class="showKey ? 'fa-eye-slash' : 'fa-eye'"
                  ></i>
                </button>
              </div>
            </div>

            <button
              @click="saveKey"
              :disabled="!newKey || saving"
              class="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:shadow-none"
            >
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              <span>{{
                saving ? "Menyimpan Perubahan..." : "Simpan Konfigurasi"
              }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Tutorial -->
      <div class="space-y-6">
        <div
          class="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/20"
        >
          <h3
            class="text-lg font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2"
          >
            <i class="fas fa-info-circle"></i>
            Cara Mendapatkan API Key
          </h3>

          <div class="space-y-4 relative">
            <div class="flex gap-4">
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800"
              >
                1
              </div>
              <div class="pt-1">
                <p class="text-sm text-slate-700 dark:text-slate-300 mb-1">
                  Kunjungi Google AI Studio
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  class="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  aistudio.google.com/app/apikey
                  <i class="fas fa-external-link-alt ml-1"></i>
                </a>
              </div>
            </div>

            <div class="flex gap-4">
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800"
              >
                2
              </div>
              <div class="pt-1">
                <p class="text-sm text-slate-700 dark:text-slate-300 mb-1">
                  Login dengan akun Google Anda dan klik tombol
                  <span class="font-bold">"Create API key"</span>.
                </p>
              </div>
            </div>

            <div class="flex gap-4">
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800"
              >
                3
              </div>
              <div class="pt-1">
                <p class="text-sm text-slate-700 dark:text-slate-300">
                  Salin API Key yang muncul (diawali dengan "AIza...") dan
                  tempelkan pada form di samping kiri.
                </p>
              </div>
            </div>

            <!-- Connector Line -->
            <div
              class="absolute top-8 left-4 bottom-8 w-0.5 bg-blue-200 dark:bg-blue-900/40 -z-10"
            ></div>
          </div>
        </div>

        <div
          class="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-100 dark:border-amber-900/20 flex gap-3 text-amber-800 dark:text-amber-400"
        >
          <i class="fas fa-shield-alt mt-1"></i>
          <div class="text-xs leading-relaxed">
            <strong>Keamanan Data:</strong> API Key Anda disimpan secara lokal
            di server dalam file konfigurasi terenkripsi dan tidak akan
            dipublikasikan ke repository kode.
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <ToastNotification ref="toast" />
  </div>
</template>

<script setup>
import ToastNotification from "~/components/ToastNotification.vue";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

const config = useRuntimeConfig();
const apiUrl = config.public.apiBaseUrl || "http://localhost:5000";

const toast = ref(null);
const hasKey = ref(false);
const maskedKey = ref("");
const newKey = ref("");
const showKey = ref(false);
const saving = ref(false);

const fetchData = async () => {
  try {
    const response = await fetch(`${apiUrl}/settings/gemini-key`);
    if (response.ok) {
      const data = await response.json();
      hasKey.value = data.hasKey;
      maskedKey.value = data.maskedKey;
    }
  } catch (error) {
    console.error("Error fetching Gemini key:", error);
  }
};

const saveKey = async () => {
  if (!newKey.value) return;

  saving.value = true;
  try {
    const response = await fetch(`${apiUrl}/settings/gemini-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apiKey: newKey.value }),
    });

    if (response.ok) {
      newKey.value = "";
      await fetchData();
      toast.value?.addToast({
        type: "success",
        title: "Tersimpan",
        message: "Gemini API Key berhasil diperbarui",
        duration: 3000,
      });
    } else {
      throw new Error("Gagal menyimpan key");
    }
  } catch (error) {
    toast.value?.addToast({
      type: "error",
      title: "Gagal",
      message: "Terjadi kesalahan saat menyimpan API Key",
      duration: 5000,
    });
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>
