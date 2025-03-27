import { motion } from "framer-motion";

type UserCursorProps = {
  name: string;
  color: string;
  position: {
    top: number;
    left: number;
  };
};

export default function UserCursor({ name, color, position }: UserCursorProps) {
  return (
    <motion.div 
      className="user-cursor"
      style={{
        top: position.top,
        left: position.left
      }}
      data-name={name}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="w-0.5 h-5"
        style={{ backgroundColor: color }}
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
      />
      <motion.div
        className="absolute top-0 left-0 text-xs py-0.5 px-1.5 rounded whitespace-nowrap"
        style={{ 
          backgroundColor: color,
          color: 'white',
          transform: 'translateY(-100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {name}
      </motion.div>
    </motion.div>
  );
}
