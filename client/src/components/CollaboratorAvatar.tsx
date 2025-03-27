import { motion } from "framer-motion";

type CollaboratorAvatarProps = {
  name: string;
  color: string;
};

export default function CollaboratorAvatar({ name, color }: CollaboratorAvatarProps) {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return (
    <motion.div
      className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-dark-lighter text-white font-medium"
      style={{ 
        backgroundColor: color,
      }}
      title={name}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {initials}
    </motion.div>
  );
}
