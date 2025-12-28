import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "~/composables/useToast";

export const useCompanyData = () => {
  const router = useRouter();
  const route = useRoute();
  const toast = useToast();
  const runtimeConfig = useRuntimeConfig();

  // State
  const company = ref(null);
  const subModules = ref({
    akta: [],
    nib: [],
    npwp: [],
    spt: [],
    pkp: [],
    kswp: [],
    sbu: [],
    kta: [],
    sertifikat: [],
    kontrak: [],
    cek: [],
    bpjs: [],
    pejabat: [],
  });
  const selectedItems = ref({});
  const loadingTab = ref(false);
  const activeTab = ref("overview");

  // Computed
  const companyId = computed(() => route.params.id);
  const apiBaseUrl = computed(() => runtimeConfig.public.apiBaseUrl);

  // Methods
  const fetchCompanyData = async () => {
    try {
      loadingTab.value = true;
      const response = await fetch(
        `${apiBaseUrl.value}/companies/${companyId.value}`
      );
      if (!response.ok) throw new Error("Failed to fetch company");
      const data = await response.json();
      company.value = data;
    } catch (error) {
      console.error("Error fetching company:", error);
      toast.error("Gagal memuat data perusahaan");
    } finally {
      loadingTab.value = false;
    }
  };

  const fetchSubModules = async (type) => {
    try {
      const response = await fetch(
        `${apiBaseUrl.value}/companies/${companyId.value}/${type}`
      );
      if (!response.ok) throw new Error(`Failed to fetch ${type}`);
      const data = await response.json();
      subModules.value[type] = data;
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      toast.error(`Gagal memuat data ${type}`);
    }
  };

  const refreshData = async () => {
    await fetchCompanyData();
    // Refresh active tab data if needed
    if (activeTab.value !== "overview") {
      await fetchSubModules(activeTab.value);
    }
  };

  // Utility functions
  const getInitials = (name) => {
    if (!name) return "??";
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const shouldShowLogo = (company) => {
    return (
      company?.logo_url && company.logo_url.trim() !== "" && !company.logo_error
    );
  };

  const shouldShowKop = (company) => {
    return (
      company?.kop_url && company.kop_url.trim() !== "" && !company.kop_error
    );
  };

  const getCompanyLogoUrl = (company) => {
    if (!company?.logo_url) return "";
    let url = company.logo_url;
    if (url.includes("drive.google.com") && url.includes("/view")) {
      url = url.replace("/view", "/preview");
    }
    return url;
  };

  const getCompanyKopUrl = (company) => {
    if (!company?.kop_url) return "";
    let url = company.kop_url;
    if (url.includes("drive.google.com") && url.includes("/view")) {
      url = url.replace("/view", "/preview");
    }
    return url;
  };

  const handleImageError = (event, company) => {
    console.warn("Logo failed to load:", company?.logo_url);
    if (company) {
      company.logo_error = true;
    }
  };

  const handleKopImageError = (event, company) => {
    console.warn("Kop failed to load:", company?.kop_url);
    if (company) {
      company.kop_error = true;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getPreviewUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("blob:")) return url;
    if (url.includes("drive.google.com") && url.includes("/view")) {
      return url.replace("/view", "/preview");
    }
    return url;
  };

  return {
    // State
    company,
    subModules,
    selectedItems,
    loadingTab,
    activeTab,

    // Computed
    companyId,
    apiBaseUrl,

    // Methods
    fetchCompanyData,
    fetchSubModules,
    refreshData,

    // Utilities
    getInitials,
    shouldShowLogo,
    shouldShowKop,
    getCompanyLogoUrl,
    getCompanyKopUrl,
    handleImageError,
    handleKopImageError,
    formatFileSize,
    getPreviewUrl,
  };
};
