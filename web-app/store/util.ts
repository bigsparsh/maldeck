import { create } from "zustand";

type OnboardingStoreType = {
  status: boolean,
  backendUrl: string,
  backendName: string,
  setBackendUrl: (url: string) => void,
  setBackendName: (name: string) => void,
  setOnboardingStatus: (status: boolean) => void
}

export type GraphStateType = {
  state: {
    time: Date,
    requestPerSec: number,
    totalRequests: number,
  }[],
  setState: ({ time, requestPerSec, totalRequests }: {
    time: string,
    requestPerSec: number,
    totalRequests: number
  }) => void;
  setCompleteGraphState: (gst: GraphStateType["state"]) => void
}

export const useOnboardingStatus = create<OnboardingStoreType>((set) => ({
  status: true,
  backendUrl: "",
  backendName: "",
  setOnboardingStatus: (status: boolean) => set({ status }),
  setBackendUrl: (url: string) => set({ backendUrl: url }),
  setBackendName: (name: string) => set({ backendName: name })
}))

export const useGraphState = create<GraphStateType>((set) => ({
  state: [],
  setCompleteGraphState: (gst: any) => set(stt => stt.state = gst),
  setState: ({
    requestPerSec,
    totalRequests
  }: {
    requestPerSec: number,
    totalRequests: number
  }) => {
    set(stt => {
      stt.state.push({
        time: new Date(),
        requestPerSec,
        totalRequests
      })
      return stt;
    })
  },
}))
