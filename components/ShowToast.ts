import { toast } from "sonner-native";
const duration = 3000;
export const ShowToast = (
  type: "info" | "error" | "success" | "loading" | "action",
  text1: string,
  text2: string,
  action?: {
    label: string;
    onClick: () => void;
  }
) => {
  if (type === "info") {
    toast.info(text1, {
      description: text2,
      duration: duration,
      dismissible: true,
    });
  } else if (type === "error") {
    toast.error(text1, {
      description: text2,
      duration: duration,
      dismissible: true,
    });
  } else if (type === "success") {
    toast.success(text1, {
      description: text2,
      duration: duration,
      dismissible: true,
    });
  } else if (type === "loading") {
    toast.loading(text1, {
      description: text2,
      duration: duration,
      dismissible: true,
    });
  } else if (type === "action") {
    toast(text1, {
      description: text2,
      dismissible: true,
      action,
    });
  }
};
