"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  code: string;
  onNodeClick?: (id: string, label: string) => void;
  isStreaming: boolean;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  code,
  onNodeClick,
  isStreaming,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStreaming && code) {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
          },
          themeVariables: {
            // Node background & borders
            primaryColor: "#111620",
            primaryBorderColor: "rgba(99,179,237,0.25)",
            primaryTextColor: "#e8edf5",
            fontSize: "16px",
            // Secondary / tertiary nodes
            secondaryColor: "#0d1117",
            secondaryBorderColor: "rgba(255,255,255,0.08)",
            secondaryTextColor: "#7a8a9e",

            tertiaryColor: "#0a0d14",
            tertiaryBorderColor: "rgba(255,255,255,0.06)",
            tertiaryTextColor: "#7a8a9e",

            // Edges
            lineColor: "rgba(99,179,237,0.2)",
            edgeLabelBackground: "#080a0f",

            // Fonts
            fontFamily: "Syne, sans-serif",

            // Flow diagram specifics
            clusterBkg: "#0d1117",
            clusterBorder: "rgba(255,255,255,0.06)",

            // Background
            background: "transparent",
            mainBkg: "#111620",
            nodeBorder: "rgba(99,179,237,0.25)",
            titleColor: "#e8edf5",

            // Active / special nodes
            specialStateColor: "#63b3ed",
            fillType0: "#111620",
            fillType1: "#0d1117",
            fillType2: "#0a0d14",
            fillType3: "#111620",
            fillType4: "#0d1117",
            fillType5: "#0a0d14",
            fillType6: "#111620",
            fillType7: "#0d1117",
          },
        });

        mermaid.parse(code);

        mermaid.mermaidAPI
          .render(`mermaid-${Date.now()}`, code)
          .then(({ svg }) => {
            if (chartRef.current) {
              chartRef.current.innerHTML = svg;

              // Style the SVG itself
              const svgEl = chartRef.current.querySelector("svg");
              if (svgEl) {
                svgEl.style.background = "transparent";
                svgEl.style.fontFamily = "Syne, sans-serif";

                svgEl.style.width = "60%";
                svgEl.style.height = "auto";
              }

              // Attach click events + hover styles on nodes
              const nodeEls =
                chartRef.current.querySelectorAll<SVGGElement>(".node");
              nodeEls.forEach((el) => {
                const label = el.textContent?.trim() || "Unnamed Node";
                const id = el.id || label;

                el.style.cursor = "pointer";
                el.style.transition = "opacity 0.15s";

                el.addEventListener("mouseenter", () => {
                  el.style.opacity = "0.8";
                  // Glow effect on the rect/circle inside
                  const shape = el.querySelector<SVGElement>(
                    "rect, circle, polygon, ellipse",
                  );
                  if (shape) {
                    shape.style.filter =
                      "drop-shadow(0 0 6px rgba(99,179,237,0.4))";
                    shape.style.transition = "filter 0.15s";
                  }
                });

                el.addEventListener("mouseleave", () => {
                  el.style.opacity = "1";
                  const shape = el.querySelector<SVGElement>(
                    "rect, circle, polygon, ellipse",
                  );
                  if (shape) {
                    shape.style.filter = "none";
                  }
                });

                el.addEventListener("click", () => {
                  if (onNodeClick) onNodeClick(id, label);
                });
              });

              // Style edge labels
              const edgeLabels =
                chartRef.current.querySelectorAll<SVGElement>(".edgeLabel");
              edgeLabels.forEach((el) => {
                el.style.fontSize = "11px";
                el.style.fontFamily = "DM Mono, monospace";
              });
            }
          });
      } catch (error) {
        console.error("Error rendering mermaid diagram:", error);
        if (chartRef.current) {
          chartRef.current.innerHTML = `
            <div class="flex items-center gap-2 text-[#f56565] text-xl font-mono p-4 bg-[rgba(245,101,101,0.06)] border border-[rgba(245,101,101,0.15)] rounded-xl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Diagram syntax error — please retry.
            </div>
          `;
        }
      }
    }
  }, [code, onNodeClick, isStreaming]);

  return (
    <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:h-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[rgba(255,255,255,0.06)] [&::-webkit-scrollbar-thumb]:rounded-full">
      {/* Subtle inner glow frame */}
      <div className="relative min-w-max px-4 py-2">
        <div ref={chartRef} className="min-w-max [&_svg]:max-w-none text-2xl" />
      </div>
    </div>
  );
};

export default MermaidDiagram;
