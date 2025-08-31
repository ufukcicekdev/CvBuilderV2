
import { Box, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import Image from "next/image";


interface LogoProps {
  showText?: boolean;
  size?: number;
}

const Logo = ({ showText = true, size = 32 }: LogoProps) => {
  const theme = useTheme();

  const iconColor = theme.palette.primary.main;

  return (
    <Link href="/" passHref style={{ textDecoration: 'none' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
        <Image
          src="/logo.svg"
          alt="CV Builder Logo"
          width={size}
          height={size}
          style={{ objectFit: 'contain' }}
        />
        {showText && (
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            CV Builder
          </Typography>
        )}
      </Box>
    </Link>
  );
};

export default Logo;
