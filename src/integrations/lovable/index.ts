import { supabase } from "../supabase/client";

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft", opts?: { redirect_uri?: string }) => {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: opts?.redirect_uri || `${window.location.origin}/dashboard`,
          },
        });

        if (error) {
          console.error("OAuth error:", error);
          return { error };
        }
        
        if (data.url) {
          window.location.href = data.url;
        }
        return { redirected: true };
      } catch (err) {
        console.error("OAuth catch error:", err);
        return { error: err instanceof Error ? err : new Error(String(err)) };
      }
    },
  },
};
