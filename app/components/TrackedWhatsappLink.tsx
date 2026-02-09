"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

const GOOGLE_ADS_SEND_TO = "AW-17932575934/JjsKCKOauvUbEL7J9eZC";

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: "conversion",
      params: {
        send_to: string;
        value: number;
        currency: string;
        event_callback: () => void;
      }
    ) => void;
  }
}

type TrackedWhatsappLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export default function TrackedWhatsappLink({
  href,
  target,
  rel,
  onClick,
  ...props
}: TrackedWhatsappLinkProps) {
  const safeRel = target === "_blank" ? (rel ?? "noopener noreferrer") : rel;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !href || href === "#") {
      return;
    }

    event.preventDefault();

    const navigate = () => {
      if (target === "_blank") {
        window.open(href, "_blank", "noopener,noreferrer");
        return;
      }

      window.location.href = href;
    };

    if (typeof window.gtag !== "function") {
      navigate();
      return;
    }

    let navigated = false;
    const done = () => {
      if (navigated) return;
      navigated = true;
      navigate();
    };

    window.gtag("event", "conversion", {
      send_to: GOOGLE_ADS_SEND_TO,
      value: 1.0,
      currency: "CLP",
      event_callback: done,
    });

    window.setTimeout(done, 1200);
  };

  return (
    <a
      {...props}
      href={href}
      target={target}
      rel={safeRel}
      onClick={handleClick}
    />
  );
}
