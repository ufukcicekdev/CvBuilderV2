import React, { ReactNode } from 'react';
import Head from 'next/head';
import { Box, Container, CssBaseline } from '@mui/material';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'CV Builder', 
  maxWidth = 'lg'
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="CV Builder - Profesyonel özgeçmişinizi oluşturun" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
          <Container maxWidth={maxWidth}>
            {children}
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Layout; 