import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type SplitPaneProps = {
  children: [React.ReactNode, React.ReactNode];
  defaultSplit?: number;
  minSize?: number;
};

export default function SplitPane({ children, defaultSplit = 75, minSize = 20 }: SplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState(defaultSplit);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      
      const mousePosInContainer = e.clientX - containerRect.left;
      let newLeftWidth = (mousePosInContainer / containerWidth) * 100;
      
      // Apply min/max constraints
      newLeftWidth = Math.max(minSize, Math.min(100 - minSize, newLeftWidth));
      
      setLeftWidth(newLeftWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const startDrag = () => {
      isDragging.current = true;
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const dragHandle = document.querySelector(".splitpanes__splitter");
    if (dragHandle) {
      dragHandle.addEventListener("mousedown", startDrag);
    }

    return () => {
      if (dragHandle) {
        dragHandle.removeEventListener("mousedown", startDrag);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [minSize]);

  return (
    <div ref={containerRef} className="splitpanes h-[calc(100vh-96px)]">
      <div className="splitpanes__pane" style={{ flex: leftWidth }}>
        {children[0]}
      </div>
      <motion.div 
        className="splitpanes__splitter"
        whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.6)" }}
        whileTap={{ backgroundColor: "rgba(99, 102, 241, 0.8)" }}
      />
      <div className="splitpanes__pane" style={{ flex: 100 - leftWidth }}>
        {children[1]}
      </div>
    </div>
  );
}
