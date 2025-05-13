import { create } from "zustand";

type OnboardingStoreType = {
  status: boolean,
  backendUrl: string,
  backendName: string,
  setBackendUrl: (url: string) => void,
  setBackendName: (name: string) => void,
  setOnboardingStatus: (status: boolean) => void
}

export const useOnboardingStatus = create<OnboardingStoreType>((set) => ({
  status: true,
  backendUrl: "",
  backendName: "",
  setOnboardingStatus: (status: boolean) => set({ status }),
  setBackendUrl: (url: string) => set({ backendUrl: url }),
  setBackendName: (name: string) => set({ backendName: name })
}))
