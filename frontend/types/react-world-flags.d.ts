declare module 'react-world-flags' {
  interface FlagProps {
    code: string;
    height?: string | number;
    width?: string | number;
    fallback?: React.ReactNode;
    style?: React.CSSProperties;
  }

  const Flag: React.FC<FlagProps>;
  export default Flag;
} 