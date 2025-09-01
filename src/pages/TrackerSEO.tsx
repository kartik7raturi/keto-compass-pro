import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SEO = () => {
  useEffect(() => {
    const title = "Tracker Hub | Ketopia";
    const description = "Access all tracking tools: 30-day keto, fasting, workouts, water, and macros.";
    document.title = title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = description;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, []);
  return null;
};

// This file augments the tracker landing page with SEO.
// Kept minimal to respect existing layout and design system.
export default function TrackerSEOWrapper() {
  useToast(); // ensure toast provider hydrated
  return <SEO />;
}
