import { useEffect } from "react";

const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://chashka.cafe";

interface SeoMeta {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setOgMeta(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useSeoMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  canonical,
}: SeoMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    setMeta("description", description);
    setOgMeta("og:title", ogTitle ?? title);
    setOgMeta("og:description", ogDescription ?? description);
    setOgMeta("og:url", canonical ?? `${SITE_URL}${window.location.pathname}`);

    if (ogImage) setOgMeta("og:image", ogImage);
    if (canonical) setCanonical(canonical);

    setMeta("twitter:title", ogTitle ?? title);
    setMeta("twitter:description", ogDescription ?? description);
    if (ogImage) setMeta("twitter:image", ogImage);

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, ogTitle, ogDescription, ogImage, canonical]);
}
