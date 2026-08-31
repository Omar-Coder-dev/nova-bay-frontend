"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_SCRIPT_ID = "google-gsi-script";
const GOOGLE_SCRIPT_URL = "https://accounts.google.com/gsi/client";

export default function GoogleLoginButton() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error(
        "NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing from environment variables.",
      );
      return;
    }

    const handleGoogleLogin = async (response: any) => {
      if (!response?.credential) {
        toast.error("Google sign-in failed.");
        return;
      }

      try {
        const res = await api.post("/auth/google", {
          idToken: response.credential,
        });

        setUser(res.data);
        toast.success("Signed in with Google!");
        router.push("/");
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            "Google sign-in failed.",
        );
      }
    };

    const renderButton = () => {
      if (
        !window.google?.accounts?.id ||
        !buttonRef.current ||
        initializedRef.current
      ) {
        return;
      }

      initializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleLogin,
      });

      buttonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(
        buttonRef.current,
        {
          theme: "outline",
          size: "large",
          width: Math.min(
            buttonRef.current.clientWidth || 400,
            400,
          ),
          text: "continue_with",
          shape: "rectangular",
        },
      );
    };

    const existingScript =
      document.getElementById(GOOGLE_SCRIPT_ID);

    if (window.google?.accounts?.id) {
      renderButton();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        renderButton,
        { once: true },
      );

      return () => {
        existingScript.removeEventListener(
          "load",
          renderButton,
        );
      };
    }

    const script = document.createElement("script");

    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;

    script.addEventListener("load", renderButton, {
      once: true,
    });

    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", renderButton);
    };
  }, [router, setUser]);

  return (
    <div className="flex w-full justify-center overflow-hidden">
      <div
        ref={buttonRef}
        className="min-h-10 w-full max-w-100"
      />
    </div>
  );
}