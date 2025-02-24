'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Container, 
  Grid, 
  Typography, 
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Pagination,
  TextField,
  InputAdornment,
  Skeleton
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import Layout from '../../components/Layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import axios from 'axios';
import BlogCard from '../../components/blog/BlogCard';
import BlogSidebar from '../../components/blog/BlogSidebar';
import { BlogPost, BlogCategory } from '../../types/blog';

export default function BlogIndex() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsRes, categoriesRes] = await Promise.all([
          axios.get(`/api/blog/posts/?page=${page}&search=${searchTerm}${selectedCategory ? `&category=${selectedCategory}` : ''}`),
          axios.get('/api/blog/categories/')
        ]);
        
        setPosts(postsRes.data.results);
        setCategories(categoriesRes.data);
        setTotalPages(Math.ceil(postsRes.data.count / 9));
      } catch (error) {
        console.error('Error fetching blog data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, searchTerm, selectedCategory]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(selectedCategory === slug ? null : slug);
    setPage(1);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            {t('blog.title')}
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4 }}>
            {t('blog.description')}
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('blog.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              maxWidth: 600,
              bgcolor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { border: 'none' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Blog Posts */}
          <Grid item xs={12} md={8}>
            {loading ? (
              <Grid container spacing={3}>
                {[1, 2, 3].map((item) => (
                  <Grid item xs={12} key={item}>
                    <Skeleton variant="rectangular" height={300} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <>
                <Grid container spacing={3}>
                  {posts.map((post) => (
                    <Grid item xs={12} key={post.id}>
                      <BlogCard post={post} />
                    </Grid>
                  ))}
                </Grid>
                {totalPages > 1 && (
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <BlogSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryClick={handleCategoryClick}
            />
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
}

export const getStaticProps = async ({ locale = 'tr' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}; 