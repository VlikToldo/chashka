import { useEffect } from "react";

interface SeoMeta {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
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

export function useSeoMeta({ title, description, ogTitle, ogDescription }: SeoMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    setMeta("description", description);
    setOgMeta("og:title", ogTitle ?? title);
    setOgMeta("og:description", ogDescription ?? description);

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, ogTitle, ogDescription]);
}
