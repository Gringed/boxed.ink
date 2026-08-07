"use client";
import { useEffect, useRef, useState } from "react";

export function FadeInSection(props: any) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => setVisible(entry.isIntersecting));
    });
    observer.observe(domRef.current as any);
  }, []);
  return (
    <div
      className={`mt-0 fade-in-section ${isVisible ? "is-visible" : ""}`}
      ref={domRef as any}
    >
      {props.children}
    </div>
  );
}
