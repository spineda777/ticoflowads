import { supabase } from "../supabase/client";

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft", opts?: { redirect_uri?: string }) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: opts?.redirect_uri || `${window.location.origin}/dashboard`,
        },
      });

      if (error) return { error };
      if (data.url) {
        window.location.href = data.url;
      }
      return { redirected: true };
    },
  },
};
